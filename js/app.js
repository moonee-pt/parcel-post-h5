/* ============================================================
 * app.js — 启动入口
 * ============================================================ */

(function bootstrap() {
  function start() {
    if (typeof State === 'undefined' || typeof UI === 'undefined') {
      console.error('State 或 UI 未加载');
      return;
    }
    initState();
    UI.init();
    BGM.init();
    // 暴露给控制台调试
    window.__GAME__ = { State, UI, CONFIG, TIER, SKILL, Ad, BGM, BGM_PLAYLIST };
    console.log('[拆盲盒] 启动完成');

    // 无存档（首次启动 / 重置后）：自动弹出贴面单，先赚第一笔
    try {
      const hasSave = !!localStorage.getItem(CONFIG.SAVE_KEY);
      if (!hasSave) {
        // 延迟一帧等 UI 渲染完成
        requestAnimationFrame(() => {
          if (typeof UI.openSortingGame === 'function') {
            UI.openSortingGame();
          }
        });
      }
    } catch (e) {
      console.warn('检测存档失败', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
