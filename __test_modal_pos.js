// 验证 mf-pause-btn 在 modal-head 里的位置
// 加载页面 + 用 Playwright 截图
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 600, height: 800 } });
  await page.goto('file:///d:/Trae/game/index.html');
  await page.waitForTimeout(500);

  // 注入代码：模拟解锁 autoOpen + 打开弹窗
  await page.evaluate(() => {
    // 模拟直接调用
    State.autoOpenUnlocked = true;
    State.autoRestockUnlocked = true;
    UI.refreshAutoOpenToggle();
    UI.openTierPicker('autoOpenTier');
  });
  await page.waitForTimeout(300);

  // 截图整个弹窗
  const modal = await page.$('#tierPickerModal');
  await modal.screenshot({ path: 'd:/Trae/game/__test_modal.png' });
  console.log('截图保存到 __test_modal.png');

  // 检查 mf-pause-btn 的位置
  const pos = await page.evaluate(() => {
    const btn = document.getElementById('btnTierPause');
    const close = document.getElementById('btnTierPickerClose');
    const title = document.getElementById('tierPickerTitle');
    const head = document.querySelector('.modal-head');
    return {
      btn: btn.getBoundingClientRect(),
      close: close.getBoundingClientRect(),
      title: title.getBoundingClientRect(),
      head: head.getBoundingClientRect(),
      btnParent: btn.parentElement.className,
    };
  });
  console.log('mf-pause-btn:', pos.btn);
  console.log('modal-close:', pos.close);
  console.log('modal-title:', pos.title);
  console.log('modal-head:', pos.head);
  console.log('btn parent:', pos.btnParent);

  // 断言：pause 在 close 左边
  const ok = pos.btn.right <= pos.close.left + 2;
  console.log(ok ? '✅ pause 在 close 左边' : '❌ pause 不在 close 左边');

  // 断言：pause 在 title 右边
  const ok2 = pos.btn.left >= pos.title.right - 2;
  console.log(ok2 ? '✅ pause 在 title 右边' : '❌ pause 不在 title 右边');

  await browser.close();
})();
