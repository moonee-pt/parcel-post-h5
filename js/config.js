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

/* ========== 三档盲盒 ==========
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
    cn: '普通盲盒',
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
      { name: '神秘小金条', emoji: '🎁', weight: 0.3, value: 188, hidden: true },
    ],
    // 期望 11.94，利润 +1.94；赚钱概率 52%（小玩具+耳机）
  },
  premium: {
    id: 'premium',
    label: 'PREMIUM',
    cn: '精品盲盒',
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
      { name: '钻石耳钉', emoji: '💎', weight: 0.2, value: 888, hidden: true },
    ],
  },
  luxury: {
    id: 'luxury',
    label: 'LUXURY',
    cn: '豪华盲盒',
    price: 200,
    icon: '📦',           // 统一所有档位 icon
    className: 'luxury',
    riskLabel: '搏一搏',
    items: [
      { name: '空盒',    emoji: '📭', weight: 40, value: 0,  bad: true },
      { name: '小家电',  emoji: '🍳', weight: 30, value: 50 },
      { name: '平板',    emoji: '💻', weight: 18, value: 120 },
      { name: '金饰',    emoji: '💍', weight: 9,  value: 300 },
      { name: '笔记本',  emoji: '🖥️', weight: 3,  value: 1200, rare: true },
      { name: '黄金键盘', emoji: '👑', weight: 0.1, value: 8888, hidden: true },
    ],
  },
  // ===== 新增两个档位（4 / 5）=====
  epic: {
    id: 'epic',
    label: 'EPIC',
    cn: '至尊盲盒',
    price: 1000,
    icon: '📦',
    className: 'epic',
    riskLabel: '土豪专属',
    items: [
      { name: '空盒',    emoji: '📭', weight: 45, value: 0,    bad: true },
      { name: '日用品',  emoji: '🧴', weight: 20, value: 200 },
      { name: '名表',    emoji: '⌚', weight: 18, value: 600 },
      { name: '显卡',    emoji: '🎮', weight: 12, value: 1500 },
      { name: '名车钥匙', emoji: '🚗', weight: 4,  value: 4000, rare: true },
      { name: '金砖',    emoji: '🟨', weight: 1,  value: 20000, hidden: true },
    ],
    // 期望：200*0.20 + 600*0.18 + 1500*0.12 + 4000*0.04 = 40+108+180+160 = 488
    // 概率：赚钱 54%（日用品+名表+显卡+名车）; 期望盈亏 -512（成本 1000）；略亏但有隐藏款
  },
  mythic: {
    id: 'mythic',
    label: 'MYTHIC',
    cn: '传说盲盒',
    price: 5000,
    icon: '📦',
    className: 'mythic',
    riskLabel: '一念天堂',
    items: [
      { name: '空盒',    emoji: '📭', weight: 50, value: 0,     bad: true },
      { name: '小家电',  emoji: '🍳', weight: 18, value: 800 },
      { name: '名表',    emoji: '⌚', weight: 14, value: 2500 },
      { name: '显卡',    emoji: '🎮', weight: 10, value: 6000 },
      { name: '名车钥匙', emoji: '🚗', weight: 6,  value: 15000, rare: true },
      { name: '房产证',  emoji: '🏠', weight: 1.5, value: 80000, rare: true },
      { name: '宇宙飞船票', emoji: '🛸', weight: 0.5, value: 200000, hidden: true },
    ],
    // 概率：赚钱 50%；期望盈亏 -1000（成本 5000）；隐藏款 200000 = 0.5% 概率
  },
};

/* ========== 幸运值系统（首页主升级）==========
 * 每档盲盒独立等级，玩家通过弹窗选择要升哪一档
 * 作用：仅改概率（提升该档位稀有物权重），不改金额
 * 升级价格：每档独立曲线，高档更贵
 *   普通：base 50   × 2.5^lv
 *   精品：base 200  × 3.0^lv
 *   豪华：base 1000 × 4.0^lv
 *   至尊：base 5000 × 4.5^lv
 *   传说：base 20000× 5.0^lv
 * 满级（Lv.10）时：
 *   普通包稀有权重 4 → 29  → 期望从 -5 扭亏到 +2（主战场稳定赚钱）
 *   精品包稀有权重 3 → 23  → 期望从 -24 回升到 -3（接近回本仍小亏）
 *   豪华包稀有权重 3 → 7   → 期望从 -100 回升到 -50（高端永远是赌）
 * ========================== */
const LUCKY = {
  MAX_LEVEL: 5,
  // 玩家流程：先亏后赚，每升一级都能感觉到明显变化
  // 价格曲线：每级 1.5x 平滑递增，每档 Lv.5 ≈ 下一档 Lv.1（连续衔接）
  // 普通包：1 天可满级，精品包：1 周，豪华包：2-3 周
  COST: {
    ordinary: { base: 30,   mult: 1.5 },  // 1:30, 2:45, 3:68, 4:102, 5:153
    premium:  { base: 150,  mult: 1.5 },  // 1:150, 2:225, ...
    luxury:   { base: 750,  mult: 1.5 },  // 1:750, 2:1125, ...
    epic:     { base: 3500, mult: 1.5 },  // 1:3500, 2:5250, ...
    mythic:   { base: 15000,mult: 1.5 },  // 1:15000, 2:22500, ...
  },
  // 每级效果：所有赚钱物品（value > price）获得 +EFFECT * 100 weight
  // 设计目标：Lv.0 50% 赚钱，Lv.5 约 85% 赚钱（每档均先亏后赚，参考 刮个爽）
  EFFECT_PER_LEVEL: {
    ordinary: 0.25,     // 普通包 52% → 86%
    premium:  0.50,     // 精品包 10% → 85%
    luxury:   0.50,     // 豪华包 12% → 85%
    epic:     0.50,
    mythic:   0.50,
  },
  // 隐藏款单独加成：每档统一 4%/级，满级 5%+（参考 刮个爽 的隐藏款思路）
  // Lv.5 普通包隐藏概率 ≈ 5.5%（让玩家能体验到）
  HIDDEN_BONUS_PER_LEVEL: 0.04,
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
    desc: '拆完自动买同档位新盲盒并放到台上（默认档位可切换）',
    icon: '🔄',
    oneTime: true, costBase: 200,
  },
  B_autoOpen: {
    id: 'B_autoOpen',
    cat: 'B',
    name: '自动拆包机器人',
    desc: '每 5 秒自动买 1 个普通盲盒并拆开（后续用「机器人分拣强化」扩展档位）',
    icon: '🤖',
    oneTime: true, costBase: 350,
  },
  B_openSpeed: {
    id: 'B_openSpeed',
    cat: 'B',
    name: '拆包加速',
    desc: '自动拆包间隔 -0.2 秒 / 级（最高 10 级）',
    icon: '⏩',
    maxLevel: 10,
    requires: 'B_autoOpen',
    costBase: 300, costMult: 1.7,
    // 价格：300, 510, 867, 1474, 2506, 4260, 7242, 12312, 20930, 35581
    // 满级 = 5 - 10×0.2 = 3 秒/次
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
  B_autoTier: {
    id: 'B_autoTier',
    cat: 'B',
    name: '机器人分拣强化',
    desc: '让机器人能拆更高档位的盲盒（Lv.1 精品 → Lv.4 传说）',
    icon: '🛠️',
    maxLevel: 4,
    requires: 'B_autoOpen',
    costBase: 500, costMult: 4,
    // 价格曲线（500 × 4^(lv-1)）：
    //   Lv.1  +📦📦 精品   500
    //   Lv.2  +🎁 豪华     2,000
    //   Lv.3  +💎 至尊     8,000
    //   Lv.4  +🌌 传说     32,000
    effect: (lv) => ({ autoOpenMaxTierLv: lv }),
  },
  B_idleStorageLv: {
    id: 'B_idleStorageLv',
    cat: 'B',
    name: '扩容仓库',
    desc: '挂机存储上限大幅提升（最高 15 级）',
    icon: '🗃️',
    maxLevel: 15,
    requires: 'B_autoOpen',
    costBase: 80, costMult: 1.7,
    // Lv.0~5：50*(lv+1)²（保留原节奏）
    // Lv.6~15：每级再 ×1.5（撑得起后期至尊/传说档位的净赚速率）
    //   50, 200, 450, 800, 1250, 1800, 2700, 4050, 6075, 9112, 13669, 20503, 30755, 46132, 69198, 103797
    effect: (lv) => {
      const base = 50 * (lv + 1) * (lv + 1);
      const tail = lv > 5 ? Math.pow(1.5, lv - 5) : 1;
      return { idleStorageMax: Math.floor(base * tail) };
    },
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
// 运气象：仅在普通包裹（10 块）生效
// 连续 N 次没出"小玩具"或"耳机"（正收益物品），下次必出其一
// 其他档位（精品/豪华/至尊/传说）无保底
const PITY = {
  ORDINARY_PROFIT_STREAK: 5,
};
