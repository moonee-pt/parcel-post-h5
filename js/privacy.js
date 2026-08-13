/* ============================================================
 * privacy.js — 首次启动隐私政策弹窗
 * 符合 TapTap 平台审核要求：
 *   - 启动即展示
 *   - 明确"同意"和"拒绝"按钮
 *   - 复选框不得默认勾选
 *   - 拒绝后必须退出游戏
 * ============================================================ */

const STORAGE_KEY = 'pp_privacy_accepted_v1';

const Privacy = {
  /** 检查并按需显示弹窗。返回 true=已同意可继续,false=未同意需阻塞 */
  check() {
    if (this._isAccepted()) return true;
    this._show();
    return false;
  },

  _isAccepted() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  },

  _show() {
    const mask = document.getElementById('privacyMask');
    if (!mask) {
      console.error('[Privacy] 找不到 #privacyMask');
      return;
    }
    mask.style.display = 'flex';

    const cb        = document.getElementById('privacyCheck');
    const btnOk     = document.getElementById('privacyAccept');
    const btnReject = document.getElementById('privacyReject');
    const btnReRead = document.getElementById('privacyReRead');

    // 复选框未勾选时,同意按钮 disabled
    const syncBtn = () => {
      btnOk.disabled = !cb.checked;
      btnOk.classList.toggle('is-disabled', !cb.checked);
    };
    cb.checked = false;
    syncBtn();
    cb.addEventListener('change', syncBtn);

    btnOk.addEventListener('click', () => {
      if (!cb.checked) return;
      this._accept();
    });

    btnReject.addEventListener('click', () => {
      this._reject();
    });

    // "重新阅读":从拒绝后提示返回原弹窗
    if (btnReRead) {
      btnReRead.addEventListener('click', () => {
        const refused = document.getElementById('privacyRefused');
        if (refused) refused.style.display = 'none';
        cb.checked = false;
        syncBtn();
      });
    }
  },

  _accept() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      console.warn('[Privacy] 写入 localStorage 失败', e);
    }
    this._hide();
    // 通知 app 继续启动
    if (typeof Privacy._onAccept === 'function') {
      Privacy._onAccept();
    }
  },

  _reject() {
    // 显示"必须同意"提示,玩家只能返回 TapTap 或重新点击
    const refused = document.getElementById('privacyRefused');
    if (refused) refused.style.display = 'flex';
    // 尝试关闭窗口(在 TapTap 容器里大概率无效,但尝试无害)
    try { window.close(); } catch (e) { /* noop */ }
  },

  /** 提供给"我再想想"按钮:回到原弹窗 */
  reset() {
    const refused = document.getElementById('privacyRefused');
    if (refused) refused.style.display = 'none';
  },

  _hide() {
    const mask = document.getElementById('privacyMask');
    if (mask) mask.style.display = 'none';
  },
};
