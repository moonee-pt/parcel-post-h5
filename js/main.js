/* ============================================================
 * main.js — 状态管理 + 核心循环
 * ============================================================ */

const State = {
  coin: CONFIG.START_COIN,
  // 当前待拆的盲盒（购买后写入，拆完清空）
  pending: null,  // { tierId, ... }
  // 技能等级
  skillLv: {},    // { skillId: level }
  // 幸运值（每档独立等级）—— 首页主升级
  luckyLv: { ordinary: 0, premium: 0, luxury: 0, epic: 0, mythic: 0 },
  // 广告冷却（已废弃，保留字段以兼容旧存档）
  adNextTime: 0,
  // 自动拆包机器人
  autoOpenUnlocked: false,
  autoOpenSpeedLv: 0,     // 拆包加速等级
  autoSellUnlocked: true, // 默认开启（硬约束）
  autoOpenTimer: null,
  ordNoProfitStreak: 0,   // 普通包裹连续没出"小玩具/耳机"的次数（5 次保底）
  // 机器人分拣强化等级（0=只拆普通，1=+精品，2=+豪华，3=+至尊，4=+传说）
  autoTierLv: 0,
  // 旧字段保留兼容旧存档（升级后会迁移到 autoTierLv）
  autoBulkUnlocked: false,
  // 机器人可拆的档位（受「机器人分拣强化」等级限制）
  autoOpenTier: 'ordinary',  // 玩家点 chip 切换
  autoOpenPaused: false,     // 玩家暂停开关（不删档，仅暂停自动拆包）
  // 自动补货
  autoRestockUnlocked: false,
  autoRestockTier: 'ordinary',  // 续包档位（默认普通，玩家手动买过的最后一个档）
  nextPending: null,            // 预备队：自动补货的"下一个"盲盒，玩家拆当前时已买好
  // 机器人挂机存储（拆出来先入存储，用户点领取才入 coin）
  idleStorage: 0,           // 当前暂存金币
  idleStorageMax: 50,       // 上限（基础 50；技能 B_idleStorageLv 提升）
  lastStorageFullToast: 0,  // 保留兼容旧字段（已废弃）
  lastCantAffordToast: 0,   // 保留兼容旧字段（已废弃）
  autoOpenBlockReason: null,  // 系统原因暂停：'cantAfford' | 'storageFull' | null（玩家手动暂停时为 null）
  // 保底机制
  firstOpenCount: 0,      // 保留兼容旧存档（已废弃）
  noRareStreak: 0,        // 保留兼容旧存档（已废弃）
  // 保底机制：只有普通包裹有"5 次没出正收益 → 必出"
  ordNoProfitStreak: 0,
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
      autoOpenTier: State.autoOpenTier,
      autoOpenPaused: State.autoOpenPaused,
      autoSellUnlocked: State.autoSellUnlocked,
      autoTierLv: State.autoTierLv,
      autoRestockUnlocked: State.autoRestockUnlocked,
      autoRestockTier: State.autoRestockTier,
      autoRestockPaused: State.autoRestockPaused,
      idleStorage: State.idleStorage,
      idleStorageMax: State.idleStorageMax,
      ordNoProfitStreak: State.ordNoProfitStreak,
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
      // 合并存档：缺失档位补 0（含 epic / mythic，老存档只有前 3 档）
      State.luckyLv.ordinary = data.luckyLv.ordinary || 0;
      State.luckyLv.premium  = data.luckyLv.premium  || 0;
      State.luckyLv.luxury   = data.luckyLv.luxury   || 0;
      State.luckyLv.epic     = data.luckyLv.epic     || 0;
      State.luckyLv.mythic   = data.luckyLv.mythic   || 0;
    }
    if (typeof data.autoOpenUnlocked === 'boolean') State.autoOpenUnlocked = data.autoOpenUnlocked;
    if (typeof data.autoOpenSpeedLv === 'number') State.autoOpenSpeedLv = data.autoOpenSpeedLv;
    if (typeof data.autoOpenTier === 'string') State.autoOpenTier = data.autoOpenTier;
    if (typeof data.autoOpenPaused === 'boolean') State.autoOpenPaused = data.autoOpenPaused;
    else State.autoOpenPaused = false;
    if (typeof data.autoSellUnlocked === 'boolean') State.autoSellUnlocked = data.autoSellUnlocked;
    // 机器人分拣强化：优先读新字段；旧存档用 autoBulkUnlocked 迁移（true → Lv.4 全开）
    if (typeof data.autoTierLv === 'number') {
      State.autoTierLv = data.autoTierLv;
    } else if (data.autoBulkUnlocked === true) {
      State.autoTierLv = 4;
    }
    if (typeof data.autoRestockUnlocked === 'boolean') State.autoRestockUnlocked = data.autoRestockUnlocked;
    if (typeof data.autoRestockTier === 'string') State.autoRestockTier = data.autoRestockTier;
    if (typeof data.autoRestockPaused === 'boolean') State.autoRestockPaused = data.autoRestockPaused;
    else State.autoRestockPaused = false;
    if (typeof data.idleStorage === 'number') State.idleStorage = data.idleStorage;
    if (typeof data.idleStorageMax === 'number') State.idleStorageMax = data.idleStorageMax;
    if (typeof data.ordNoProfitStreak === 'number') State.ordNoProfitStreak = data.ordNoProfitStreak;
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
 * 保底规则：只有普通包裹（10 块）有保底——连续 5 次没出"小玩具/耳机"（正收益物品），下次必出其一
 * 其他档位（精品/豪华/至尊/传说）无保底，靠玩家幸运值升级和自身财商
 * ============================================================ */
function rollItem(tierId) {
  const tier = TIER[tierId];
  const fx = getEffects();
  const items = tier.items.map(it => {
    let w = it.weight;
    w = w + luckyWeightBonus(tierId, it);
    return { ...it, _w: w };
  });

  // === 普通包裹保底判定 ===
  // "正收益物品" = 小玩具（12）和耳机（40），这两个的 value > 普通包裹价格 10
  let candidates = items;
  let isOrdinaryPity = false;
  if (tierId === 'ordinary') {
    const profitItems = items.filter(it => it.name === '小玩具' || it.name === '耳机');
    if (profitItems.length > 0 && (State.ordNoProfitStreak || 0) >= PITY.ORDINARY_PROFIT_STREAK) {
      candidates = profitItems;
      isOrdinaryPity = true;
    }
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

  // === 更新保底计数（只对普通包裹维护）===
  if (tierId === 'ordinary') {
    const isProfit = picked.name === '小玩具' || picked.name === '耳机';
    State.ordNoProfitStreak = isProfit ? 0 : ((State.ordNoProfitStreak || 0) + 1);
  }
  save();

  return {
    ...picked,
    finalValue: value,
    isCrit: false,
    isBad: !!picked.bad,
    isHidden: !!picked.hidden,
    isOrdinaryPity,
  };
}

/* ---------- 买盲盒 ---------- */
function buyParcel(tierId) {
  // 已有待拆的不能买
  if (State.pending) return { ok: false, msg: '还有盲盒没拆' };
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
  if (!State.autoRestockUnlocked || State.autoRestockPaused) {
    return { ok: false, reason: 'not-unlocked' };
  }
  const tier = TIER[State.autoRestockTier];
  if (State.coin < tier.price) {
    return { ok: false, reason: 'no-coin' };
  }
  // 如果台上已有盲盒 → 准备到 nextPending 预备队（仅逻辑预存，无视觉）
  if (State.pending) {
    if (State.nextPending) {
      return { ok: false, reason: 'has-next' };
    }
    State.coin -= tier.price;
    State.nextPending = { tierId: State.autoRestockTier, ts: Date.now() };
    save();
    return { ok: true, where: 'next' };
  }
  // 台上空 → 直接买并放到台上
  const r = buyParcel(State.autoRestockTier);
  if (!r.ok) {
    return { ok: false, reason: 'buy-failed', msg: r.msg };
  }
  if (typeof UI !== 'undefined' && UI.showParcel) {
    UI.showParcel(State.autoRestockTier);
  }
  return { ok: true, where: 'main' };
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
  // ★ 关键：物品一开始飞，就立即准备下一个盲盒（预备队），并立刻扣钱
  if (State.autoRestockUnlocked) {
    const r = tryAutoRestock();
    if (r && r.ok && r.where === 'next' && typeof UI !== 'undefined') {
      // 同步刷新金币显示 + 在金币 pill 下方飘 "-X ◉" 提示
      UI.refreshCoin();
      UI.refreshBuyRow();
      UI.showCoinDeduct(TIER[State.autoRestockTier].price);
    }
  }
  // 物品飞完后清空盲盒盒
  setTimeout(() => {
    State.pending = null;
    save();
    // ★ 如果预备队里有盲盒，无缝换到主位（玩家根本看不到空台）
    if (State.nextPending) {
      State.pending = State.nextPending;
      State.nextPending = null;
      save();
      if (typeof UI !== 'undefined') {
        UI.swapToNextParcel();
        UI.refreshCoin();
        UI.refreshBuyRow();
      }
    } else {
      if (typeof UI !== 'undefined' && UI.onParcelCleared) UI.onParcelCleared();
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
  if (id === 'B_autoTier') State.autoTierLv = getSkillLv(id);
  if (id === 'B_idleStorageLv') {
    // 扩容仓库：按等级动态计算上限（数值后面会一起调小）
    const lv = getSkillLv(id);
    const def = SKILL[id];
    const fx = def && def.effect ? def.effect(lv) : null;
    if (fx && typeof fx.idleStorageMax === 'number') {
      State.idleStorageMax = fx.idleStorageMax;
    }
  }
  if (id === 'B_restock') {
    State.autoRestockUnlocked = true;
    // 购买后立即尝试准备一个（如果台上空→放台上；台上有→放预备队）
    tryAutoRestock();
  }
  save();
  return { ok: true };
}

/* ---------- 自动拆包机器人 ---------- */
function getAutoInterval() {
  if (!State.autoOpenUnlocked) return 0;
  const fx = getEffects();
  return Math.max(0.5, 5 - fx.autoIntervalDiscount);
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
  // 机器人独立买+拆，不依赖 stage 上的 pending
  // 档位优先：受「机器人分拣强化」等级限制 → 超出范围自动降级到最高解锁档
  const tierOrder = ['ordinary', 'premium', 'luxury', 'epic', 'mythic'];
  const maxIdx = State.autoTierLv || 0;  // 0-4：当前机器人能拆到的最高档位索引
  let tierId = State.autoOpenTier;
  const curIdx = tierOrder.indexOf(tierId);
  if (curIdx > maxIdx) tierId = tierOrder[maxIdx];
  const tier = TIER[tierId];
  const cost = tier.price;

  // === 前置检查（按顺序短路）===
  // 0a) 系统原因已解除 → 自动恢复（必须在 paused 短路之前，否则手动 paused 后系统原因永远解不掉）
  if (State.autoOpenBlockReason === 'cantAfford' && State.coin >= cost) {
    State.autoOpenBlockReason = null;
    State.autoOpenPaused = false;
    if (typeof UI !== 'undefined' && UI.refreshRobotChip) UI.refreshRobotChip();
  } else if (State.autoOpenBlockReason === 'storageFull' && State.idleStorage < State.idleStorageMax) {
    State.autoOpenBlockReason = null;
    State.autoOpenPaused = false;
    if (typeof UI !== 'undefined' && UI.refreshRobotChip) UI.refreshRobotChip();
  }
  // 0) 玩家主动暂停 → 静默 return
  if (State.autoOpenPaused) return;
  // 1) 玩家金币 < cost → 暂停 + 头顶"金币不足"
  if (State.coin < cost) {
    if (State.autoOpenBlockReason !== 'cantAfford') {
      State.autoOpenPaused = true;
      State.autoOpenBlockReason = 'cantAfford';
      if (typeof UI !== 'undefined' && UI.refreshRobotChip) UI.refreshRobotChip();
    }
    return;
  }
  // 2) 存储已满 → 暂停拆包
  if (State.idleStorage >= State.idleStorageMax) {
    if (State.autoOpenBlockReason !== 'storageFull') {
      State.autoOpenPaused = true;
      State.autoOpenBlockReason = 'storageFull';
      if (typeof UI !== 'undefined' && UI.refreshRobotChip) UI.refreshRobotChip();
    }
    return;
  }
  // 3) 扣 cost（从 State.coin 扣，玩家金币静默减少，不 bump）+ roll
  State.coin -= cost;
  const item = rollItem(tierId);
  const gain = item.finalValue;
  const net = gain - cost;
  // 4) 净亏会让存储变负 → 回滚 cost，飘 -X 提示，保持 idleStorage >= 0
  if (State.idleStorage + net < 0) {
    State.coin += cost;  // 回滚 State.coin
    if (typeof UI !== 'undefined' && UI.onAutoOpen) {
      UI.onAutoOpen(tierId, item, cost, gain, net);
    }
    return;
  }
  // 正常入存储（防御性限制到 [0, max]）
  State.idleStorage = Math.max(0, Math.min(State.idleStorage + net, State.idleStorageMax));
  save();
  if (typeof UI !== 'undefined' && UI.onAutoOpen) {
    UI.onAutoOpen(tierId, item, cost, gain, net);
  }
}

/* ---------- 领取暂存金币（机器人挂机存储）---------- */
function collectIdleStorage() {
  if (State.idleStorage <= 0) return { ok: false, msg: '存储为空' };
  const amount = State.idleStorage;
  State.coin += amount;
  State.idleStorage = 0;
  // 领取后：解除"存储已满"系统暂停
  if (State.autoOpenBlockReason === 'storageFull') {
    State.autoOpenPaused = false;
    State.autoOpenBlockReason = null;
  }
  save();
  if (typeof UI !== 'undefined') {
    if (UI.refreshCoin) UI.refreshCoin();
    if (UI.renderStorageBadge) UI.renderStorageBadge();
    if (UI.refreshRobotChip) UI.refreshRobotChip();
  }
  return { ok: true, amount };
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
    autoOpenPaused: !!State.autoOpenPaused,
    autoSellUnlocked: State.autoSellUnlocked,
    autoTierLv: State.autoTierLv || 0,
    autoOpenMaxTier: ['ordinary', 'premium', 'luxury', 'epic', 'mythic'][State.autoTierLv || 0],
    autoRestockUnlocked: State.autoRestockUnlocked,
    autoRestockPaused: !!State.autoRestockPaused,
    autoRestockTier: State.autoRestockTier,
  };
}

/* ---------- 初始化 ---------- */
function initState() {
  load();
  // 自动售卖站默认开启（硬约束）
  State.autoSellUnlocked = true;
  // 同步挂机存储上限（按当前技能等级重算，覆盖存档中的旧值）
  const lv = getSkillLv('B_idleStorageLv');
  const def = SKILL['B_idleStorageLv'];
  if (def && def.effect) {
    const fx = def.effect(lv);
    if (fx && typeof fx.idleStorageMax === 'number') {
      State.idleStorageMax = fx.idleStorageMax;
    }
  }
  if (State.autoOpenUnlocked) startAutoOpen();
}
