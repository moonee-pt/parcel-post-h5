// 简单的 JS 语法检查（不动 State/global）
try {
  // config.js 必须最先（依赖 const CONFIG/CARD/SKILL 等）
  const fs = require('fs');
  const configSrc = fs.readFileSync('d:/Trae/game/js/config.js', 'utf8');
  // 包装成可执行的代码，屏蔽 DOM 依赖
  const wrapped = configSrc + '\n; module.exports = { CARD, CARD_RARITY, CONFIG, SKILL, TIER, LUCKY, CODEX, PITY, ICON };';
  const m = { exports: {} };
  new Function('module', 'exports', wrapped)(m, m.exports);
  const cfg = m.exports;
  console.log('config.js: OK');
  console.log('  CARD.POOL.length =', cfg.CARD.POOL.length);
  console.log('  CARD_RARITY =', Object.keys(cfg.CARD_RARITY).join(', '));
  let pctSum = 0;
  for (const r of Object.keys(cfg.CARD_RARITY)) pctSum += cfg.CARD_RARITY[r].pct;
  console.log('  概率总和 =', pctSum + '%');
} catch (e) {
  console.log('config.js ERR:', e.message);
}
