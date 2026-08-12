/* ============================================================
 * main.js — 状态管理 + 核心循环
 * ============================================================ */

const State = {
  coin: CONFIG.START_COIN,
  // 当前待拆的快递（购买后写入，拆完清空）
  pending: null,  // { tierId, ... }
  // 技能等级
  skillLv: {},    // { skillId: level }
  // 幸运值（每档独立等级）—— 首页主升级
  luckyLv: { ordinary: 0, premium: 0, luxury: 0 },
  // 广告冷却（已废弃，保留字段以兼容旧存档）
  adNextTime: 0,
  // 自动拆包器
  autoOpenUnlocked: false,
  autoOpenSpeedLv: 0,     // 拆包加速等级
  autoSellUnlocked: true, // 默认开启（硬约束）
  autoOpenTimer: null,
  autoBulkUnlocked: false,
  autoBulkTier: 'ordinary',
  // 自动补货
  autoRestockUnlocked: false,
  autoRestockTier: 'ordinary',  // 续包档位（默认普通，玩家手动买过的最后一个档）
  // 保底机制
  firstOpenCount: 0,      // 已开包次数（首抽保护用）
  noRareStreak: 0,        // 连续没出稀有的次数（运气象用）
};

/* ---------- 存档 ---------- */
function save() {
  try {
    const data = {
      coin: State.coin,
      skillLv: State.skillLv,
      luckyLv: State.luckyLv,
      autoOpenUnlocked: State.autoOpenUnlocked,
      autoOpenSpeedLv: State.autoOpenSpeedLv,
      autoSellUnlocked: State.autoSellUnlocked,
      autoBulkUnlocked: State.autoBulkUnlocked,
      autoRestockUnlocked: State.autoRestockUnlocked,
      autoRestockTier: State.autoRestockTier,
      firstOpenCount: State.firstOpenCount,
      noRareStreak: State.noRareStreak,
    };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('存档失败', e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.coin === 'number') State.coin = data.coin;
    if (data.skillLv && typeof data.skillLv === 'object') State.skillLv = data.skillLv;
    if (data.luckyLv && typeof data.luckyLv === 'object') {
      // 合并存档：缺失档位补 0
      State.luckyLv.ordinary = data.luckyLv.ordinary || 0;
      State.luckyLv.premium = data.luckyLv.premium || 0;
      State.luckyLv.luxury = data.luckyLv.luxury || 0;
    }
    if (typeof data.autoOpenUnlocked === 'boolean') State.autoOpenUnlocked = data.autoOpenUnlocked;
    if (typeof data.autoOpenSpeedLv === 'number') State.autoOpenSpeedLv = data.autoOpenSpeedLv;
    if (typeof data.autoSellUnlocked === 'boolean') State.autoSellUnlocked = data.autoSellUnlocked;
    if (typeof data.autoBulkUnlocked === 'boolean') State.autoBulkUnlocked = data.autoBulkUnlocked;
    if (typeof data.autoRestockUnlocked === 'boolean') State.autoRestockUnlocked = data.autoRestockUnlocked;
    if (typeof data.autoRestockTier === 'string') State.autoRestockTier = data.autoRestockTier;
    if (typeof data.firstOpenCount === 'number') State.firstOpenCount = data.firstOpenCount;
    if (typeof data.noRareStreak === 'number') State.noRareStreak = data.noRareStreak;
  } catch (e) {
    console.warn('读档失败', e);
  }
}

/* ---------- 工具 ---------- */
function formatCoin(n) {
  return Math.floor(n).toLocaleString('en-US');
}

function getSkillLv(id) {
  return State.skillLv[id] || 0;
}

function isSkillUnlocked(id) {
  const def = SKILL[id];
  if (!def) return false;
  // 有 requires 的要先解锁前置
  if (def.requires && !isSkillUnlocked(def.requires)) return false;
  return getSkillLv(id) > 0;
}

function getSkillCost(id) {
  const def = SKILL[id];
  if (!def) return Infinity;
  if (def.oneTime) return def.costBase;
  const lv = getSkillLv(id);
  return Math.floor(def.costBase * Math.pow(def.costMult, lv));
}

function isMaxLevel(id) {
  const def = SKILL[id];
  if (!def) return false;
  if (def.oneTime) return isSkillUnlocked(id);
  return getSkillLv(id) >= def.maxLevel;
}

/* 汇总所有激活的技能效果（仅价值加成 + 自动化） */
function getEffects() {
  const fx = {
    valueMult: 1,     // 价值倍率（来自 A_value）
    autoIntervalDiscount: 0, // 自动拆包间隔折扣
  };
  for (const id in SKILL) {
    const def = SKILL[id];
    const lv = getSkillLv(id);
    if (lv > 0 && def.effect) {
      const e = def.effect(lv);
      Object.assign(fx, e);
    }
  }
  return fx;
}

/* ========== 幸运值系统 ========== */
function getLuckyLv(tierId) {
  return (State.luckyLv && State.luckyLv[tierId]) || 0;
}

function getLuckyCost(tierId) {
  const lv = getLuckyLv(tierId);
  if (lv >= LUCKY.MAX_LEVEL) return Infinity;
  const cfg = (LUCKY.COST && LUCKY.COST[tierId]) || { base: 50, mult: 2 };
  return Math.floor(cfg.base * Math.pow(cfg.mult, lv));
}

function isLuckyMax(tierId) {
  return getLuckyLv(tierId) >= LUCKY.MAX_LEVEL;
}

/* 升级指定档位的幸运值（首页弹窗调用） */
function upgradeLucky(tierId) {
  if (isLuckyMax(tierId)) return { ok: false, msg: '已满级' };
  const cost = getLuckyCost(tierId);
  if (State.coin < cost) return { ok: false, msg: '金币不足' };
  State.coin -= cost;
  State.luckyLv[tierId] = getLuckyLv(tierId) + 1;
  save();
  return { ok: true };
}

/* 预览指定档位再升 N 级，所有赚钱物品的总权重增量（用于弹窗展示） */
function previewLuckyRareBonus(tierId, nextLv) {
  const lv = nextLv != null ? nextLv : getLuckyLv(tierId);
  const tier = TIER[tierId];
  if (!tier) return 0;
  // 统计所有赚钱物品的权重增量总和（隐藏款不参与幸运加成）
  let total = 0;
  for (const it of tier.items) {
    if (it.value > tier.price && !it.hidden) {
      total += lv * (LUCKY.EFFECT_PER_LEVEL[tierId] || 0) * 100;
    }
  }
  return total;
}

/* 幸运值对单个物品的权重加成：仅赚钱物品（value > price）获得，亏钱物品不增加
 * 满级（Lv.10）时：
 *   普通包：赚钱物品（小玩具+耳机）权重 +12*lv → 期望 +1.9 扭到 +5
 *   精品包：赚钱物品（手表+手机）权重 +0.8*lv → 仍亏但回升
 *   豪华包：赚钱物品（金饰+笔记本）权重 +0.2*lv → 仍亏
 */
function luckyWeightBonus(tierId, item) {
  const tier = TIER[tierId];
  if (!tier) return 0;
  // 亏钱物品（value <= price）不获得幸运加成，概率相对下降
  if (item.value <= tier.price) return 0;
  const lv = getLuckyLv(tierId);
  // 隐藏款：单独加成（每级 0.5%，满级 5%）
  if (item.hidden) {
    return lv * (LUCKY.HIDDEN_BONUS_PER_LEVEL || 0) * 100;
  }
  // 普通赚钱物品：按档位加成
  const eff = (LUCKY.EFFECT_PER_LEVEL && LUCKY.EFFECT_PER_LEVEL[tierId]) || 0;
  return lv * eff * 100;
}

/* ============================================================
 * 核心：rollItem — 抽物品（含保底）
 * ============================================================ */
function rollItem(tierId) {
  const tier = TIER[tierId];
  const fx = getEffects();
  const items = tier.items.map(it => {
    let w = it.weight;
    // 幸运值：所有赚钱物品（value > price）权重都增加，亏钱物品相对概率下降
    w = w + luckyWeightBonus(tierId, it);
    return { ...it, _w: w };
  });
  const total = items.reduce((s, it) => s + it._w, 0);

  // === 保底判定 ===
  const needFirstProtect = State.firstOpenCount < PITY.FIRST_OPEN_PROTECT;
  const needRarePity = State.noRareStreak >= PITY.RARE_STREAK;

  // 决定候选池
  let candidates = items;
  if (needFirstProtect) {
    candidates = items.filter(it => !it.bad);
  }
  if (needRarePity) {
    // 运气象触发：只在确实存在稀有时生效
    const rares = items.filter(it => it.rare);
    if (rares.length > 0) candidates = rares;
  }
  if (candidates.length === 0) candidates = items;  // 极端兜底

  const cTotal = candidates.reduce((s, it) => s + it._w, 0);
  let r = Math.random() * cTotal;
  let picked = candidates[candidates.length - 1];  // 兜底
  for (const it of candidates) {
    r -= it._w;
    if (r <= 0) { picked = it; break; }
  }

  // 物品价值（仅由 A_value 技能影响）
  const value = Math.floor(picked.value * fx.valueMult);

  // === 更新保底计数 ===
  State.firstOpenCount += 1;
  if (picked.rare) {
    State.noRareStreak = 0;
  } else {
    State.noRareStreak += 1;
  }
  save();

  return {
    ...picked,
    finalValue: value,
    isCrit: false,
    isBad: !!picked.bad,
    isHidden: !!picked.hidden,
    isFirstProtect: needFirstProtect,
    isRarePity: needRarePity && !!picked.rare,
    noRareStreakNext: State.noRareStreak,
  };
}

/* ---------- 买快递 ---------- */
function buyParcel(tierId) {
  // 已有待拆的不能买
  if (State.pending) return { ok: false, msg: '还有快递没拆' };
  const tier = TIER[tierId];
  if (State.coin < tier.price) return { ok: false, msg: '金币不足' };
  State.coin -= tier.price;
  State.pending = { tierId, ts: Date.now() };
  // 注意：buyParcel 不再修改 autoRestockTier，续包档位由玩家通过"续包档位切换 chip"独立控制
  save();
  return { ok: true };
}

/* ---------- 自动补货（拆完 → 自动买同档位 → 放到台上）---------- */
function tryAutoRestock() {
  if (!State.autoRestockUnlocked) {
    console.log('[自动补货] 未解锁');
    return { ok: false, reason: 'not-unlocked' };
  }
  if (State.pending) {
    console.log('[自动补货] 已有快递在台上');
    return { ok: false, reason: 'has-pending' };
  }
  const tier = TIER[State.autoRestockTier];
  if (State.coin < tier.price) {
    console.log('[自动补货] 金币不足:', State.coin, '/', tier.price);
    return { ok: false, reason: 'no-coin' };
  }
  const r = buyParcel(State.autoRestockTier);
  if (!r.ok) {
    console.log('[自动补货] buyParcel 失败:', r.msg);
    return { ok: false, reason: 'buy-failed', msg: r.msg };
  }
  if (typeof UI !== 'undefined' && UI.showParcel) {
    UI.showParcel(State.autoRestockTier);
    console.log('[自动补货] 成功放入台上, tier=', State.autoRestockTier);
    return { ok: true };
  }
  return { ok: false, reason: 'no-ui' };
}

/* ---------- 划封带交互 ---------- */
function getSwipeThreshold() {
  // A_swipe 技能已移除，固定 100px
  return CONFIG.SWIPE.BASE_THRESHOLD;
}

/* 状态机：sealed → opening → opened → cleared */
function setParcelState(state) {
  const el = document.getElementById('parcel');
  if (el) el.dataset.state = state;
}

function onSwipeStart(e) {
  if (!State.pending) return;
  if (getParcelState() !== 'sealed') return;
  setParcelState('opening');
  e.preventDefault();
}

function onSwipeMove(e) {
  if (getParcelState() !== 'opening') return;
  e.preventDefault();
  // 计算水平滑动距离
  const touch = e.touches ? e.touches[0] : e;
  const parcel = document.getElementById('parcel');
  if (!parcel) return;
  const rect = parcel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  // 划封带：从中心开始算水平位移
  const dx = Math.abs(touch.clientX - (State._swipeStartX || centerX));
  const threshold = getSwipeThreshold();
  const progress = Math.min(1, dx / threshold);
  // 横封带用 clip-path 擦除
  const tapeH = document.getElementById('parcelTapeH');
  if (tapeH) tapeH.style.clipPath = `inset(0 0 0 ${progress * 100}%)`;
  // 记录起始 X
  if (!State._swipeStartX) State._swipeStartX = touch.clientX;
  if (progress >= 1) {
    openParcel();
  }
}

function onSwipeEnd(e) {
  if (getParcelState() === 'opening') {
    // 没划够，弹回
    setParcelState('sealed');
    const tapeH = document.getElementById('parcelTapeH');
    if (tapeH) tapeH.style.clipPath = 'inset(0 0 0 0)';
  }
  State._swipeStartX = null;
}

function getParcelState() {
  const el = document.getElementById('parcel');
  return el ? el.dataset.state : '';
}

function openParcel() {
  if (!State.pending) return;
  setParcelState('opened');
  // 竖封带也擦除
  const tapeV = document.getElementById('parcelTapeV');
  if (tapeV) tapeV.style.clipPath = 'inset(0 0 0 0)';
  // 滚物品
  const item = rollItem(State.pending.tierId);
  // 触发 UI 动画（UI 层）
  if (typeof UI !== 'undefined' && UI.onItemRolled) UI.onItemRolled(item, State.pending.tierId);
  // 物品飞完后清空快递盒（让玩家看到"开盒了"的状态）
  setTimeout(() => {
    State.pending = null;
    save();
    if (typeof UI !== 'undefined' && UI.onParcelCleared) UI.onParcelCleared();
    // 清空后再触发自动补货（此时 pending 已 null，新快递可以放到台上）
    if (State.autoRestockUnlocked) {
      setTimeout(() => {
        const r = tryAutoRestock();
        if (typeof UI !== 'undefined' && UI.spawnPityTag) {
          if (r && r.ok) {
            UI.spawnPityTag('restock');
          } else if (r && r.reason) {
            // 失败时飘诊断横幅，告诉用户原因
            const reasonText = {
              'not-unlocked': '🔒 未解锁',
              'has-pending': '⏳ 已有快递',
              'no-coin': '💰 金币不足',
              'buy-failed': '❌ ' + (r.msg || '购买失败'),
              'no-ui': '❌ UI 未就绪',
            }[r.reason] || '❌ 失败';
            UI.spawnPityTag('restock-fail', reasonText);
          }
        }
      }, 200);
    }
  }, 1800);
}

/* ---------- 技能升级 ---------- */
function upgradeSkill(id) {
  const def = SKILL[id];
  if (!def) return { ok: false, msg: '技能不存在' };
  if (def.requires && !isSkillUnlocked(def.requires)) {
    return { ok: false, msg: '先解锁前置技能' };
  }
  if (isMaxLevel(id)) return { ok: false, msg: '已满级' };
  const cost = getSkillCost(id);
  if (State.coin < cost) return { ok: false, msg: '金币不足' };
  State.coin -= cost;
  State.skillLv[id] = getSkillLv(id) + 1;
  // 同步自动化状态
  if (id === 'B_autoOpen') {
    State.autoOpenUnlocked = true;
    startAutoOpen();
  }
  if (id === 'B_openSpeed') {
    State.autoOpenSpeedLv = getSkillLv(id);
    restartAutoOpen();
  }
  if (id === 'B_autoSell') State.autoSellUnlocked = true;
  if (id === 'B_bulkBuy') State.autoBulkUnlocked = true;
  if (id === 'B_restock') State.autoRestockUnlocked = true;
  save();
  return { ok: true };
}

/* ---------- 自动拆包器 ---------- */
function getAutoInterval() {
  if (!State.autoOpenUnlocked) return 0;
  const fx = getEffects();
  return Math.max(0.5, 3 - fx.autoIntervalDiscount);
}

function startAutoOpen() {
  stopAutoOpen();
  if (!State.autoOpenUnlocked) return;
  const ms = getAutoInterval() * 1000;
  State.autoOpenTimer = setInterval(autoOpenTick, ms);
  // 立即刷一次间隔
  restartAutoOpen();
}

function restartAutoOpen() {
  if (!State.autoOpenUnlocked) return;
  stopAutoOpen();
  const ms = getAutoInterval() * 1000;
  State.autoOpenTimer = setInterval(autoOpenTick, ms);
}

function stopAutoOpen() {
  if (State.autoOpenTimer) {
    clearInterval(State.autoOpenTimer);
    State.autoOpenTimer = null;
  }
}

function autoOpenTick() {
  // 如果有待拆的快递，跳过这一拍
  if (State.pending) return;
  // 选档位
  const tierId = State.autoBulkUnlocked ? State.autoBulkTier : 'ordinary';
  const tier = TIER[tierId];
  if (State.coin < tier.price) return; // 金币不够静默跳过
  State.coin -= tier.price;
  // 直接滚物品并入账
  const item = rollItem(tierId);
  const gain = item.finalValue;
  State.coin += gain;
  save();
  if (typeof UI !== 'undefined' && UI.onAutoOpen) {
    UI.onAutoOpen(tierId, item, gain);
  }
}

/* ---------- 当前属性（用于 modal 展示）---------- */
function getCurrentStats() {
  const fx = getEffects();
  const tiers = {};
  for (const tierId in TIER) {
    const tier = TIER[tierId];
    const items = tier.items.map(it => {
      let w = it.weight;
      // 幸运值：所有赚钱物品权重都增加，亏钱物品相对概率下降
      w = w + luckyWeightBonus(tierId, it);
      return { ...it, _w: w };
    });
    const total = items.reduce((s, it) => s + it._w, 0);
    // 期望 = Σ(item.value × valueMult × weight/total)
    const expectedValue = items.reduce((s, it) => {
      return s + (it.value * fx.valueMult) * (it._w / total);
    }, 0);
    const expectedProfit = expectedValue - tier.price;
    const expectedROI = expectedValue / tier.price;
    const baseTotal = items.reduce((s, it) => s + it.weight, 0);
    const rows = items
      .map(it => {
        const pct = total > 0 ? (it._w / total) * 100 : 0;
        const basePct = (it.weight / baseTotal) * 100;
        return {
          emoji: it.emoji,
          name: it.name,
          value: it.value,
          pct: pct,
          basePct: basePct,
          delta: pct - basePct,
          isBad: !!it.bad,
          isRare: !!it.rare,
          isHidden: !!it.hidden,
        };
      })
      .sort((a, b) => a.value - b.value);  // 按价值升序：最差在上，最好在下
    // 找到稀有物当前概率
    const rareRow = rows.find(r => r.isRare);
    const rarePct = rareRow ? rareRow.pct : 0;
    // 赚钱概率：所有 value > price 的物品概率之和
    const winPct = rows
      .filter(r => r.value > tier.price)
      .reduce((s, r) => s + r.pct, 0);
    tiers[tierId] = {
      name: tier.cn,
      label: tier.label,
      icon: tier.icon,
      price: tier.price,
      items: rows,
      expectedValue: expectedValue,
      expectedProfit: expectedProfit,
      expectedROI: expectedROI,
      luckyLv: getLuckyLv(tierId),
      luckyMaxLv: LUCKY.MAX_LEVEL,
      rarePct: rarePct,
      winPct: winPct,
    };
  }
  return {
    tiers,
    effects: fx,
    autoInterval: getAutoInterval(),
    autoOpenUnlocked: State.autoOpenUnlocked,
    autoSellUnlocked: State.autoSellUnlocked,
    autoBulkUnlocked: State.autoBulkUnlocked,
    autoBulkTier: State.autoBulkTier,
    autoRestockUnlocked: State.autoRestockUnlocked,
    autoRestockTier: State.autoRestockTier,
  };
}

/* ---------- 初始化 ---------- */
function initState() {
  load();
  // 自动售卖站默认开启（硬约束）
  State.autoSellUnlocked = true;
  if (State.autoOpenUnlocked) startAutoOpen();
}
