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
  // 图鉴：{ tierId: { itemName: true } } - 已抽到过的物品
  collection: { ordinary: {}, premium: {}, luxury: {}, epic: {}, mythic: {} },
  // 图鉴：每档奖励是否已领取
  collectionRewards: { ordinary: false, premium: false, luxury: false, epic: false, mythic: false },
  // 图鉴：全图鉴（5 档全收齐）奖励是否已领取
  allCollectionReward: false,

  // ========== 技能卡抽取系统 ==========
  // 当前生效的 buff（{cardId, type, payload, expiresAt}）
  //   type: 'valueMult' | 'speedMult' | 'storageMult' | 'speedLock' | 'luckyStreak'
  //   'luckyStreak' 用 remaining 字段（剩余必中次数），其他用 expiresAt（过期时间戳）
  activeBuffs: [],
  // 技能卡图鉴：已抽到过的卡 { cardId: true }
  cardCollection: {},
  // 9 张全收集奖励是否已领取
  cardAllCollectedReward: false,
  // 抽卡冷却结束时间戳（0=无冷却）—— 付费 + 广告 共享 2 分钟
  cardDrawCooldownEnd: 0,
  // 抽卡是否已解锁（一旦金币 ≥ 800 就解锁，永不解锁回锁定）
  cardUnlocked: false,
  // 抽卡总次数（用于统计）
  cardDrawCount: 0,
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
      collection: State.collection,
      collectionRewards: State.collectionRewards,
      allCollectionReward: State.allCollectionReward,
      // 技能卡系统存档
      activeBuffs: State.activeBuffs,
      cardCollection: State.cardCollection,
      cardAllCollectedReward: State.cardAllCollectedReward,
      cardDrawCooldownEnd: State.cardDrawCooldownEnd,
      cardUnlocked: State.cardUnlocked,
      cardDrawCount: State.cardDrawCount,
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
    // 图鉴数据迁移：旧存档没有 → 补空对象
    if (data.collection && typeof data.collection === 'object') {
      for (const tid in TIER) {
        if (data.collection[tid] && typeof data.collection[tid] === 'object') {
          State.collection[tid] = data.collection[tid];
        }
      }
    }
    if (data.collectionRewards && typeof data.collectionRewards === 'object') {
      for (const tid in TIER) {
        if (typeof data.collectionRewards[tid] === 'boolean') {
          State.collectionRewards[tid] = data.collectionRewards[tid];
        }
      }
    }
    if (typeof data.allCollectionReward === 'boolean') State.allCollectionReward = data.allCollectionReward;
    // 技能卡系统：迁移到独立字段（缺失时给空对象/0 兜底）
    if (Array.isArray(data.activeBuffs)) State.activeBuffs = data.activeBuffs;
    if (data.cardCollection && typeof data.cardCollection === 'object') {
      State.cardCollection = data.cardCollection;
    }
    if (typeof data.cardAllCollectedReward === 'boolean') State.cardAllCollectedReward = data.cardAllCollectedReward;
    if (typeof data.cardDrawCooldownEnd === 'number') State.cardDrawCooldownEnd = data.cardDrawCooldownEnd;
    if (typeof data.cardUnlocked === 'boolean') State.cardUnlocked = data.cardUnlocked;
    // 兼容旧存档：曾抽过卡（cardDrawCount > 0）或当前金币 ≥ PRICE ⇒ 视为已解锁
    if (State.cardDrawCount > 0 || State.coin >= CARD.PRICE) {
      State.cardUnlocked = true;
    }
    // 兼容旧存档：旧版广告 CD 字段取 max 并入共享 CD（防止回退）
    if (typeof data.cardAdCooldownEnd === 'number' && data.cardAdCooldownEnd > State.cardDrawCooldownEnd) {
      State.cardDrawCooldownEnd = data.cardAdCooldownEnd;
    }
    if (typeof data.cardDrawCount === 'number') State.cardDrawCount = data.cardDrawCount;
  } catch (e) {
    console.warn('读档失败', e);
  }
}

/* ---------- 工具 ---------- */
// 金币格式化：< 10000 用千分位逗号（"1,234"）；>= 10000 用 k/M/B 单位（"23k", "1.2M", "5B"）
// 后端 State.coin 始终保持精确数字，仅展示层简化
function formatCoin(n) {
  n = Math.floor(n);
  if (n < 0) return '-' + formatCoin(-n);
  if (n < 10000) return n.toLocaleString('en-US');
  const units = ['', 'k', 'M', 'B', 'T'];
  let i = 0;
  let v = n;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  // v < 1000：>= 100 整数；>= 10 整数；< 10 一位小数（去尾零）
  let s;
  if (v >= 10) s = Math.round(v).toString();
  else s = (Math.round(v * 10) / 10).toString();
  return s + units[i];
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

/* 汇总所有激活的技能效果（技能树 + 时效性 buff） */
function getEffects() {
  const fx = {
    valueMult: 1,     // 价值倍率（来自 A_value + 时效性 buff 相乘叠加）
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
  // 叠加时效性 buff（仅 valueMult；速度/存储在 getEffectiveAutoInterval / getEffectiveStorageMax 中处理）
  fx.valueMult = getBuffedValueMult(fx.valueMult);
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

/* ========== 通关检测：所有可购买升级全满级 ==========
 * 范围：所有 SKILL（oneTime + maxLevel）+ 5 档 LUCKY
 * 通关后游戏仍正常运行（继续拆盲盒、继续赚钱、看广告、存读档等不受影响）
 */
function isGameCompleted() {
  // SKILL：6 个技能全满级
  for (const id in SKILL) {
    if (!isMaxLevel(id)) return false;
  }
  // LUCKY：5 档全满级
  for (const tierId in TIER) {
    if (!isLuckyMax(tierId)) return false;
  }
  return true;
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
function rollItem(tierId, opts = {}) {
  // opts.collectToCodex: 是否计入图鉴（机器人自动拆不计入，玩家手动拆计入）
  const collectToCodex = opts.collectToCodex !== false;
  const tier = TIER[tierId];
  // 先清过期 buff
  clearExpiredBuffs();
  const fx = getEffects();
  // 「隐藏升级」buff：检测是否有 hiddenBoost buff 生效
  const hiddenBoost = (State.activeBuffs || []).reduce((s, b) => {
    if (b.type === 'hiddenBoost' && b.expiresAt > Date.now()) return s + b.boost;
    return s;
  }, 0);
  const items = tier.items.map(it => {
    let w = it.weight;
    w = w + luckyWeightBonus(tierId, it);
    // 隐藏款额外加权重（抽卡 buff「隐藏升级」生效时）
    if (hiddenBoost > 0 && it.hidden) w += hiddenBoost;
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
  // === 技能卡「幸运一击」buff 判定：只在普通包裹生效（其他档位无保底体系，硬塞会破坏期望） ===
  let isLuckyStrike = false;
  const luckyBuff = (State.activeBuffs || []).find(b => b.type === 'luckyStreak' && b.remaining > 0);
  if (luckyBuff && tierId === 'ordinary') {
    // 替换为"正收益物品"候选集（复用普通保底相同的物品列表）
    const profitItems = items.filter(it => it.name === '小玩具' || it.name === '耳机');
    if (profitItems.length > 0) {
      candidates = profitItems;
      isLuckyStrike = true;
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

  // 物品价值（仅由 A_value 技能 + 时效性 buff 影响）
  const value = Math.floor(picked.value * fx.valueMult);

  // === 更新保底计数（只对普通包裹维护）===
  if (tierId === 'ordinary') {
    const isProfit = picked.name === '小玩具' || picked.name === '耳机';
    State.ordNoProfitStreak = isProfit ? 0 : ((State.ordNoProfitStreak || 0) + 1);
  }
  // === 「幸运一击」消耗一次 ===
  if (luckyBuff && isLuckyStrike) {
    luckyBuff.remaining -= 1;
  }
  // === 图鉴：标记物品为已收集（隐藏款也计入）===
  // 但机器人自动拆的物品不计入图鉴
  if (collectToCodex) {
    markItemCollected(tierId, picked.name);
  }
  save();

  return {
    ...picked,
    finalValue: value,
    isCrit: false,
    isBad: !!picked.bad,
    isHidden: !!picked.hidden,
    isOrdinaryPity,
    isLuckyStrike,
  };
}

/* ---------- 图鉴：标记物品已抽到 ---------- */
function markItemCollected(tierId, itemName) {
  if (!State.collection[tierId]) State.collection[tierId] = {};
  State.collection[tierId][itemName] = true;
}

/* ---------- 图鉴：查询某档已收集的物品数 / 总数 ---------- */
function getCodexProgress(tierId) {
  const tier = TIER[tierId];
  if (!tier) return { collected: 0, total: 0, ratio: 0, complete: false };
  const total = tier.items.length;
  const collected = Object.keys(State.collection[tierId] || {}).length;
  return {
    collected: Math.min(collected, total),
    total,
    ratio: total > 0 ? collected / total : 0,
    complete: collected >= total,
  };
}

/* ---------- 图鉴：是否全部 5 档都已收齐 ---------- */
function isAllCodexComplete() {
  for (const tierId in TIER) {
    if (!getCodexProgress(tierId).complete) return false;
  }
  return true;
}

/* ---------- 图鉴：领取某档奖励 ---------- */
function claimCodexTierReward(tierId) {
  if (State.collectionRewards[tierId]) return { ok: false, msg: '已领取' };
  const prog = getCodexProgress(tierId);
  if (!prog.complete) return { ok: false, msg: '未集齐' };
  const reward = CODEX.TIER_REWARD[tierId] || 0;
  State.coin += reward;
  State.collectionRewards[tierId] = true;
  save();
  // 领取金币时播放一次音效
  if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
  return { ok: true, amount: reward };
}

/* ---------- 图鉴：领取全图鉴奖励 ---------- */
function claimAllCodexReward() {
  if (State.allCollectionReward) return { ok: false, msg: '已领取' };
  if (!isAllCodexComplete()) return { ok: false, msg: '未集齐全部 5 档' };
  const reward = CODEX.ALL_REWARD;
  State.coin += reward;
  State.allCollectionReward = true;
  save();
  // 领取金币时播放一次音效
  if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
  return { ok: true, amount: reward };
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
  // ★ 划拉音：开始划 → 从头播放
  if (typeof SFX !== 'undefined' && SFX.play) SFX.play();
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
    // ★ 拉满：停掉划拉音
    if (typeof SFX !== 'undefined' && SFX.stop) SFX.stop();
    openParcel();
  }
}

function onSwipeEnd(e) {
  if (getParcelState() === 'opening') {
    // 没划够，弹回
    setParcelState('sealed');
    const tapeH = document.getElementById('parcelTapeH');
    if (tapeH) tapeH.style.clipPath = 'inset(0 0 0 0)';
    // ★ 划拉音：拉到一半松手 → 暂停（保留位置，再划时从断点继续）
    if (typeof SFX !== 'undefined' && SFX.pause) SFX.pause();
  } else {
    // 其它情况（含已拉满/已 opened）→ 彻底停掉
    if (typeof SFX !== 'undefined' && SFX.stop) SFX.stop();
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

/* 看广告直接解锁 oneTime 技能（不扣金币）
 * 走完跟 upgradeSkill 一样的副作用链（State.skillLv+1、自动开启机器人、续包等）
 */
function unlockSkillFree(id) {
  const def = SKILL[id];
  if (!def) return { ok: false, msg: '技能不存在' };
  if (!def.oneTime) return { ok: false, msg: '此技能不支持看广告解锁' };
  if (isMaxLevel(id)) return { ok: false, msg: '已解锁' };
  if (def.requires && !isSkillUnlocked(def.requires)) {
    return { ok: false, msg: '先解锁前置技能' };
  }
  State.skillLv[id] = getSkillLv(id) + 1;
  // 同步自动化状态(复用 upgradeSkill 里的副作用链)
  if (id === 'B_autoOpen') {
    State.autoOpenUnlocked = true;
    startAutoOpen();
  }
  if (id === 'B_restock') {
    State.autoRestockUnlocked = true;
    tryAutoRestock();
  }
  save();
  return { ok: true };
}

/* ---------- 自动拆包机器人 ---------- */
function getAutoInterval() {
  if (!State.autoOpenUnlocked) return 0;
  // 先清过期 buff
  clearExpiredBuffs();
  const fx = getEffects();
  const base = Math.max(0.5, 5 - fx.autoIntervalDiscount);
  // 叠加时效性 buff（速度锁 / 速度倍率）
  return Math.max(0.5, getEffectiveAutoInterval(base));
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
  if (State.idleStorage >= getEffectiveStorageMax(State.idleStorageMax)) {
    if (State.autoOpenBlockReason !== 'storageFull') {
      State.autoOpenPaused = true;
      State.autoOpenBlockReason = 'storageFull';
      if (typeof UI !== 'undefined' && UI.refreshRobotChip) UI.refreshRobotChip();
    }
    return;
  }
  // 3) 扣 cost（从 State.coin 扣，玩家金币静默减少，不 bump）+ roll
  // 机器人自动拆不计入图鉴
  State.coin -= cost;
  const item = rollItem(tierId, { collectToCodex: false });
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
  const effMax = getEffectiveStorageMax(State.idleStorageMax);
  State.idleStorage = Math.max(0, Math.min(State.idleStorage + net, effMax));
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
  // 领取金币时播放一次音效
  if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
  if (typeof UI !== 'undefined') {
    if (UI.refreshCoin) UI.refreshCoin();
    if (UI.renderStorageBadge) UI.renderStorageBadge();
    if (UI.refreshRobotChip) UI.refreshRobotChip();
  }
  return { ok: true, amount };
}

/* ============================================================
 * 技能卡抽取系统（后期）
 * 设计：valueMult 相乘 / 速度取最优 / 存储相加 / 3 槽上限
 * 9 张卡 / 4 档稀有度 / 单价 2000 / 2 min 冷却
 * ============================================================ */

/* 清理已过期的 buff（每次状态读取前调用，保证 activeBuffs 干净） */
function clearExpiredBuffs() {
  const now = Date.now();
  State.activeBuffs = (State.activeBuffs || []).filter(b => {
    if (b.type === 'luckyStreak') return b.remaining > 0;
    return b.expiresAt > now;
  });
}

/* 价值倍率叠加：基础值 × 所有 valueMult 类型 buff */
function getBuffedValueMult(baseMult) {
  let m = baseMult;
  for (const b of (State.activeBuffs || [])) {
    if (b.type === 'valueMult' && b.expiresAt > Date.now()) {
      m *= b.mult;
    }
  }
  return m;
}

/* 自动拆包间隔（秒）：取 buff 的"锁 2s" 和"×0.8" 与基础值计算后的最小值 */
function getEffectiveAutoInterval(baseIntervalSec) {
  let best = baseIntervalSec;
  for (const b of (State.activeBuffs || [])) {
    if (b.expiresAt <= Date.now()) continue;
    if (b.type === 'speedLock') {
      if (b.intervalSec < best) best = b.intervalSec;
    } else if (b.type === 'speedMult') {
      const candidate = best * b.mult;  // 每次相乘（累乘：×0.8 × ×0.8 = ×0.64）
      if (candidate < best) best = candidate;
    }
  }
  return best;
}

/* 存储上限：基础值 × (1 + 所有 storageMult 累乘 - 1)  → 实际是 base × 累乘 mult */
function getEffectiveStorageMax(baseMax) {
  let m = 1;
  for (const b of (State.activeBuffs || [])) {
    if (b.expiresAt <= Date.now()) continue;
    if (b.type === 'storageMult') m *= b.mult;
  }
  return Math.floor(baseMax * m);
}

/* 当前占用槽位的 buff 数（luckyStreak 不占槽） */
function countActiveBuffSlots() {
  return (State.activeBuffs || []).filter(b => b.type !== 'luckyStreak' && b.expiresAt > Date.now()).length;
}

/* 抽卡：根据权重抽 1 张卡（返回卡定义） */
function rollCard() {
  const totalWeight = CARD.POOL.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const c of CARD.POOL) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return CARD.POOL[CARD.POOL.length - 1];
}

/* 抽卡入口：mode = 'coin' | 'ad'
 * 返回 { ok, card, error } */
function drawCard(mode) {
  clearExpiredBuffs();
  if (State.coin < CARD.MIN_COIN && mode === 'coin') {
    return { ok: false, error: '金币不足' };
  }
  // 冷却检查（付费 + 广告 共享 2 分钟 CD）
  const now = Date.now();
  if (State.cardDrawCooldownEnd > now) {
    const remain = Math.ceil((State.cardDrawCooldownEnd - now) / 1000);
    return { ok: false, error: `冷却中，还剩 ${remain} 秒` };
  }
  if (mode === 'coin') {
    if (State.coin < CARD.PRICE) {
      return { ok: false, error: '金币不足' };
    }
    State.coin -= CARD.PRICE;
  }
  // 共享 CD：付费和广告都重置同一个字段
  State.cardDrawCooldownEnd = now + CARD.COOLDOWN_MS;

  // 抽卡
  const card = rollCard();

  // 加入图鉴
  State.cardCollection[card.id] = true;

  // 应用 buff
  const fx = card.effect;
  if (fx.type === 'coin') {
    // 立即金币
    State.coin += fx.value;
  } else if (fx.type === 'luckyStreak') {
    // 计数器型：同 id 可叠加
    const existing = State.activeBuffs.find(b => b.type === 'luckyStreak' && b.cardId === card.id);
    if (existing) {
      existing.remaining += fx.count;
    } else {
      State.activeBuffs.push({
        cardId: card.id,
        type: 'luckyStreak',
        remaining: fx.count,
      });
    }
  } else {
    // 时效型 buff
    // 槽位已满：阻止（UI 层先检查，这里兜底）
    if (countActiveBuffSlots() >= CARD.MAX_ACTIVE_BUFFS) {
      // 退还金币（仅付费模式）+ 清掉刚加的 CD
      if (mode === 'coin') {
        State.coin += CARD.PRICE;
      }
      State.cardDrawCooldownEnd = 0;
      return { ok: false, error: 'buff 槽位已满' };
    }
    State.activeBuffs.push({
      cardId: card.id,
      type: fx.type,
      mult: fx.mult,
      intervalSec: fx.intervalSec,
      expiresAt: Date.now() + fx.durationMs,
    });
  }

  State.cardDrawCount = (State.cardDrawCount || 0) + 1;
  save();
  return { ok: true, card };
}

/* 领取 9 张全收集奖励 */
function claimCardAllReward() {
  if (State.cardAllCollectedReward) return { ok: false, msg: '已领取' };
  const total = CARD.POOL.length;
  const collected = Object.keys(State.cardCollection || {}).length;
  if (collected < total) return { ok: false, msg: `未集齐（${collected}/${total}）` };
  State.coin += CARD.ALL_REWARD;
  State.cardAllCollectedReward = true;
  save();
  // 领取金币时播放一次音效
  if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
  return { ok: true, amount: CARD.ALL_REWARD };
}

/* 卡牌图鉴进度 */
function getCardCodexProgress() {
  const total = CARD.POOL.length;
  const collected = Object.keys(State.cardCollection || {}).length;
  return {
    collected: Math.min(collected, total),
    total,
    ratio: total > 0 ? collected / total : 0,
    complete: collected >= total,
  };
}

/* 抽卡剩余冷却（毫秒），0 = 无冷却；付费 + 广告共享 */
function getCardCooldownRemaining(_mode) {
  const now = Date.now();
  return Math.max(0, (State.cardDrawCooldownEnd || 0) - now);
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
    // 隐藏款不参与期望计算（只作彩蛋，不影响主经济）
    const expectedValue = items.reduce((s, it) => {
      if (it.hidden) return s;
      return s + (it.value * fx.valueMult) * (it._w / total);
    }, 0);
    // 总权重也要相应排除 hidden 后的值（保持期望 = 普通物品加权）
    // 注意：这里"总权重"保留含 hidden 用于概率展示，期望/盈亏只算非 hidden
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
    // 赚钱概率：所有 value > price 的物品概率之和（隐藏款不参与）
    const winPct = rows
      .filter(r => r.value > tier.price && !r.isHidden)
      .reduce((s, r) => s + r.pct, 0);
    // 隐藏款概率：单独展示（不算入 winPct）
    const hiddenPct = rows
      .filter(r => r.isHidden)
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
      hiddenPct: hiddenPct,
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
