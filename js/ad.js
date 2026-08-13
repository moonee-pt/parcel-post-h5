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
   * 计算本次广告金币 = 主战场 30 秒期望盈亏
   * 主战场 = 玩家当前金币能买得起的最高档盲盒
   * 30 秒 = 玩家手点 10 个盲盒
   * 满级后为正数(预期赚), Lv.0 时为负数(预期亏) → 自动保底 50
   * 破产时 State.coin < 50, 主战场 = 普通, 期望亏, 也走保底
   */
  getReward() {
    const thresholds = [
      { id: 'mythic',  min: 5000 },
      { id: 'epic',    min: 1000 },
      { id: 'luxury',  min: 200  },
      { id: 'premium', min: 50   },
      { id: 'ordinary', min: 0   },
    ];
    let mainTier = 'ordinary';
    for (const t of thresholds) {
      if (State.coin >= t.min) { mainTier = t.id; break; }
    }
    let profit = 0;
    if (typeof getCurrentStats === 'function') {
      const stats = getCurrentStats();
      profit = stats.tiers[mainTier]?.expectedProfit || 0;
    }
    // 30 秒 × 期望盈亏(亏则保底)
    return Math.max(50, Math.round(Math.max(0, profit) * 10));
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
    save();
    if (typeof UI !== 'undefined') {
      if (UI.refreshCoin) UI.refreshCoin();
      if (UI.refreshBuyRow) UI.refreshBuyRow();
      if (UI.refreshAdAmount) UI.refreshAdAmount();  // 显式同步主页金额（金额可能因为主战场升级而变化）
    }
  },
};
