/* ============================================================
 * ad.js — 广告（TapTap 激励视频）
 *
 * 流程：
 *   1) 启动时 Ad.init()：检测 tap SDK 是否存在，存在则走真实激励视频，
 *      不存在则降级为 alert mock（方便本地开发）。
 *   2) 玩家点击"看视频"按钮 → Ad.watch(cb)：
 *      - 真实环境：调激励视频，看完自动发奖，再触发 cb
 *      - Mock 环境：弹 alert 后立即发奖并触发 cb
 *   3) 奖励金额由 Ad.getReward() 动态计算（主战场 30 秒期望盈亏）
 * ============================================================ */

/* ---------- TapTap 广告管理器（按官方 demo 回调模式封装）---------- */
class TapAdManager {
  constructor() {
    this.spaceId = '1054324';  // 竖屏广告位 ID（check_ads_status 自动匹配）
    this.rewardedVideoAd = null;
    this.interstitialAd = null;
    this.bannerAd = null;
    this.rewardCallback = null;
  }

  init() {
    console.log('[Ad] 开始初始化, spaceId=' + this.spaceId);

    if (typeof tap === 'undefined') {
      console.warn('[Ad] tap SDK 未加载, 跳过真实广告初始化');
      return false;
    }

    this._initRewardedVideo();
    return true;
  }

  onReward(cb) {
    if (typeof cb !== 'function') {
      console.error('[Ad] onReward 参数必须是函数');
      return;
    }
    this.rewardCallback = cb;
  }

  showRewardedVideo() {
    console.log('[Ad] 调用 showRewardedVideo()');
    if (!this.rewardedVideoAd) {
      console.error('[Ad] 激励视频未初始化');
      return;
    }
    this.rewardedVideoAd.show();
  }

  destroy() {
    if (this.rewardedVideoAd) {
      this.rewardedVideoAd.destroy();
      this.rewardedVideoAd = null;
    }
    if (this.bannerAd) {
      this.bannerAd.destroy();
      this.bannerAd = null;
    }
  }

  _initRewardedVideo() {
    console.log('[Ad] 初始化激励视频, 广告位 ID:', this.spaceId);

    this.rewardedVideoAd = tap.createRewardedVideoAd({
      adUnitId: this.spaceId,
    });

    this.rewardedVideoAd.onLoad(() => {
      console.log('[Ad] 🎉 激励视频加载成功');
    });

    this.rewardedVideoAd.onError((err) => {
      console.error('[Ad] 激励视频错误:', err && (err.errMsg || err.errCode));
    });

    this.rewardedVideoAd.onClose((res) => {
      console.log('[Ad] 激励视频关闭');
      if (res && res.isEnded) {
        console.log('[Ad] ✅ 用户完整观看, 发放奖励');
        if (this.rewardCallback) {
          try { this.rewardCallback(); }
          catch (e) { console.error('[Ad] 奖励回调执行失败:', e); }
        } else {
          console.warn('[Ad] 未绑定奖励回调');
        }
      } else {
        console.log('[Ad] ⚠️ 用户提前关闭, 不发奖');
      }
    });

    // 预加载
    this.rewardedVideoAd.load().catch((err) => {
      console.error('[Ad] 预加载失败:', err);
    });
  }
}

// 全局单例
const adManager = new TapAdManager();

/* ---------- 对外接口 ---------- */
const Ad = {
  _mockMode: false,

  /**
   * 初始化（启动时调一次）
   */
  init() {
    const ok = adManager.init();
    this._mockMode = !ok;
    if (this._mockMode) {
      console.log('[Ad] 当前为 mock 模式（本地或非 TapTap 环境）');
    }
  },

  /**
   * 计算本次广告金币
   *
   * 机制：取所有档位中"赚钱概率 > 50%"的最高档
   *   等级顺序 mythic > epic > luxury > premium > ordinary
   *   该档单次期望盈亏 × 10（×10 = 30 秒手点收益）
   *   不封顶
   *   0 级玩家（无档位 winPct > 50%）保底 50
   *
   * 例（代码实测）：
   *   0 级：仅 ordinary winPct=51.8%>50% → +1.9 × 10 = 19 → 保底 50
   *   Lv.1：mythic winPct=56.6%>50% → +1544 × 10 = 15442
   *   Lv.5：mythic winPct=85.0%>50% → +4897 × 10 = 48970
   */
  getReward() {
    if (typeof getCurrentStats !== 'function') return 50;
    const stats = getCurrentStats();
    // 优先级：高档 → 低档
    const order = ['mythic', 'epic', 'luxury', 'premium', 'ordinary'];
    for (const tierId of order) {
      const t = stats.tiers[tierId];
      if (t && (t.winPct || 0) > 50) {
        // 该档 winPct>50%，作为广告奖励档
        return Math.max(50, Math.round((t.expectedProfit || 0) * 10));
      }
    }
    // 没有档位 winPct>50%（0 级玩家）：保底 50
    return 50;
  },

  /**
   * 触发一次激励视频广告
   * @param {Function} onGranted - 看完广告（mock 模式立即触发）后的回调，
   *                              形参 { ok: true, reward: 实际金币 | 0 }
   * @param {Object}  [opts]
   * @param {boolean} [opts.skipReward=false] - true 时只触发回调不发金币
   *                                              （用于"看广告解锁收益数据"等纯解锁场景）
   */
  watch(onGranted, opts) {
    const skipReward = !!(opts && opts.skipReward);
    const reward = skipReward ? 0 : this.getReward();
    if (this._mockMode) {
      // 本地/开发环境降级：弹 alert 模拟
      if (skipReward) {
        alert('广告播放中... (mock)\n\n（仅解锁，不发金币）');
      } else {
        alert('广告播放中... (mock)\n\n+ ' + reward + ' 金币');
      }
      if (!skipReward) this._grant(reward);
      if (onGranted) onGranted({ ok: true, reward });
      return;
    }
    // 真实环境：绑定本次奖励回调 → 显示广告
    adManager.onReward(() => {
      if (!skipReward) this._grant(reward);
      if (onGranted) onGranted({ ok: true, reward });
    });
    adManager.showRewardedVideo();
  },

  /**
   * 内部：发奖 + 通知 UI 刷新
   */
  _grant(amount) {
    State.coin += amount;
    if (typeof addEarned === 'function') addEarned(amount);
    save();
    if (typeof UI !== 'undefined') {
      if (UI.refreshCoin) UI.refreshCoin();
      if (UI.refreshBuyRow) UI.refreshBuyRow();
      if (UI.refreshAdAmount) UI.refreshAdAmount();  // 显式同步主页金额（金额可能因为主战场升级而变化）
    }
  },
};
