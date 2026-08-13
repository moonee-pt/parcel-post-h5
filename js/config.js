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

  // 音量设置（独立持久化 key，不进主存档）
  AUDIO: {
    BGM_VOL_KEY: 'parcel_audio_bgm_v1',
    SFX_VOL_KEY: 'parcel_audio_sfx_v1',
    DEFAULT_BGM: 0.8,     // 背景音乐默认音量
    DEFAULT_SFX: 0.8,     // 音效默认音量（与 BGM 一致）
  },
};

/* ========== 隐藏款 SVG icon（复古印刷 + 硬边墨线风格，跨设备一致）========== */
const ICON = {
  // 金皇冠（豪华盲盒隐藏款）
  goldCrown: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 75 L15 30 L32 60 L50 20 L68 60 L85 30 L90 75 Z"
          fill="#C9A961" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <rect x="10" y="75" width="80" height="14" fill="#C9A961" stroke="#3A2817" stroke-width="3"/>
    <circle cx="15" cy="28" r="3" fill="#3A2817"/>
    <circle cx="50" cy="18" r="3" fill="#3A2817"/>
    <circle cx="85" cy="28" r="3" fill="#3A2817"/>
    <circle cx="50" cy="82" r="4.5" fill="#B83A2E" stroke="#3A2817" stroke-width="1.5"/>
    <circle cx="25" cy="82" r="2.5" fill="#3A2817"/>
    <circle cx="75" cy="82" r="2.5" fill="#3A2817"/>
  </svg>`,

  // 钻石（精品盲盒隐藏款）
  diamond: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="25,30 75,30 90,45 10,45"
             fill="#C9A961" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="25,30 50,30 50,45 10,45" fill="#D4AF37"/>
    <polygon points="50,30 75,30 90,45 50,45" fill="#A88A4D"/>
    <polygon points="10,45 90,45 50,90"
             fill="#F4E8D0" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <line x1="50" y1="45" x2="50" y2="90" stroke="#3A2817" stroke-width="2"/>
    <line x1="30" y1="45" x2="42" y2="90" stroke="#3A2817" stroke-width="1.5"/>
    <line x1="70" y1="45" x2="58" y2="90" stroke="#3A2817" stroke-width="1.5"/>
    <line x1="40" y1="50" x2="45" y2="80" stroke="#F4E8D0" stroke-width="2" opacity="0.7"/>
  </svg>`,

  // 金砖（至尊盲盒隐藏款）
  goldBar: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="15,40 85,40 92,48 22,48"
             fill="#D4AF37" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="85,40 85,75 92,83 92,48"
             fill="#A88A4D" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="15,40 15,75 22,83 22,48"
             fill="#D4AF37" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="15" y="40" width="70" height="35"
          fill="#C9A961" stroke="#3A2817" stroke-width="2.5"/>
    <polygon points="15,75 85,75 92,83 22,83"
             fill="#A88A4D" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="50" y="60" text-anchor="middle" font-family="Fraunces, serif"
          font-size="11" font-weight="900" fill="#3A2817" letter-spacing="0.5">999.9</text>
    <text x="50" y="70" text-anchor="middle" font-family="Noto Serif SC, serif"
          font-size="5" font-weight="700" fill="#3A2817" letter-spacing="0.5">FINE GOLD</text>
  </svg>`,

  // 金币袋（普通盲盒隐藏款）
  moneyBag: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 28 Q50 18 72 28 L68 38 L32 38 Z"
          fill="#3A2817" stroke="#3A2817" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 38 Q15 55 22 80 Q35 90 50 88 Q65 90 78 80 Q85 55 70 38 Z"
          fill="#C9A961" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <line x1="35" y1="38" x2="35" y2="48" stroke="#3A2817" stroke-width="1.5" opacity="0.5"/>
    <line x1="50" y1="36" x2="50" y2="48" stroke="#3A2817" stroke-width="1.5" opacity="0.5"/>
    <line x1="65" y1="38" x2="65" y2="48" stroke="#3A2817" stroke-width="1.5" opacity="0.5"/>
    <text x="50" y="72" text-anchor="middle" font-family="Fraunces, serif"
          font-size="32" font-weight="900" fill="#3A2817">$</text>
    <ellipse cx="38" cy="55" rx="5" ry="10" fill="#F4E8D0" opacity="0.4"/>
  </svg>`,

  // 飞碟（传说盲盒隐藏款）
  ufo: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 60 L8 95 L92 95 L80 60 Z"
          fill="#C9A961" opacity="0.3"/>
    <path d="M30 62 L20 92 L80 92 L70 62 Z"
          fill="#C9A961" opacity="0.4"/>
    <ellipse cx="50" cy="58" rx="40" ry="10"
             fill="#F4E8D0" stroke="#3A2817" stroke-width="3"/>
    <ellipse cx="50" cy="55" rx="40" ry="6" fill="#D4AF37"/>
    <ellipse cx="50" cy="62" rx="40" ry="6" fill="#3A2817" opacity="0.3"/>
    <ellipse cx="50" cy="42" rx="22" ry="14"
             fill="#C9A961" stroke="#3A2817" stroke-width="3"/>
    <ellipse cx="50" cy="42" rx="14" ry="9" fill="#F4E8D0" stroke="#3A2817" stroke-width="2"/>
    <circle cx="25" cy="58" r="4" fill="#B83A2E" stroke="#3A2817" stroke-width="1.5"/>
    <circle cx="50" cy="58" r="4" fill="#D4AF37" stroke="#3A2817" stroke-width="1.5"/>
    <circle cx="75" cy="58" r="4" fill="#2D5F3F" stroke="#3A2817" stroke-width="1.5"/>
    <line x1="50" y1="28" x2="50" y2="20" stroke="#3A2817" stroke-width="2"/>
    <circle cx="50" cy="18" r="2.5" fill="#B83A2E" stroke="#3A2817" stroke-width="1.5"/>
  </svg>`,
};

/* ========== 五档盲盒 ==========
 * 设计原则：
 *   1) 每档用独立物品池（避免名车钥匙/显卡等跨档重名重 emoji）
 *   2) 物品价值 v2 调整：保证 Lv.5 时单包净赚为正（稳赚）
 *   3) 隐藏款不参与 winPct/期望计算（只作彩蛋，不影响主经济）
 *   4) 概率设计：Lv.0 偏低（10-22%），强迫升幸运值；Lv.5 ≈ 80%
 *   5) 物品按价值升序：坏物（value=0）在最上面，最稀有物在最下面
 *   6) 幸运值：所有 value > price 的物品权重都增加，亏钱物品相对概率下降
 * 期望目标（不含 A_value）：
 *   普通 Lv.5  ≈ +14     普通 Lv.0  ≈ +2.5
 *   精品 Lv.5  ≈ +57     精品 Lv.0  ≈ -22
 *   豪华 Lv.5  ≈ +60     豪华 Lv.0  ≈ -80
 *   至尊 Lv.5  ≈ +300    至尊 Lv.0  ≈ -300
 *   传说 Lv.5  ≈ +1500   传说 Lv.0  ≈ -800
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
      { name: '神秘金袋', emoji: ICON.moneyBag, weight: 0.3, value: 188, hidden: true },
    ],
    // Lv.0 期望 ≈ 12.5, 盈亏 +2.5；赚钱概率 ≈ 52%（小玩具+耳机）
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
      { name: '电子表',  emoji: '⌚', weight: 7,  value: 100 },
      { name: '手机',    emoji: '📞', weight: 3,  value: 150, rare: true },
      { name: '钻石耳钉', emoji: ICON.diamond, weight: 0.2, value: 500, hidden: true },
    ],
    // Lv.0 期望 ≈ 28, 盈亏 -22；赚钱概率 ≈ 10%
  },
  luxury: {
    id: 'luxury',
    label: 'LUXURY',
    cn: '豪华盲盒',
    price: 200,
    icon: '📦',
    className: 'luxury',
    riskLabel: '搏一搏',
    items: [
      { name: '碎石',  emoji: '🪨', weight: 40, value: 0,  bad: true },
      { name: '小家电',  emoji: '🍳', weight: 30, value: 50 },
      { name: '平板',    emoji: '💻', weight: 18, value: 120 },
      { name: '金饰',    emoji: '💠', weight: 9,  value: 180 },
      { name: '笔记本',  emoji: '🖥️', weight: 3,  value: 700, rare: true },
      { name: '金皇冠', emoji: ICON.goldCrown, weight: 0.1, value: 2000, hidden: true },
    ],
    // Lv.0 期望 ≈ 120, 盈亏 -80；赚钱概率 ≈ 12%
  },
  // ===== 第 4 档（至尊）=====
  epic: {
    id: 'epic',
    label: 'EPIC',
    cn: '至尊盲盒',
    price: 1000,
    icon: '📦',
    className: 'epic',
    riskLabel: '土豪专属',
    items: [
      { name: '废铜',  emoji: '🪙', weight: 45, value: 0,    bad: true },
      { name: '围巾',    emoji: '🧣', weight: 20, value: 200 },
      { name: '钢笔',    emoji: '🖋️', weight: 18, value: 600 },
      { name: '名牌包',  emoji: '👜', weight: 12, value: 1500 },
      { name: '名车钥匙', emoji: '🚗', weight: 4,  value: 3000, rare: true },
      { name: '翡翠项链', emoji: ICON.goldBar, weight: 1,  value: 8000, hidden: true },
    ],
    // Lv.0 期望 ≈ 700, 盈亏 -300；赚钱概率 ≈ 17%
  },
  // ===== 第 5 档（传说）=====
  mythic: {
    id: 'mythic',
    label: 'MYTHIC',
    cn: '传说盲盒',
    price: 5000,
    icon: '📦',
    className: 'mythic',
    riskLabel: '一念天堂',
    items: [
      { name: '假票',    emoji: '🎫', weight: 50, value: 0,     bad: true },
      { name: '蓝牙音箱', emoji: '🎵', weight: 18, value: 800 },
      { name: '金表',    emoji: '🕰️', weight: 14, value: 2500 },
      { name: '游戏机',  emoji: '🎮', weight: 10, value: 6000 },
      { name: '直升机钥匙', emoji: '🚁', weight: 6,  value: 9000, rare: true },
      { name: '房产证',  emoji: '🏠', weight: 1.5, value: 20000, rare: true },
      { name: '飞船票',  emoji: ICON.ufo, weight: 0.5, value: 50000, hidden: true },
    ],
    // Lv.0 期望 ≈ 4200, 盈亏 -800；赚钱概率 ≈ 18%
  },
};

/* ========== 幸运值系统（首页主升级）==========
 * 每档盲盒独立等级，玩家通过弹窗选择要升哪一档
 * 作用：仅改概率（提升该档位稀有物权重），不改金额
 * 升级价格：每档独立曲线，统一 mult=1.7
 *   普通：base 30    × 1.6^lv  → 30/48/77/123/197
 *   精品：base 100   × 1.7^lv  → 100/170/289/491/836
 *   豪华：base 500   × 1.7^lv  → 500/850/1445/2457/4176
 *   至尊：base 1500  × 1.7^lv  → 1500/2550/4335/7370/12528
 *   传说：base 6000  × 1.7^lv  → 6000/10200/17340/29478/50113
 * 设计目标：4 档（精品/豪华/至尊/传说）曲线一致——
 *   Lv.0 略亏或持平，Lv.1 接近 50%（临界），Lv.2 越过 60% 正式转正，Lv.5 约 75~80%
 *   普通包独立：起步 52%（保本），满级 91%
 *   参考《刮个爽》：幸运值是长期收益核心，缓步推高
 * ========================== */
const LUCKY = {
  MAX_LEVEL: 5,
  COST: {
    ordinary: { base: 30,   mult: 1.6 },
    premium:  { base: 100,  mult: 1.7 },
    luxury:   { base: 500,  mult: 1.7 },
    epic:     { base: 1500, mult: 1.7 },
    mythic:   { base: 6000, mult: 1.7 },
  },
  // 每级效果：所有赚钱物品（value > price）获得 +EFFECT * 100 weight
  // 隐藏款单独加成（HIDDEN_BONUS_PER_LEVEL），不参与 winPct/期望计算（只作彩蛋）
  // 设计目标：所有档位 Lv.5 时赚钱概率都接近 80%（中高档 78%，普通 88%）
  // 4 档 EFFECT 接近：让升级体验一致
  EFFECT_PER_LEVEL: {
    ordinary: 0.30,    // 普通包：52% → 88%（主战场，曲线更平缓）
    premium:  0.30,    // 精品包：10% → 78%
    luxury:   0.30,    // 豪华包：12% → 78%
    epic:     0.30,    // 至尊包：17% → 80%
    mythic:   0.30,    // 传说包：18% → 78%
  },
  // 隐藏款单独加成：每级 +1.0% 权重（Lv.5 时最大概率约 1.5%，所有档位 ≤ 2%）
  // 0.015 → 0.01：上一版 luxury 满级隐藏达 2.95%、epic 2.09%，违反"≤2%"约束
  // 0.01 后各档满级隐藏约：ordinary 1.3% / premium 1.3% / luxury 1.99% / epic 1.5% / mythic 1.0%
  HIDDEN_BONUS_PER_LEVEL: 0.01,
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
    desc: '物品最终售价 +5% / 级（最高 10 级）',
    icon: '💰',
    maxLevel: 10,
    costBase: 50, costMult: 1.6,
    // 价格：50/80/128/205/328/525/840/1344/2150/3440 → 累计 9,096
    // 满级物品价值 +50%
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
    name: '自动拆包机器人',
    desc: '每 5 秒自动买 1 个普通盲盒并拆开（后续用「机器人分拣强化」扩展档位）',
    icon: '🤖',
    oneTime: true, costBase: 500,
  },
  B_openSpeed: {
    id: 'B_openSpeed',
    cat: 'B',
    name: '拆包加速',
    desc: '自动拆包间隔 -0.6 秒 / 级（最高 5 级，5 秒 → 2 秒）',
    icon: '⏩',
    maxLevel: 5,
    requires: 'B_autoOpen',
    costBase: 100, costMult: 1.7,
    // 价格：100/170/289/491/836 → 累计 1,886
    // 满级 = 5 - 5×0.6 = 2 秒/次
    effect: (lv) => ({ autoIntervalDiscount: lv * 0.6 }),
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
  REWARD_COIN: 50,  // [已弃用] 实际广告金币由 Ad.getReward() 动态计算（主战场 30 秒期望盈亏）
};

/* ========== 保底机制（让玩家上头但不动怒）========== */
// 运气象：仅在普通包裹（10 块）生效
// 连续 N 次没出"小玩具"或"耳机"（正收益物品），下次必出其一
// 其他档位（精品/豪华/至尊/传说）无保底
const PITY = {
  ORDINARY_PROFIT_STREAK: 5,
};

/* ========== 图鉴奖励（每档全收齐 + 全部 5 档收齐）==========
 * 设计原则：奖励随档位通胀——高档盲盒难抽齐，奖励更高
 * 档位奖励 = 盲盒价 × N 倍
 *   普通（10×30=300）   精品（50×30=1500）   豪华（200×30=6000）
 *   至尊（1000×30=30000） 传说（5000×30=150000）
 * 全图鉴 = 5 档奖励之和（约 187.8k），激励玩家把所有档位都玩
 * ========================== */
const CODEX = {
  TIER_REWARD: {
    ordinary: 300,     // 普通包单次 10 × 30
    premium:  1500,    // 精品包单次 50 × 30
    luxury:   6000,    // 豪华包单次 200 × 30
    epic:     30000,   // 至尊包单次 1000 × 30
    mythic:   150000,  // 传说包单次 5000 × 30
  },
  ALL_REWARD: 200000,  // 集齐 5 档全图鉴一次性奖励
};
