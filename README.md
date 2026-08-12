# 拆快递盲盒 · Parcel Post H5

> 移动端 H5 增量游戏：花金币买快递 → 划开封带 → 拆出随机物品 → 卖金币 → 升级工具/自动化 → 滚雪球。

## 🎮 在线试玩

```bash
cd d:\Trae\game
python -m http.server 8765
# 浏览器打开 http://localhost:8765
```

> 推荐 Chrome 移动端模拟（DevTools → Toggle Device Toolbar → iPhone 12 Pro），或直接在手机浏览器访问同局域网 IP。

## ✨ 核心玩法

- **三档快递**：`📦 普通 10` / `📦📦 精品 50` / `🎁 豪华 200`，每档不同物品池与期望收益
- **划封带拆包**：手指横向滑动擦除封带 → 盒盖翻倒 → 物品飞出 + 数字跳字
- **幸运值系统**（首页主升级）：每档独立等级，仅改概率（赚钱物品权重↑，坏物相对↓）
- **价值加成**（技能树）：物品最终售价 +5% / 级，最高 20 级
- **自动化三件套**：
  - 🔄 **自动补货**（400）：拆完 → 0.2s 后自动买同档位新快递 → 放回台上
  - 🤖 **自动拆包器**（600）：每 3 秒自动买 1 个普通包裹并拆开
  - 🏪 **自动售卖站**（5000，默认开启）：拆出后自动入账
- **贴面单小游戏**：嵌入首页中央的轻量 pre-game 玩法，0 成本赚 1~2 金币
- **保底机制**：
  - 🛡️ **首抽保护**：前 3 次开包必出非坏物
  - ✨ **运气象**：连续 5 次没出稀有，下次必出

## 🛠 技术栈

- **纯原生**：HTML5 + CSS3 + ES6+ JavaScript（无任何框架）
- **零依赖**：打包体积 < 50KB，秒开
- **存档**：`localStorage`（key: `parcel_post_save_v1`）
- **响应式**：9:16 竖屏 H5，单手可玩，按钮 ≥44px

## 📂 文件结构

```
game/
├── index.html              # 入口（主页 + 技能页 + 2 个 modal）
├── css/
│   └── style.css           # 所有样式（牛皮纸 + zakka 视觉风）
├── js/
│   ├── config.js           # 数值表（快递档位 / 物品 / 幸运值 / 技能树 / 保底）
│   ├── main.js             # 状态管理 + 核心循环（rollItem / buyParcel / upgradeSkill）
│   ├── ui.js               # UI 渲染 + 事件绑定 + 动画 FX
│   ├── ad.js               # 广告位 mock（上线替换为 TapTap 激励视频 SDK）
│   └── app.js              # 启动入口
├── assets/
│   └── images/             # 美术资源（robot.png 等）
├── plan.md                 # 策划与开发计划
├── ui_brief.md             # UI 设计师 brief
└── AI_SETUP_GUIDE.md       # TapTap MCP 接入指南
```

## 🎨 视觉风格

- **主色**：牛皮纸米黄 `#F4E8D0`
- **墨色**：深咖 `#3A2817`
- **点缀**：墨绿 `#2D5F3F` + 朱红 `#B83A2E`
- **字体**：Noto Serif SC（宋体）+ Fraunces（衬线英文）+ DM Mono（数字）
- **3D 效果**：所有容器用 `box-shadow: 2px 2px 0 var(--ink)` 模拟纸质 3D
- **背景噪点**：SVG 噪点滤镜叠加，呈现做旧纸感

## 🚀 上线 TapTap

参考 [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md) 接入 TapTap MCP Server，替换 `js/ad.js` 中的 mock 为真实激励视频 SDK 即可。

## 📝 License

MIT
