/* ============================================================
 * config.js — 数值表（所有可调数值集中在这里）
 * ============================================================ */

const CONFIG = {
  // 起始金币（保底：保证新手有 10 次普通包预算，避免早早破产）
  START_COIN: 0,          // 初始 0 金币：先玩贴面单赚第一笔

  // 划封带交互参数
  SWIPE: {
    // 划开需要的滑动距离（像素），可被「划开速度」技能降低
    BASE_THRESHOLD: 100,
  },

  // 数值跳字动画时长
  NUM_FX_DURATION: 1400,
  ITEM_FX_DURATION: 1200,

  // 自动存档 key
  SAVE_KEY: 'parcel_post_save_v1',
};

/* ========== 三档快递 ==========
 * 设计原则：普通包小幅正期望（保证可玩），精品/豪华初始为负（需要升幸运值扭亏）
 *   普通包：基线 +1.9 金（赚钱概率 52%），满级幸运 → +4.7 金
 *   精品包：基线 -24 金，满级幸运 → -10.3 金（仍亏但大幅回升）
 *   豪华包：基线 -100 金，满级幸运 → -75.4 金（仍亏，高端永远赌）
 * 物品按价值升序：坏物（value=0）在最上面，最稀有物在最下面
 * 幸运值：所有 value > price 的物品权重都增加，亏钱物品相对概率下降
 * ========================== */
const TIER = {
  ordinary: {
    id: 'ordinary',
    label: 'ORDINARY',
    cn: '普通包裹',
    price: 10,
    icon: '📦',
    className: '',         // 普通不加修饰
    riskLabel: '主战场',
    items: [
      { name: '空盒',    emoji: '📭', weight: 30, value: 0,  bad: true },
      { name: '废纸箱',  emoji: '🗞️', weight: 10, value: 3 },
      { name: '旧杂志',  emoji: '📰', weight: 8,  value: 8 },
      { name: '小玩具',  emoji: '🧸', weight: 35, value: 12 },
      { name: '耳机',    emoji: '🎧', weight: 17, value: 40, rare: true },
      { name: '神秘小金条', emoji: '🎁', weight: 0.3, value: 500, hidden: true },
    ],
    // 期望 11.94，利润 +1.94；赚钱概率 52%（小玩具+耳机）
  },
  premium: {
    id: 'premium',
    label: 'PREMIUM',
    cn: '精品快递',
    price: 50,
    icon: '📦',
    className: 'premium',
    riskLabel: '高风险',
    items: [
      { name: '砖头',    emoji: '🧱', weight: 40, value: 0,  bad: true },
      { name: '日用品',  emoji: '🧴', weight: 30, value: 15 },
      { name: '键盘',    emoji: '⌨️', weight: 20, value: 50 },
      { name: '手表',    emoji: '⌚', weight: 7,  value: 100 },
      { name: '手机',    emoji: '📱', weight: 3,  value: 150, rare: true },
      { name: '钻石耳钉', emoji: '💎', weight: 0.2, value: 5000, hidden: true },
    ],
  },
  luxury: {
    id: 'luxury',
    label: 'LUXURY',
    cn: '豪华礼盒',
    price: 200,
    icon: '🎁',
    className: 'luxury',
    riskLabel: '搏一搏',
    items: [
      { name: '空盒',    emoji: '📭', weight: 40, value: 0,  bad: true },
      { name: '小家电',  emoji: '🍳', weight: 30, value: 50 },
      { name: '平板',    emoji: '💻', weight: 18, value: 120 },
      { name: '金饰',    emoji: '💍', weight: 9,  value: 300 },
      { name: '笔记本',  emoji: '🖥️', weight: 3,  value: 1200, rare: true },
      { name: '黄金键盘', emoji: '👑', weight: 0.1, value: 50000, hidden: true },
    ],
  },
};

/* ========== 幸运值系统（首页主升级）==========
 * 每档快递独立等级，玩家通过弹窗选择要升哪一档
 * 作用：仅改概率（提升该档位稀有物权重），不改金额
 * 升级价格：每档独立曲线，高档更贵
 *   普通：base 50  × 2.5^lv   →  50, 125, 313, 781, 1953, 4883, 12207, ...
 *   精品：base 200 × 3.0^lv   →  200, 600, 1800, 5400, 16200, 48600, 145800, ...
 *   豪华：base 1000× 4.0^lv   →  1000, 4000, 16000, 64000, 256000, 1024000, ...
 * 满级（Lv.10）时：
 *   普通包稀有权重 4 → 29  → 期望从 -5 扭亏到 +2（主战场稳定赚钱）
 *   精品包稀有权重 3 → 23  → 期望从 -24 回升到 -3（接近回本仍小亏）
 *   豪华包稀有权重 3 → 7   → 期望从 -100 回升到 -50（高端永远是赌）
 * ========================== */
const LUCKY = {
  MAX_LEVEL: 10,
  // 每档独立价格曲线（参考 刮个爽：低档慢涨、高档陡涨）
  // 目标：普通 Lv.8~9 ≈ 精品 Lv.1，让玩家可以主攻普通档很久
  COST: {
    ordinary: { base: 20,   mult: 1.5 },  // 1:20, 5:152, 8:512, 9:768, 10:1152
    premium:  { base: 500,  mult: 2.0 },  // 1:500, 5:8k, 8:128k, 9:256k, 10:512k
    luxury:   { base: 2000, mult: 2.5 },  // 1:2k, 5:195k, 10:48M
  },
  // 每级效果（按档位独立）：对所有赚钱物品（value > price）的稀有权重 + EFFECT * 100
  // 目标：每升 1 级赚钱物品概率 +5%~10%，玩家有显著正反馈
  EFFECT_PER_LEVEL: {
    ordinary: 0.08,      // 普通包：8 weight/级/物品（共 +16/级），满级 +160
    premium:  0.05,      // 精品包：5 weight/级/物品（共 +10/级），满级 +100
    luxury:   0.015,     // 豪华包：1.5 weight/级/物品（共 +3/级），满级 +30
  },
  // 隐藏款单独加成：每档统一 0.5%/级，满级 5%（不破坏整体期望）
  HIDDEN_BONUS_PER_LEVEL: 0.005,
};

/* ========== 技能树（升级页：只保留价值加成百分比 + 自动化）==========
 * type: A = 价值收益类（每级扣钱升级，可重复升级直到 maxLevel）
 *      B = 自动化类（一次性解锁，默认就开启自动售卖站）
 * costBase/costMult: 升级价 = costBase * (costMult ^ (level-1))
 * 概率类升级已迁移至首页「幸运值」系统
 * ========================== */
const SKILL = {
  // ----- A 类：价值收益（仅改金额百分比）-----
  A_value: {
    id: 'A_value',
    cat: 'A',
    name: '价值加成',
    desc: '物品最终售价 +5% / 级',
    icon: '💰',
    maxLevel: 20,
    costBase: 50, costMult: 3,
    effect: (lv) => ({ valueMult: 1 + lv * 0.05 }),
  },

  // ----- B 类：自动化 -----
  B_restock: {
    id: 'B_restock',
    cat: 'B',
    name: '自动补货',
    desc: '拆完自动买同档位新快递并放到台上（默认档位可切换）',
    icon: '🔄',
    oneTime: true, costBase: 400,
  },
  B_autoOpen: {
    id: 'B_autoOpen',
    cat: 'B',
    name: '自动拆包器',
    desc: '每 3 秒自动买 1 个普通包裹并拆开',
    icon: '🤖',
    oneTime: true, costBase: 600,
  },
  B_openSpeed: {
    id: 'B_openSpeed',
    cat: 'B',
    name: '拆包加速',
    desc: '自动拆包间隔 -0.2 秒 / 级（最高 10 级）',
    icon: '⏩',
    maxLevel: 10,
    requires: 'B_autoOpen',
    costBase: 300, costMult: 3,
    effect: (lv) => ({ autoIntervalDiscount: lv * 0.2 }),
  },
  B_autoSell: {
    id: 'B_autoSell',
    cat: 'B',
    name: '自动售卖站',
    desc: '拆出后自动入账，无需手动',
    icon: '🏪',
    oneTime: true, costBase: 5000,
    defaultOn: true,  // 硬约束：默认开启
  },
  B_bulkBuy: {
    id: 'B_bulkBuy',
    cat: 'B',
    name: '批量采购',
    desc: '自动拆包器可拆精品/豪华（需手动设置档位）',
    icon: '📯',
    oneTime: true, costBase: 10000,
    requires: 'B_autoOpen',
  },
};

/* 技能 tab 配置 */
const SKILL_TABS = [
  { id: 'A', label: 'A · 价值收益' },
  { id: 'B', label: 'B · 自动化' },
];

/* ========== 广告（无冷却，想看就看）========== */
const AD = {
  REWARD_COIN: 50,
};

/* ========== 保底机制（让玩家上头但不动怒）========== */
const PITY = {
  // 首抽保护：前 N 次开包必出非坏物（不区分档位）
  FIRST_OPEN_PROTECT: 3,
  // 运气象：连续 N 次没出稀有，下次必出
  RARE_STREAK: 5,
};
