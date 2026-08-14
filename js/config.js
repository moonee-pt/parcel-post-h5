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

  // 自动补货（升级页 + 广告弹窗统一图标）：♻ 双弯循环箭头
  // 颜色跟随 currentColor：未购买=棕色(浅色背景清晰)，已购买=金黄(棕色背景清晰)
  restock: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 12 50 a 38 38 0 0 1 38 -38 a 38 38 0 0 1 28 12 L 88 33"/>
    <polyline points="88,12 88,33 67,33"/>
    <path d="M 88 50 a 38 38 0 0 1 -38 38 a 38 38 0 0 1 -28 -12 L 12 67"/>
    <polyline points="12,88 12,67 33,67"/>
  </svg>`,

  // 自动拆包机器人（升级页 + 广告弹窗统一图标）：方脑袋 + 天线 + 眼睛 + 齿轮手臂
  robot: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 天线 -->
    <line x1="50" y1="20" x2="50" y2="8" stroke="#3A2817" stroke-width="2.5"/>
    <circle cx="50" cy="6" r="3" fill="#B83A2E" stroke="#3A2817" stroke-width="1.5"/>
    <!-- 头部方框 -->
    <rect x="22" y="22" width="56" height="42" rx="3" fill="#C9A961" stroke="#3A2817" stroke-width="3"/>
    <!-- 左眼 -->
    <rect x="30" y="32" width="14" height="14" rx="2" fill="#F4E8D0" stroke="#3A2817" stroke-width="2.5"/>
    <circle cx="37" cy="39" r="3" fill="#3A2817"/>
    <!-- 右眼 -->
    <rect x="56" y="32" width="14" height="14" rx="2" fill="#F4E8D0" stroke="#3A2817" stroke-width="2.5"/>
    <circle cx="63" cy="39" r="3" fill="#3A2817"/>
    <!-- 嘴巴（齿条） -->
    <line x1="34" y1="56" x2="66" y2="56" stroke="#3A2817" stroke-width="2.5"/>
    <line x1="42" y1="52" x2="42" y2="60" stroke="#3A2817" stroke-width="1.5"/>
    <line x1="50" y1="52" x2="50" y2="60" stroke="#3A2817" stroke-width="1.5"/>
    <line x1="58" y1="52" x2="58" y2="60" stroke="#3A2817" stroke-width="1.5"/>
    <!-- 脖子 -->
    <rect x="42" y="64" width="16" height="5" fill="#3A2817"/>
    <!-- 底座 -->
    <rect x="30" y="69" width="40" height="9" fill="#C9A961" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 手臂齿轮（左右） -->
    <circle cx="14" cy="48" r="6" fill="#3A2817"/>
    <circle cx="14" cy="48" r="2.5" fill="#C9A961"/>
    <circle cx="86" cy="48" r="6" fill="#3A2817"/>
    <circle cx="86" cy="48" r="2.5" fill="#C9A961"/>
  </svg>`,

  // 价值加成（A_value）：金币堆（三层金字塔 + $ 符号）
  value: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 底层 2 块（深金） -->
    <ellipse cx="32" cy="78" rx="16" ry="5" fill="#A88A4D" stroke="#3A2817" stroke-width="2.5"/>
    <ellipse cx="68" cy="78" rx="16" ry="5" fill="#A88A4D" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 中层 1 块（中金） -->
    <ellipse cx="50" cy="60" rx="20" ry="6" fill="#C9A961" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 顶层 1 块（亮金） -->
    <ellipse cx="50" cy="40" rx="18" ry="6" fill="#D4AF37" stroke="#3A2817" stroke-width="2.5"/>
    <!-- $ 符号 -->
    <text x="50" y="46" text-anchor="middle" font-family="Fraunces, serif"
          font-size="14" font-weight="900" fill="#3A2817">$</text>
    <!-- 高光小点 -->
    <circle cx="40" cy="38" r="1.5" fill="#F4E8D0" opacity="0.7"/>
    <circle cx="60" cy="38" r="1.5" fill="#F4E8D0" opacity="0.7"/>
  </svg>`,

  // 拆包加速（B_openSpeed）：闪电
  speed: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 58 6 L 22 54 L 44 54 L 36 94 L 78 42 L 56 42 L 66 6 Z"
          fill="#D4AF37" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <!-- 高光 -->
    <path d="M 58 6 L 22 54 L 32 54 L 56 18 Z" fill="#F4E8D0" opacity="0.4"/>
  </svg>`,

  // 机器人分拣强化（B_autoTier）：🛠️ 单个锤子 + 强化星
  tier: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 锤头：中金，左窄右平（复古印刷风）-->
    <path d="M 14 18 L 70 18 L 78 30 L 70 42 L 14 42 L 8 30 Z"
          fill="#C9A961" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <!-- 锤头亮面 -->
    <path d="M 14 18 L 70 18 L 74 24 L 12 24 Z" fill="#D4AF37"/>
    <!-- 锤头中线（硬度感）-->
    <line x1="12" y1="30" x2="74" y2="30" stroke="#3A2817" stroke-width="1.5" opacity="0.4"/>
    <!-- 锤柄：木色 -->
    <rect x="42" y="42" width="14" height="42" rx="2"
          fill="#A8754A" stroke="#3A2817" stroke-width="3"/>
    <!-- 锤柄木纹 -->
    <line x1="46" y1="48" x2="46" y2="80" stroke="#3A2817" stroke-width="1.5" opacity="0.5"/>
    <line x1="52" y1="48" x2="52" y2="80" stroke="#3A2817" stroke-width="1.5" opacity="0.5"/>
    <!-- 锤柄底盖 -->
    <rect x="40" y="82" width="18" height="6" fill="#3A2817"/>
    <!-- 强化星：右上方主星 -->
    <path d="M 88 6 L 90 14 L 98 16 L 90 18 L 88 26 L 86 18 L 78 16 L 86 14 Z"
          fill="#D4AF37" stroke="#3A2817" stroke-width="1.5" stroke-linejoin="round"/>
    <!-- 强化星：左下方小圆 -->
    <circle cx="10" cy="66" r="3" fill="#D4AF37" stroke="#3A2817" stroke-width="1.2"/>
    <!-- 强化星：右下方小星 -->
    <path d="M 92 58 L 93 62 L 97 63 L 93 64 L 92 68 L 91 64 L 87 63 L 91 62 Z"
          fill="#D4AF37" stroke="#3A2817" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,

  // 扩容仓库（B_idleStorageLv）：复古木箱 + 向上箭头
  storage: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 上箭头（绿色，表示扩容） -->
    <path d="M 50 4 L 50 22 M 42 12 L 50 4 L 58 12" fill="none" stroke="#2D5F3F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- 箱盖 -->
    <rect x="12" y="26" width="76" height="14" fill="#A8754A" stroke="#3A2817" stroke-width="3"/>
    <!-- 箱体 -->
    <rect x="16" y="40" width="68" height="48" fill="#A8754A" stroke="#3A2817" stroke-width="3"/>
    <!-- 木板竖纹 -->
    <line x1="34" y1="40" x2="34" y2="88" stroke="#3A2817" stroke-width="2"/>
    <line x1="50" y1="40" x2="50" y2="88" stroke="#3A2817" stroke-width="2"/>
    <line x1="66" y1="40" x2="66" y2="88" stroke="#3A2817" stroke-width="2"/>
    <!-- 锁扣 -->
    <rect x="44" y="56" width="12" height="14" fill="#C9A961" stroke="#3A2817" stroke-width="2.5"/>
    <circle cx="50" cy="63" r="2" fill="#3A2817"/>
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
 * 期望目标（不含 A_value，代码 getCurrentStats() 实测值）：
 *   普通 Lv.5  ≈ +12.5    普通 Lv.0  ≈ +1.9
 *   精品 Lv.5  ≈ +50.2    精品 Lv.0  ≈ -24.1
 *   豪华 Lv.5  ≈ +249.3   豪华 Lv.0  ≈ -126.3
 *   至尊 Lv.5  ≈ +799.5   至尊 Lv.0  ≈ -552
 *   传说 Lv.5  ≈ +4897    传说 Lv.0  ≈ -3066
 *
 * 广告金币机制（ad.js getReward）：
 *   取所有档位中"赚钱概率 > 50%"的最高档，其期望盈亏 × 10
 *   （×10 代表 30 秒手点收益，不封顶）
 *   0 级玩家（无档位 winPct > 50%）保底 50
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
  // 隐藏款单独加成：每级 +1.0% 权重（Lv.5 时最大概率约 1.3-1.5%，所有档位 ≤ 2%）
  // 0.015 → 0.01：上一版 luxury 满级隐藏达 2.95%、epic 2.09%，违反"≤2%"约束
  // 注意：隐藏款实际概率 = hidden权重 / 含 luckyWeightBonus 加成的总权重
  // 例如 ordinary Lv.5：赚钱物品加成 +150+150，总权重 ≈405，hidden 5.3/405 ≈1.31%
  // 抽到「隐藏升级」buff（+5 权重）期间：约 2.5%
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
    icon: ICON.value,
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
    icon: ICON.restock,
    oneTime: true, costBase: 200,
  },
  B_autoOpen: {
    id: 'B_autoOpen',
    cat: 'B',
    name: '自动拆包机器人',
    desc: '每 5 秒自动买 1 个普通盲盒并拆开（后续用「机器人分拣强化」扩展档位）',
    icon: ICON.robot,
    oneTime: true, costBase: 500,
  },
  B_openSpeed: {
    id: 'B_openSpeed',
    cat: 'B',
    name: '拆包加速',
    desc: '自动拆包间隔 -0.6 秒 / 级（最高 5 级，5 秒 → 2 秒）',
    icon: ICON.speed,
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
    icon: ICON.tier,
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
    icon: ICON.storage,
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

/* ========== 技能卡抽取（后期系统）==========
 * 设计原则：
 *   1) 9 张卡 / 4 档稀有度 / 单价 2000 金币（后期专享）
 *   2) 副作用：仅"罕见"档限时 3 分钟（其他都 10 分钟），不叠别的负面
 *   3) 价值 buff 与现有 A_value 相乘；速度取最优；存储相加
 *   4) 同时生效 buff 上限 3 个；冷却 2 分钟（付费/广告统一）
 *   5) 单卡概率不展示，只展示稀有度总概率（保留惊喜）
 *   6) "幸运一击"是即时型 buff（计数器），不入 3 槽位
 * ========================== */
const CARD = {
  // 单次抽卡价格（早期可玩：800 金币，普通盲盒 80 次的累计盈亏平衡点）
  PRICE: 800,

  // 冷却时间（毫秒）—— 付费抽卡 + 广告抽卡 统一 2 分钟
  COOLDOWN_MS: 2 * 60 * 1000,

  // 同时生效 buff 上限（"幸运一击"是计数器型不占槽位）
  MAX_ACTIVE_BUFFS: 3,

  // 9 张卡（按稀有度分组）
  POOL: [
    // ========== 劣质（30%）==========
    {
      id: 'card_silver',
      rarity: 'common',
      cn: '碎银',
      desc: '立即获得 50 金币',
      icon: '💰',
      weight: 18,  // 18/100
      effect: { type: 'coin', value: 50 },
    },
    {
      id: 'card_copper',
      rarity: 'common',
      cn: '铜板',
      desc: '立即获得 180 金币',
      icon: '💰',
      weight: 12,  // 12/100
      effect: { type: 'coin', value: 180 },
    },

    // ========== 普通（40%）==========
    {
      id: 'card_small_wealth',
      rarity: 'rare',
      cn: '小财神',
      desc: '全局开箱价值 +15%（10 分钟）',
      icon: '💎',
      weight: 11,
      effect: { type: 'valueMult', mult: 1.15, durationMs: 10 * 60 * 1000 },
    },
    {
      id: 'card_swift_wind',
      rarity: 'rare',
      cn: '疾风',
      desc: '机器人拆包间隔 ×0.8（10 分钟）',
      icon: '⚡',
      weight: 10,
      effect: { type: 'speedMult', mult: 0.8, durationMs: 10 * 60 * 1000 },
    },
    {
      id: 'card_treasure',
      rarity: 'rare',
      cn: '聚宝盆',
      desc: '机器人存储上限 +50%（10 分钟）',
      icon: '🗃️',
      weight: 10,
      effect: { type: 'storageMult', mult: 1.5, durationMs: 10 * 60 * 1000 },
    },
    {
      id: 'card_lucky_strike',
      rarity: 'rare',
      cn: '幸运一击',
      desc: '接下来 3 次开箱必出正收益物品',
      icon: '🍀',
      weight: 9,
      effect: { type: 'luckyStreak', count: 3 },
    },

    // ========== 稀有（20%）==========
    {
      id: 'card_god_of_wealth',
      rarity: 'epic',
      cn: '财神附体',
      desc: '全局开箱价值 +30%（10 分钟）',
      icon: '💎',
      weight: 11,
      effect: { type: 'valueMult', mult: 1.30, durationMs: 10 * 60 * 1000 },
    },
    {
      id: 'card_speed_legend',
      rarity: 'epic',
      cn: '神速手',
      desc: '机器人拆包间隔锁 2s（10 分钟）',
      icon: '⚡',
      weight: 9,
      effect: { type: 'speedLock', intervalSec: 2.0, durationMs: 10 * 60 * 1000 },
    },

    // ========== 罕见（10%，拆 2 张各 5%，限时 3 分钟）==========
    {
      id: 'card_rare_blaze',
      rarity: 'legend',
      cn: '罕见 3 分钟',
      desc: '全局开箱价值 ×1.50（仅 3 分钟）',
      icon: '🔥',
      weight: 5,
      effect: { type: 'valueMult', mult: 1.50, durationMs: 3 * 60 * 1000 },
    },
    {
      id: 'card_rare_hidden',
      rarity: 'legend',
      cn: '隐藏升级',
      desc: '隐藏款出现概率大幅提升（仅 3 分钟）',
      icon: '👁️',
      weight: 5,
      effect: { type: 'hiddenBoost', boost: 5, durationMs: 3 * 60 * 1000 },
      //                                       ↑ 百分点：0 级 0.3+5=5.3%，满级 1.3+5=6.3%
    },
  ],

  // 全收集奖励（9 张卡全抽到过）
  ALL_REWARD: 50000,

  // 抽卡门槛（金币 ≥ 此值才可抽卡；前期 0 金币时不能玩）
  MIN_COIN: 0,
};

/* ========== 卡片稀有度元数据 ==========
 * 用于渲染卡片背景色 / 边框色 / 图标前缀
 * 4 档：common / rare / epic / legend
 * ========== */
const CARD_RARITY = {
  common:  { cn: '劣质', pct: 30, cssClass: 'card-r-common'  },
  rare:    { cn: '普通', pct: 40, cssClass: 'card-r-rare'    },
  epic:    { cn: '稀有', pct: 20, cssClass: 'card-r-epic'    },
  legend:  { cn: '罕见', pct: 10, cssClass: 'card-r-legend'  },
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

/* ========== 成就系统（18 个，纯展示无奖励）==========
 * 数据结构：每条 = { id, name, desc, category, icon, kind, threshold, param }
 *   - kind: 触发判定类型（main.js 的 checkAchievement 内 switch）
 *   - threshold: 大部分成就用单一阈值（如拆 100 个）
 *   - param: 个别需要额外参数的（如 timeLimit）
 * 类别 category: 'basic' | 'rare' | 'codex' | 'robot' | 'final'
 */
const ACHIEVEMENTS = [
  // ========== 🏆 入门（5）==========
  { id: 'first_step',     name: '迈出第一步',   desc: '拆开 1 个盲盒',         category: 'basic', icon: '📦', kind: 'totalOpen',  threshold: 1 },
  { id: 'open_100',       name: '初出茅庐',     desc: '累计拆 100 个盲盒',      category: 'basic', icon: '📦', kind: 'totalOpen',  threshold: 100 },
  { id: 'open_1000',      name: '拆包狂魔',     desc: '累计拆 1000 个盲盒',     category: 'basic', icon: '📦', kind: 'totalOpen',  threshold: 1000 },
  { id: 'earn_10k',       name: '小有积蓄',     desc: '累计赚到 10,000 金币',   category: 'basic', icon: '◉',  kind: 'totalEarned', threshold: 10000 },
  { id: 'earn_1m',        name: '富甲一方',     desc: '累计赚到 1,000,000 金币', category: 'basic', icon: '◉', kind: 'totalEarned', threshold: 1000000 },

  // ========== 💎 稀有 / 隐藏（5）==========
  { id: 'first_rare',     name: '第一次出"正"', desc: '任何档位开出赚钱物品（不亏本）', category: 'rare', icon: '💰', kind: 'firstRare' },
  { id: 'streak_5_rare',  name: '运气爆棚',     desc: '连续 5 次出赚钱物品（任意档位）', category: 'rare', icon: '🌟', kind: 'rareStreak', threshold: 5 },
  { id: 'streak_10_profit', name: '势如破竹',   desc: '任何档位连续 10 次正收益', category: 'rare', icon: '⚡', kind: 'profitStreak', threshold: 10 },
  { id: 'all_hidden',     name: '隐藏款收藏家', desc: '5 档隐藏款各拿到 1 次',   category: 'rare', icon: '👑', kind: 'allHidden' },
  { id: 'tier_clear',     name: '单档毕业',     desc: '某档位所有非隐藏物品全收集', category: 'rare', icon: '🎓', kind: 'tierClear' },

  // ========== 📚 图鉴（3）==========
  { id: 'codex_half',     name: '半个图鉴',     desc: '物品全图鉴收集 ≥ 50%',   category: 'codex', icon: '📖', kind: 'codexRatio', threshold: 0.5 },
  { id: 'codex_full',     name: '完整图鉴',     desc: '物品全图鉴收集 100%',     category: 'codex', icon: '📚', kind: 'codexFull' },
  { id: 'codex_full_speed', name: '图鉴速通',   desc: '30 分钟内收集全图鉴',     category: 'codex', icon: '⏱', kind: 'codexFull',  param: { timeLimit: 30 * 60 } },

  // ========== 🤖 自动化（4）==========
  { id: 'unlock_robot',   name: '雇佣机器人',   desc: '解锁自动拆包机器人',       category: 'robot', icon: ICON.robot,    kind: 'unlockRobot' },
  { id: 'unlock_restock', name: '自动化大师',   desc: '解锁自动补货',             category: 'robot', icon: ICON.restock,  kind: 'unlockRestock' },
  { id: 'robot_5m',       name: '勤劳小蜜蜂',   desc: '机器人连续运行 5 分钟',    category: 'robot', icon: '🐝', kind: 'robotRunStreak', threshold: 5 * 60 },
  { id: 'robot_30m',      name: '老黄牛',       desc: '机器人累计运行 30 分钟',   category: 'robot', icon: '🐂', kind: 'robotRunAcc',    threshold: 30 * 60 },

  // ========== 🏆 终极（2）==========
  { id: 'all_lucky_max',  name: '欧皇',         desc: '5 档幸运值全部升到满级',  category: 'final', icon: '🍀', kind: 'allLuckyMax' },
  { id: 'all_achievements', name: '成就大师',   desc: '获得其他 17 个成就',       category: 'final', icon: '🏆', kind: 'allAchievements' },
];

// 类别显示名（成就页分组用）
const ACHIEVEMENT_CATEGORY_CN = {
  basic: '入门',
  rare:  '稀有 / 隐藏',
  codex: '图鉴',
  robot: '自动化',
  final: '终极',
};
