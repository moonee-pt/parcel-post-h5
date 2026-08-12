/* ============================================================
 * ad.js — 广告位接口（先 mock，上线替换 TapTap SDK）
 * 无冷却限制：玩家想看就看。
 * ============================================================ */

const Ad = {
  /**
   * 触发一次广告播放（MVP mock：弹个 alert 模拟）
   * @returns {{ok: boolean, reward?: number, msg?: string}}
   */
  watch() {
    // 模拟播放
    alert('广告播放中... (MVP mock)\n\n+ ' + AD.REWARD_COIN + ' 金币');
    // 发放奖励
    State.coin += AD.REWARD_COIN;
    save();
    return { ok: true, reward: AD.REWARD_COIN };
  },
};
