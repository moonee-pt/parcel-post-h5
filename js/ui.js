/* ============================================================
 * ui.js — UI 渲染 + 事件绑定
 * ============================================================ */

/* ---------- 广告奖励弹窗 SVG（复古印刷 + 硬边墨线）---------- */
const AD_SVG = {
  // 1. 主页看广告+钱：复古电视机 + 金币
  tvCoin: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 天线 -->
    <line x1="32" y1="22" x2="22" y2="8" stroke="#3A2817" stroke-width="3" stroke-linecap="round"/>
    <line x1="68" y1="22" x2="78" y2="8" stroke="#3A2817" stroke-width="3" stroke-linecap="round"/>
    <circle cx="22" cy="8" r="2.5" fill="#3A2817"/>
    <circle cx="78" cy="8" r="2.5" fill="#3A2817"/>
    <!-- 机身 -->
    <rect x="14" y="22" width="72" height="50" rx="4" fill="#C9A961" stroke="#3A2817" stroke-width="3"/>
    <!-- 屏幕 -->
    <rect x="22" y="30" width="44" height="34" rx="2" fill="#F4E8D0" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 屏幕里的 + 金币 -->
    <circle cx="44" cy="47" r="9" fill="#D4AF37" stroke="#3A2817" stroke-width="2"/>
    <text x="44" y="51" text-anchor="middle" font-family="Fraunces, serif" font-size="11" font-weight="900" fill="#3A2817">$</text>
    <!-- 旋钮 -->
    <circle cx="74" cy="38" r="3.5" fill="#3A2817"/>
    <circle cx="74" cy="52" r="3.5" fill="#3A2817"/>
    <!-- 底座 -->
    <rect x="38" y="72" width="24" height="6" fill="#C9A961" stroke="#3A2817" stroke-width="2.5"/>
    <line x1="30" y1="80" x2="70" y2="80" stroke="#3A2817" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  // 2. 升级页技能解锁：礼盒
  giftBox: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 盒身 -->
    <rect x="18" y="48" width="64" height="38" fill="#B83A2E" stroke="#3A2817" stroke-width="3"/>
    <!-- 盒盖（厚一点）-->
    <rect x="14" y="38" width="72" height="16" fill="#D4AF37" stroke="#3A2817" stroke-width="3"/>
    <!-- 竖向丝带 -->
    <rect x="46" y="38" width="8" height="48" fill="#2D5F3F" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 横向丝带 -->
    <rect x="14" y="44" width="72" height="6" fill="#2D5F3F" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 蝴蝶结（左右两瓣）-->
    <path d="M50 38 Q34 24 30 36 Q34 42 50 38 Z" fill="#2D5F3F" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 38 Q66 24 70 36 Q66 42 50 38 Z" fill="#2D5F3F" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 中心结 -->
    <rect x="46" y="32" width="8" height="10" fill="#2D5F3F" stroke="#3A2817" stroke-width="2.5"/>
    <!-- 高光小点 -->
    <circle cx="26" cy="58" r="2" fill="#F4E8D0" opacity="0.5"/>
    <circle cx="74" cy="70" r="2" fill="#F4E8D0" opacity="0.5"/>
  </svg>`,
  // 3. 破产救援：钱袋 + 心
  rescue: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 袋口扎带 -->
    <path d="M28 28 Q50 20 72 28 L66 38 L34 38 Z" fill="#3A2817" stroke="#3A2817" stroke-width="2" stroke-linejoin="round"/>
    <!-- 袋身 -->
    <path d="M34 38 Q18 56 26 82 Q38 90 50 88 Q62 90 74 82 Q82 56 66 38 Z"
          fill="#B83A2E" stroke="#3A2817" stroke-width="3" stroke-linejoin="round"/>
    <!-- 钱币（金色腰带） -->
    <ellipse cx="50" cy="58" rx="26" ry="4" fill="#D4AF37" stroke="#3A2817" stroke-width="2"/>
    <!-- 心形贴章 -->
    <path d="M50 64 C46 60 40 60 40 66 C40 72 50 80 50 80 C50 80 60 72 60 66 C60 60 54 60 50 64 Z"
          fill="#F4E8D0" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 提手 -->
    <line x1="50" y1="20" x2="50" y2="10" stroke="#3A2817" stroke-width="2.5"/>
  </svg>`,
  // 4. 播放icon：实心三角 + 外圈（用于"立即领取"按钮）
  play: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- 外圈 -->
    <circle cx="50" cy="50" r="38" fill="#C9A961" stroke="#3A2817" stroke-width="3"/>
    <!-- 内圈（更深） -->
    <circle cx="50" cy="50" r="32" fill="#F4E8D0" stroke="#3A2817" stroke-width="2"/>
    <!-- 三角（向右） -->
    <path d="M40 30 L72 50 L40 70 Z" fill="#3A2817" stroke="#3A2817" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`,
};

/* ---------- 幸运值详情解锁状态（一次性全部解锁）---------- */
const LUCKY_UNLOCK_KEY = 'parcel_lucky_unlock_v1';
function isLuckyUnlocked() {
  return localStorage.getItem(LUCKY_UNLOCK_KEY) === '1';
}
function setLuckyUnlocked() {
  localStorage.setItem(LUCKY_UNLOCK_KEY, '1');
}

const UI = {
  // 当前技能 tab
  currentTab: 'A',

  /* ========== 初始化 ========== */
  init() {
    // ★ 开发者模式：localStorage 有标记就恢复（让测试按钮显示）
    if (localStorage.getItem('parcel_dev_mode_v1') === '1') {
      document.body.classList.add('dev-mode');
    }
    this.renderBuyRow();
    this.renderSkillTabs();
    this.renderSkillList();
    this.bindEvents();
    this.refreshCoin();
    this.refreshAdAmount();  // 显式同步主页看视频金额（兜底，不依赖 _renderCoin）
    this.refreshStatsPreview();
    this.refreshLuckyPreview();
    this.refreshRobotChip();
    this.refreshRestockToggle();
    this.refreshAutoOpenToggle();
    this.refreshClearBadge();  // 同步通关徽章
    this.renderStorageBadge();  // 初始化挂机存储角标（存储 > 0 才显示）
    this.refreshCodexBadge();  // 初始化图鉴红点
    this.refreshCardBadge();   // 初始化抽卡按钮红点（buff 数量）
    // 后台每秒刷新抽卡红点（buff 可能过期）
    if (this._cardBadgeTicker) clearInterval(this._cardBadgeTicker);
    this._cardBadgeTicker = setInterval(() => {
      if (document.getElementById('page-home')?.classList.contains('active')) {
        this.refreshCardBadge();
      }
    }, 1000);
    this.setupDragScroll(document.getElementById('buyRow'));
    this._bindDevLogoTrigger();
  },

  /* ========== 开发者模式入口：主页 logo 连点 5 次 + 输入密钥 814 ========== */
  _bindDevLogoTrigger() {
    const logo = document.getElementById('logoDevTrigger');
    if (!logo) return;
    // 已经在开发者模式中：连点 5 下可关闭（方便打包前关掉）
    let count = 0;
    let lastTs = 0;
    logo.addEventListener('click', (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (now - lastTs > 800) count = 0;  // 超过 800ms 间隔算重新开始
      lastTs = now;
      count++;
      if (count < 5) return;
      count = 0;
      this._promptDevMode();
    });
  },
  _promptDevMode() {
    // 1 分钟内被锁过就不要再弹（防误触 / 防别人乱试）
    const lockUntil = parseInt(localStorage.getItem('parcel_dev_lock_v1') || '0', 10);
    if (lockUntil > Date.now()) {
      const remain = Math.ceil((lockUntil - Date.now()) / 1000);
      this.spawnPityTag('restock-fail', `⏳ ${remain}秒后再试`);
      return;
    }
    const inDev = document.body.classList.contains('dev-mode');
    const hint = inDev ? '已开启开发者模式，输入"确认"退出：' : '请输入开发者密钥：';
    const input = window.prompt(hint, '');
    if (input === null) return;  // 取消
    if (inDev) {
      // 退出模式
      if (input.trim() === '确认') {
        document.body.classList.remove('dev-mode');
        localStorage.removeItem('parcel_dev_mode_v1');
        this.spawnPityTag('restock-fail', '已退出开发者模式');
      } else {
        this.spawnPityTag('restock-fail', '已取消');
      }
      return;
    }
    // 进入模式
    if (input.trim() === '814') {
      document.body.classList.add('dev-mode');
      localStorage.setItem('parcel_dev_mode_v1', '1');
      this.spawnPityTag('restock', '🛠 开发者模式已开启');
    } else {
      // 错误：锁定 60 秒
      localStorage.setItem('parcel_dev_lock_v1', String(Date.now() + 60 * 1000));
      this.spawnPityTag('restock-fail', '❌ 密钥错误，60秒内不可再试');
    }
  },

  /* ========== 鼠标 + 触摸横向滚动 ==========
   * 浏览器原生只支持触摸平移，鼠标拖动 + 触屏 swipe 都走 JS 兜底
   * 桌面端：mousedown / mousemove
   * 移动端：touchstart / touchmove（防止与卡片 click 冲突）
   */
  setupDragScroll(row) {
    if (!row || row._dragBound) return;
    row._dragBound = true;
    let dragging = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;
    let pointerId = null;

    const start = (clientX) => {
      dragging = true;
      moved = false;
      startX = clientX;
      scrollStart = row.scrollLeft;
      row.classList.add('dragging');
    };
    const move = (clientX) => {
      if (!dragging) return;
      const dx = clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      row.scrollLeft = scrollStart - dx;
    };
    const end = () => {
      dragging = false;
      pointerId = null;
      row.classList.remove('dragging');
    };

    // 鼠标（桌面）
    row.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      start(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging || pointerId !== null) return;
      e.preventDefault();
      move(e.clientX);
    });
    window.addEventListener('mouseup', end);

    // 触摸（移动）
    row.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      start(e.touches[0].clientX);
    }, { passive: true });
    row.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      move(e.touches[0].clientX);
    }, { passive: true });
    row.addEventListener('touchend', end);
    row.addEventListener('touchcancel', end);

    // 拖动后抑制卡片点击（capture 阶段先于卡片 click 触发）
    row.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);
  },

  /* ========== 购买按钮 ========== */
  renderBuyRow() {
    const row = document.getElementById('buyRow');
    if (!row) return;
    row.innerHTML = '';

    // 贴面单卡片（最左边）
    const sortCard = document.createElement('div');
    sortCard.className = 'buy-card sort-card';
    sortCard.innerHTML = `
      <span class="icon">📮</span>
      <div class="tier">SORTING</div>
      <div class="price">贴面单</div>
      <div class="risk">赚金币</div>
    `;
    sortCard.addEventListener('click', () => this.openSortingGame());
    row.appendChild(sortCard);

    // 盲盒档位卡片
    for (const id in TIER) {
      const t = TIER[id];
      const card = document.createElement('div');
      card.className = 'buy-card' + (t.className ? ' ' + t.className : '');
      card.dataset.tier = id;
      card.innerHTML = `
        <span class="icon">${t.icon}</span>
        <div class="tier">${t.label}</div>
        <div class="price"><span class="c">◉</span>${formatCoin(t.price)}</div>
        <div class="risk">${t.riskLabel}</div>
        <div class="restock-tag">自动补货中</div>
        <div class="restock-badge">🔄</div>
      `;
      card.addEventListener('click', () => this.handleBuy(id));
      row.appendChild(card);
    }
    this.refreshBuyRow();
  },

  refreshBuyRow() {
    document.querySelectorAll('.buy-card').forEach(card => {
      // 贴面单卡片跳过
      if (card.classList.contains('sort-card')) return;
      const tier = TIER[card.dataset.tier];
      const canAfford = State.coin >= tier.price;
      const hasPending = !!State.pending;
      // 买不起：有待拆 = 完全不可点；买不起 = 仍可点（提示"金币不足"）
      card.disabled = hasPending;
      card.classList.toggle('cant-afford', !canAfford);
      // 自动补货档位高亮
      const isRestockTier = State.autoRestockUnlocked && State.autoRestockTier === card.dataset.tier;
      card.classList.toggle('restock-on', isRestockTier);
    });
  },

  handleBuy(tierId) {
    const tier = TIER[tierId];
    // 已有 pending：算退多少钱（pending + nextPending）
    let refund = 0;
    if (State.pending) {
      refund += TIER[State.pending.tierId].price;
      if (State.nextPending) {
        refund += TIER[State.nextPending.tierId].price;
      }
    }
    // 先校验：退完还买得起吗
    if (State.coin + refund < tier.price) {
      const need = tier.price - State.coin;
      if (refund > 0) {
        this.spawnPityTag('restock-fail', `金币不足，还差 ${need} ◉（退还 ${refund} ◉ 后仍不够）`);
      } else {
        this.spawnPityTag('restock-fail', `金币不足，还差 ${need} ◉`);
      }
      return;
    }
    // 真退 + 真买
    if (State.pending) {
      if (State.nextPending) State.nextPending = null;
      State.pending = null;
      State.coin += refund;
    }
    State.coin -= tier.price;
    State.pending = { tierId, ts: Date.now() };
    save();
    // 视觉：刷新桌面盲盒
    this.showParcel(tierId);
    this.refreshCoin();
    this.refreshBuyRow();
    // 重建预备队（按当前 autoRestockTier）
    if (State.autoRestockUnlocked && !State.autoRestockPaused) {
      if (typeof tryAutoRestock === 'function') {
        const r = tryAutoRestock();
        if (r && r.ok && r.where === 'next') {
          this.refreshCoin();
        }
      }
    }
    // 提示（退款时显示）
    if (refund > 0) {
      this.spawnPityTag('restock', `已购买 ${tier.cn} · 退还 ${formatCoin(refund)} ◉`);
    }
  },

  /* ========== 盲盒 ========== */
  showParcel(tierId) {
    const tier = TIER[tierId];
    const empty = document.getElementById('parcelEmpty');
    const parcel = document.getElementById('parcel');
    if (empty) empty.style.display = 'none';
    if (parcel) {
      parcel.style.display = 'block';
      parcel.dataset.tier = tierId;
      parcel.dataset.state = 'sealed';
      // 重置封带
      const tapeH = document.getElementById('parcelTapeH');
      const tapeV = document.getElementById('parcelTapeV');
      if (tapeH) tapeH.style.clipPath = 'inset(0 0 0 0)';
      if (tapeV) tapeV.style.clipPath = 'inset(0 0 0 0)';
      // 提示文字
      const hint = document.getElementById('swipeHint');
      if (hint) hint.classList.remove('hide');
    }
  },

  onParcelCleared() {
    const empty = document.getElementById('parcelEmpty');
    const parcel = document.getElementById('parcel');
    if (parcel) parcel.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    this.refreshBuyRow();
  },

  /* ========== 主位清空时，无缝把预备队数据换到主位（无视觉预备队） ========== */
  swapToNextParcel() {
    const main = document.getElementById('parcel');
    const empty = document.getElementById('parcelEmpty');
    if (!main) return;
    // 把预备队的数据同步到主位
    main.dataset.state = 'sealed';
    main.dataset.tier = State.pending.tierId;  // 同步档位(切档后预备队可能是新档,颜色要跟着变)
    main.style.display = 'block';
    // 重置封带
    const tapeH = document.getElementById('parcelTapeH');
    const tapeV = document.getElementById('parcelTapeV');
    if (tapeH) tapeH.style.clipPath = 'inset(0 0 0 0)';
    if (tapeV) tapeV.style.clipPath = 'inset(0 0 0 0)';
    // 隐藏空状态
    if (empty) empty.style.display = 'none';
  },

  /* ========== 拆包 FX ========== */
  onItemRolled(item, tierId) {
    // 隐藏提示
    const hint = document.getElementById('swipeHint');
    if (hint) hint.classList.add('hide');

    // 保底提示（只对普通包裹的"正收益保底"提示，其他不弹）
    if (item.isOrdinaryPity) {
      setTimeout(() => this.spawnPityTag('ordinary-pity'), 250);
    }

    // 隐藏款暴富特效：全屏豪华动画
    if (item.isHidden) {
      setTimeout(() => {
        // 抽出隐藏款时播放一次音效
        if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('hidden');
        this.spawnHiddenReveal(item);
      }, 250);
      this.refreshCodexBadge();  // 隐藏款也更新图鉴进度
      return; // 隐藏款跳过常规 fx
    }

    // 触发 fx
    this.spawnFx(item, tierId);
    // 自动售卖站开启 → 直接入账
    if (State.autoSellUnlocked) {
      setTimeout(() => {
        State.coin += item.finalValue;
        if (typeof addEarned === 'function') addEarned(item.finalValue);
        save();
        this.refreshCoin();
        this.refreshBuyRow();
        this.refreshSkillList(); // 钱变了，升级按钮状态要更新
        // 自动补货触发由 main.js 在 parcel cleared 后统一处理
      }, 600);
    } else {
      // 手动售卖：显示"出售"按钮（这里 MVP 先自动入账，TODO: 改成手动）
      State.coin += item.finalValue;
      if (typeof addEarned === 'function') addEarned(item.finalValue);
      save();
      this.refreshCoin();
    }
    // 物品收集状态可能变化，刷新主页图鉴红点
    this.refreshCodexBadge();
  },

  spawnFx(item, tierId) {
    const fx = document.getElementById('parcelFx');
    if (!fx) return;
    // 1. glow burst
    const glow = document.createElement('div');
    glow.className = 'fx-glow';
    fx.appendChild(glow);
    requestAnimationFrame(() => glow.classList.add('go'));
    setTimeout(() => glow.remove(), 700);
    // 2. item fly
    const itemEl = document.createElement('div');
    itemEl.className = 'fx-item';
    itemEl.textContent = item.emoji;
    fx.appendChild(itemEl);
    requestAnimationFrame(() => itemEl.classList.add('go'));
    setTimeout(() => itemEl.remove(), CONFIG.ITEM_FX_DURATION + 100);
    // 3. 数字跳字
    const numEl = document.createElement('div');
    numEl.className = 'fx-num' + (item.finalValue < 0 ? ' minus' : '');
    const sign = item.finalValue >= 0 ? '+' : '';
    numEl.textContent = `${sign}${item.finalValue} ◉`;
    fx.appendChild(numEl);
    requestAnimationFrame(() => numEl.classList.add('go'));
    setTimeout(() => numEl.remove(), CONFIG.NUM_FX_DURATION + 100);
    // 4. 暴击追加 sparkles
    if (item.isCrit) {
      for (let i = 0; i < 6; i++) {
        const sp = document.createElement('div');
        sp.className = 'fx-sparkle';
        const angle = (i / 6) * Math.PI * 2;
        const dist = 60 + Math.random() * 30;
        sp.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        sp.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        sp.style.background = i % 2 === 0 ? 'var(--gold)' : 'var(--gold-bright)';
        fx.appendChild(sp);
        requestAnimationFrame(() => sp.classList.add('go'));
        setTimeout(() => sp.remove(), 900);
      }
    }
  },

  /* ========== 自动拆包器 tick ==========
   * cost = 本次扣的盲盒价格
   * gain = 物品实际售价
   * net  = gain - cost（正=赚，负=亏，0=回本）
   * 金币显示直接跳到最终值（State.coin 已经在 main.js 里一次性算好），
   * 只飘一次净差值提示，不再分段飘"-X ◉"和"+Y ◉"。
   */
  onAutoOpen(tierId, item, cost, gain, net) {
    this.refreshCoinSilent();  // 自动拆包静默刷数字（不加 bump 动效）
    this.refreshBuyRow();
    this.refreshSkillList();
    this.renderStorageBadge();  // 同步刷新机器人角标（存储进度）
    // 在机器人 chip 上方飘一行"档位 + 物品 + 净差值"小字
    this.spawnAutoFloat(tierId, item, cost, gain, net);
  },

  spawnAutoFloat(tierId, item, cost, gain, net) {
    const chip = document.getElementById('robotChip');
    if (!chip) return;
    // 单行飘字：物品 icon + 净差值
    const numEl = document.createElement('div');
    numEl.className = 'auto-float-num' + (net < 0 ? ' minus' : '') + (net === 0 ? ' even' : '');
    const sign = net >= 0 ? '+' : '';
    // ★ 隐藏款 emoji 是 SVG 字符串(textContent 会爆代码),用 📦 兜底
    const emoji = (item.emoji && typeof item.emoji === 'string' && !item.emoji.startsWith('<'))
      ? item.emoji
      : '📦';
    numEl.textContent = `${emoji} ${sign}${formatCoin(net)} ◉`;
    chip.appendChild(numEl);
    requestAnimationFrame(() => numEl.classList.add('go'));
    setTimeout(() => numEl.remove(), 1400);
  },

  /* ========== 机器人挂机存储角标（点击即领取）========== */
  renderStorageBadge() {
    const badge = document.getElementById('storageBadge');
    if (!badge) return;
    const storage = (typeof State !== 'undefined') ? (State.idleStorage || 0) : 0;
    const max = (typeof State !== 'undefined') ? (State.idleStorageMax || 50) : 50;
    const unlocked = (typeof State !== 'undefined') && State.autoOpenUnlocked;
    // 未解锁机器人 或 存储 = 0 → 隐藏
    if (!unlocked || storage <= 0) {
      badge.hidden = true;
      badge.classList.remove('full');
      return;
    }
    badge.hidden = false;
    // 数字
    const bn = badge.querySelector('.sb-num');
    if (bn) bn.textContent = `${Math.floor(storage)}/${max}`;
    // 满状态
    if (storage >= max) badge.classList.add('full');
    else badge.classList.remove('full');
  },

  /**
   * 存储已满时弹出"双倍领取"弹窗：两个按钮（立即领取 / 看广告双倍）
   * 存储未满时直接调 collectIdleStorage() 即可，不需要此弹窗
   */
  spawnStorageClaimModal(amount) {
    // 弹窗打开本身不播音效（避免和"领取金币"coin 反馈混淆）
    document.getElementById('storageClaimModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'storageClaimModal';
    modal.className = 'modal storage-claim-modal show';
    const doubleAmt = amount * 2;
    modal.innerHTML = `
      <div class="modal-card storage-claim-card">
        <button class="arm-close" id="scmClose" aria-label="关闭">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="arm-icon">${AD_SVG.rescue}</div>
        <div class="arm-sub">选择领取方式</div>
        <div class="scm-rows">
          <button class="scm-row scm-row--plain" id="scmPlain">
            <span class="scm-row-icon">${AD_SVG.play}</span>
            <span class="scm-row-label">立即领取</span>
            <span class="scm-row-val">+${formatCoin(amount)} ◉</span>
          </button>
          <button class="scm-row scm-row--ad" id="scmDouble">
            <span class="scm-row-icon">${AD_SVG.tvCoin}</span>
            <span class="scm-row-label">看广告双倍</span>
            <span class="scm-row-val">+${formatCoin(doubleAmt)} ◉</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    };
    modal.querySelector('#scmClose')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    // 立即领取（×1）
    modal.querySelector('#scmPlain')?.addEventListener('click', () => {
      if (typeof collectIdleStorage === 'function') {
        const r = collectIdleStorage(1);
        if (r && r.ok) {
          if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
          UI.spawnPityTag && UI.spawnPityTag('collect', `📥 领取 +${r.amount} ◉`);
        }
      }
      close();
    });
    // 看广告双倍（×2）
    modal.querySelector('#scmDouble')?.addEventListener('click', () => {
      Ad.watch((adRet) => {
        if (!adRet || !adRet.ok) return;
        if (typeof collectIdleStorage === 'function') {
          const r = collectIdleStorage(2);
          if (r && r.ok) {
            if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
            UI.spawnPityTag && UI.spawnPityTag('collect', `📥 双倍领取 +${r.amount} ◉`);
          }
        }
        close();
      });
    });
  },

  spawnStorageFullToast() { /* 已废弃：见 refreshRobotChip 头顶小字 */ },
  spawnCantAffordToast(cost, coin) { /* 已废弃：见 refreshRobotChip 头顶小字 */ },

  /* ========== 测试隐藏款（开发用）：随机挑一个档位的隐藏款触发揭示 ========== */
  testHiddenReveal() {
    const tierIds = Object.keys(TIER);
    const tierId = tierIds[Math.floor(Math.random() * tierIds.length)];
    const tier = TIER[tierId];
    const hidden = tier.items.find(it => it.hidden);
    if (!hidden) return;
    const fakeItem = {
      name: hidden.name,
      emoji: hidden.emoji,
      value: hidden.value,
      finalValue: hidden.value,
      isHidden: true,
    };
    this.spawnHiddenReveal(fakeItem);
  },

  /* ========== 测试图鉴（开发用）：随机点亮一个未收集的物品 ========== */
  testCodexAddItem() {
    // 收集所有未抽到的物品
    const pending = [];
    for (const tierId in TIER) {
      const collected = State.collection[tierId] || {};
      for (const it of TIER[tierId].items) {
        if (!collected[it.name]) pending.push({ tierId, it });
      }
    }
    if (pending.length === 0) {
      this.spawnPityTag('lucky', '⚠️ 图鉴已全收集');
      return;
    }
    const pick = pending[Math.floor(Math.random() * pending.length)];
    markItemCollected(pick.tierId, pick.it.name);
    save();
    this.spawnPityTag('collect', `📖 ${TIER[pick.tierId].cn} · 收录 ${pick.it.name}`);
    // 如果弹窗开着，刷新弹窗
    if (document.getElementById('codexModal')?.classList.contains('show')) {
      this.renderCodexContent();
    }
  },

  /* ========== 隐藏款豪华揭示动画（屏幕中央） ========== */
  spawnHiddenReveal(item) {
    // 入账（隐藏款必入账，玩家开出来就获得金币）
    State.coin += item.finalValue;
    if (typeof addEarned === 'function') addEarned(item.finalValue);
    save();
    this.refreshCoin();
    this.refreshBuyRow();
    this.refreshSkillList();

    // 创建全屏遮罩 + 中央揭示（复古印刷奢华风）
    const overlay = document.createElement('div');
    overlay.className = 'hidden-reveal';
    overlay.innerHTML = `
      <div class="hr-particles">
        ${Array.from({length: 18}).map((_,i) => `<i style="--i:${i}"></i>`).join('')}
      </div>
      <div class="hr-card">
        <span class="hr-corner hr-corner-tl"></span>
        <span class="hr-corner hr-corner-tr"></span>
        <span class="hr-corner hr-corner-bl"></span>
        <span class="hr-corner hr-corner-br"></span>
        <div class="hr-stamp">EXCLUSIVE</div>
        <div class="hr-eyebrow">— 隐 藏 款 —</div>
        <div class="hr-icon">${item.emoji}</div>
        <div class="hr-name">${item.name}</div>
        <div class="hr-rule"></div>
        <div class="hr-value">+${formatCoin(item.finalValue)}</div>
        <div class="hr-coin">金 币</div>
        <div class="hr-tap">· 点击任意处关闭 ·</div>
      </div>
    `;
    document.body.appendChild(overlay);
    // 强制 reflow
    overlay.offsetHeight;
    overlay.classList.add('show');

    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 400);
    };
    overlay.addEventListener('click', close, { once: true });
    // 自动关闭
    setTimeout(close, 4500);
  },

  /* ========== 保底提示横幅（普通包必中 / 自动补货 / 幸运值升级）========== */
  spawnPityTag(kind, customText) {
    // kind: 'ordinary-pity' | 'restock' | 'restock-fail' | 'lucky' | 'hidden' | 'storage-full' | 'collect'
    const map = {
      'ordinary-pity': { text: '🎁 运气象必中！',  color: 'var(--red)',  dur: 1400 },
      restock:        { text: customText || '🔄 自动补货', color: 'var(--green)', dur: 900 },
      'restock-fail': { text: customText || '❌ 补货失败', color: 'var(--red)', dur: 1400 },
      lucky:          { text: customText || '🍀 幸运值提升', color: 'var(--green)', dur: 1200 },
      hidden:         { text: '✦ 隐藏款',         color: 'var(--gold-bright)', dur: 1800 },
      'storage-full': { text: customText || '存储已满，请领取', color: 'var(--ink-soft)', dur: 1400 },
      collect:        { text: customText || '📥 领取成功',     color: 'var(--green)',  dur: 1200 },
    };
    const cfg = map[kind] || map['ordinary-pity'];
    const el = document.createElement('div');
    el.className = 'pity-tag';
    el.style.color = cfg.color;
    el.style.borderColor = cfg.color;
    el.style.boxShadow = `2px 2px 0 ${cfg.color}`;
    el.textContent = cfg.text;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('go'));
    setTimeout(() => el.remove(), cfg.dur + 400);
  },

  /* ========== 金币显示 ========== */
  refreshCoin() {
    this._renderCoin(true);
  },
  /** 静默刷新：只同步数字，不加 bump 动效（自动拆包这种高频、净额小的场景用）*/
  refreshCoinSilent() {
    this._renderCoin(false);
  },
  _renderCoin(animate) {
    const els = [
      document.getElementById('coinDisplay'),
      document.getElementById('coinDisplay2'),
    ].filter(Boolean);
    const txt = formatCoin(State.coin);
    els.forEach(el => {
      if (el.textContent !== txt) {
        el.textContent = txt;
        if (animate) {
          el.classList.add('bump');
          setTimeout(() => el.classList.remove('bump'), 130);
        }
      }
    });
    // 同步主页"看视频"按钮金额(主战场/幸运值变化会影响广告金币)
    this.refreshAdAmount();
    // 同步抽卡按钮锁定状态（金币跨过 800 触发解锁提示）
    this.refreshCardBadge();
  },

  /**
   * 同步主页"看视频"按钮的金额显示(动态跟随主战场)
   * 顺便同步幸运值弹窗里的"解锁收益分析"按钮
   */
  refreshAdAmount() {
    let reward = 0;
    try {
      if (typeof Ad === 'undefined' || typeof Ad.getReward !== 'function') return;
      reward = Ad.getReward();
    } catch (e) {
      console.warn('[UI.refreshAdAmount] getReward 失败:', e);
      return;
    }
    const txt = '+' + formatCoin(reward) + ' ◉';
    // 主页
    const main = document.querySelector('#btnWatchAd .ad-t2');
    if (main) main.textContent = txt;
    // 幸运值弹窗里
    const lucky = document.getElementById('luckyUnlockAmount');
    if (lucky) lucky.textContent = txt;
  },

  /* ========== 金币扣除飘字（自动补货扣下一个时用）========== */
  showCoinDeduct(amount) {
    const el = document.getElementById('coinDeduct');
    if (!el) return;
    el.textContent = `-${formatCoin(amount)} ◉`;
    // 重启动画
    el.classList.remove('go');
    void el.offsetWidth;  /* 强制 reflow */
    el.classList.add('go');
  },

  /* ========== 技能页 ========== */
  renderSkillTabs() {
    const bar = document.getElementById('skillTabBar');
    if (!bar) return;
    bar.innerHTML = '';
    SKILL_TABS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'skill-tab' + (t.id === this.currentTab ? ' active' : '');
      btn.textContent = t.label;
      btn.addEventListener('click', () => {
        this.currentTab = t.id;
        this.renderSkillTabs();
        this.renderSkillList();
      });
      bar.appendChild(btn);
    });
  },

  renderSkillList() {
    const list = document.getElementById('skillList');
    if (!list) return;
    list.innerHTML = '';
    for (const id in SKILL) {
      const def = SKILL[id];
      if (def.cat !== this.currentTab) continue;
      list.appendChild(this.buildSkillCard(id, def));
    }
  },

  buildSkillCard(id, def) {
    const lv = getSkillLv(id);
    const maxLv = def.maxLevel || 1;
    const progress = def.oneTime ? (lv > 0 ? 100 : 0) : (lv / maxLv) * 100;
    const isMax = isMaxLevel(id);
    const locked = def.requires && !isSkillUnlocked(def.requires);
    const cost = isMax ? 0 : getSkillCost(id);
    const cantAfford = !isMax && State.coin < cost;

    // 状态
    let statusText;
    if (def.oneTime) {
      statusText = lv > 0 ? '已激活' : '未解锁';
    } else {
      statusText = isMax ? `${maxLv} / ${maxLv}` : `${lv} / ${maxLv}`;
    }
    if (locked) statusText = '需先解锁';

    // 按钮
    let btnHtml;
    if (locked) {
      btnHtml = `<button class="up-btn" disabled><span class="c">🔒</span> 前置 <span class="lb">LOCK</span></button>`;
    } else if (isMax) {
      btnHtml = `<button class="up-btn" style="background:var(--gold);color:var(--ink);border-color:var(--gold);" disabled>
        <span class="c" style="color:var(--ink);">✓</span> ${def.oneTime ? '已激活' : '满级'} <span class="lb" style="color:var(--ink);">${def.oneTime ? 'AUTO' : 'MAX'}</span>
      </button>`;
    } else if (def.oneTime) {
      // ★ oneTime 技能：付费按钮 + 看广告按钮(并排)
      btnHtml = `<div class="up-btn-row">
        <button class="up-btn" data-skill="${id}">
          <span class="c">◉</span> ${formatCoin(cost)} <span class="lb">解锁</span>
        </button>
        <button class="up-btn ad-unlock-btn" data-ad-skill="${id}" title="看广告直接解锁(不扣金币)">
          <span class="free-content">
            <span class="free-icon">▶</span>
            <span class="free-text">FREE</span>
          </span>
        </button>
      </div>`;
    } else {
      btnHtml = `<button class="up-btn" data-skill="${id}">
        <span class="c">◉</span> ${formatCoin(cost)} <span class="lb">${def.oneTime ? '解锁' : 'UP'}</span>
      </button>`;
    }

    const card = document.createElement('div');
    card.className = 'skill-card'
      + (locked ? ' locked' : '')
      + (isMax ? ' maxed' : '')
      + (cantAfford ? ' cant-afford' : '')
      + (def.oneTime && !isMax && !locked ? ' has-row' : '');
    card.innerHTML = `
      <div class="skill-ic">${def.icon}</div>
      <div class="skill-info">
        <div class="name">${def.name}</div>
        <div class="desc">${def.desc}</div>
        <div class="lv-bar">
          <span class="lv-num">${statusText}</span>
          <div class="lv-track"><div class="lv-fill" style="width:${progress}%"></div></div>
        </div>
      </div>
      ${btnHtml}
    `;
    if (!locked && !isMax) {
      const btn = card.querySelector('.up-btn');
      if (btn) btn.addEventListener('click', () => this.handleUpgrade(id));
      // ★ oneTime 技能的"看广告直接解锁"按钮
      const adBtn = card.querySelector('.ad-unlock-btn');
      if (adBtn) {
        adBtn.addEventListener('click', () => this.handleAdUnlock(id));
      }
    }
    return card;
  },

  refreshSkillList() {
    // 只刷新"买不起"的状态，避免重建 DOM 丢失滚动
    for (const id in SKILL) {
      const def = SKILL[id];
      if (def.cat !== this.currentTab) continue;
      const card = document.querySelector(`.skill-card .up-btn[data-skill="${id}"]`)?.closest('.skill-card');
      if (!card) continue;
      const cost = getSkillCost(id);
      const isMax = isMaxLevel(id);
      const cantAfford = !isMax && State.coin < cost;
      card.classList.toggle('cant-afford', cantAfford);
      const btn = card.querySelector('.up-btn');
      if (btn && !isMax) {
        btn.disabled = cantAfford;
        const costEl = btn.querySelector('.c')?.nextSibling;
        if (costEl) costEl.textContent = ' ' + formatCoin(cost) + ' ';
      }
    }
  },

  handleUpgrade(id) {
    const result = upgradeSkill(id);
    if (!result.ok) return;
    // 升级音效
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('upgrade');
    const wasCompleted = (typeof isGameCompleted === 'function') && isGameCompleted();
    this.refreshCoin();
    this.renderSkillList();
    this.refreshStatsPreview();
    this.refreshClearBadge();  // 升级后检查是否通关
    // 自动拆包机器人解锁时刷新 robot chip + 档位切换 chip + 存储角标
    if (id === 'B_autoOpen') {
      this.refreshRobotChip();
      this.refreshAutoOpenToggle();
      this.renderStorageBadge();
    }
    // 自动补货解锁时刷新续包档位切换 chip
    if (id === 'B_restock') this.refreshRestockToggle();
    // 拆包加速升级时同步机器人动画速度
    if (id === 'B_openSpeed') this.refreshRobotChip();
    // 机器人分拣强化升级后要刷新档位 chip（可能允许切到更高档）
    if (id === 'B_autoTier') this._updateAutoOpenLabel();
    // ★ 达成通关 → 弹通关庆祝窗（仅在「刚达成」时弹一次，避免重渲重复弹）
    const nowCompleted = (typeof isGameCompleted === 'function') && isGameCompleted();
    if (!wasCompleted && nowCompleted) this.spawnClearModal();
  },

  /**
   * oneTime 技能的"看广告直接解锁"：跳过金币扣除，只走 Ad.watch
   */
  handleAdUnlock(id) {
    Ad.watch((r) => {
      if (!r || !r.ok) return;
      const result = (typeof unlockSkillFree === 'function') ? unlockSkillFree(id) : { ok: false, msg: '函数未加载' };
      if (!result.ok) {
        this.spawnPityTag('skill', `❌ ${result.msg || '解锁失败'}`);
        return;
      }
      // 升级音效（看广告解锁走同一条链）
      if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('upgrade');
      this.refreshCoin();
      this.renderSkillList();
      this.refreshStatsPreview();
      this.refreshClearBadge();
      // 复用 handleUpgrade 里的刷新链
      if (id === 'B_autoOpen') {
        this.refreshRobotChip();
        this.refreshAutoOpenToggle();
        this.renderStorageBadge();
      }
      if (id === 'B_restock') this.refreshRestockToggle();
      this.spawnPityTag('skill', `🎉 ${SKILL[id].name} 已解锁（看广告）`);
      // 弹窗告诉玩家获得了什么（与升级页用同一个 SVG 图标）
      const skillDef = SKILL[id];
      this.spawnAdRewardModal({
        svg: skillDef.icon,
        title: '看广告获得',
        sub: skillDef?.desc || '已永久解锁',
        lines: [
          { label: '已解锁', value: skillDef?.name || id, valueClass: 'pos' },
        ],
        autoClose: 2200,
      });
    }, { skipReward: true });
  },

  /**
   * 通关徽章:所有 SKILL 满级 + 5 档 LUCKY 满级
   * 主页 topbar 显示金色"🏆 通关"徽章,升级页显示 banner
   * 通关后游戏正常运行(继续拆盲盒、看广告、滚雪球都不影响)
   */
  refreshClearBadge() {
    const completed = (typeof isGameCompleted === 'function') && isGameCompleted();
    // 主页 topbar 下方居中 chip（"看视频"和"幸运值"中间上方）
    const chip = document.getElementById('clearChip');
    if (chip) chip.hidden = !completed;
    // 兼容旧 markup
    const badge = document.getElementById('clearBadge');
    if (badge) badge.hidden = !completed;
    const banner = document.getElementById('clearBanner');
    if (banner) banner.hidden = !completed;
    const bannerHome = document.getElementById('clearBannerHome');
    if (bannerHome) bannerHome.hidden = !completed;
  },

  /* ========== 事件绑定 ========== */
  bindEvents() {
    // 页面切换
    document.getElementById('btnOpenSkill')?.addEventListener('click', () => this.switchPage('skill'));
    document.getElementById('btnBackHome')?.addEventListener('click', () => this.switchPage('home'));

    // 广告
    document.getElementById('btnWatchAd')?.addEventListener('click', () => this.handleAd());

    // 当前属性面板
    document.getElementById('btnStats')?.addEventListener('click', () => this.openStats());
    document.getElementById('btnStatsClose')?.addEventListener('click', () => this.closeStats());
    document.getElementById('statsModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'statsModal') this.closeStats();
    });

    // 幸运值弹窗
    document.getElementById('btnLucky')?.addEventListener('click', () => this.openLucky());
    document.getElementById('btnLuckyClose')?.addEventListener('click', () => this.closeLucky());
    // 通关庆祝弹窗
    document.getElementById('btnClearModalClose')?.addEventListener('click', () => this.closeClearModal());
    document.getElementById('clearModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'clearModal') this.closeClearModal();
    });
    document.getElementById('btnLuckyUnlockAll')?.addEventListener('click', () => {
      // 已解锁则不响应
      if (isLuckyUnlocked()) return;
      // ★ 看广告纯解锁（不送金币）
      Ad.watch((r) => {
        if (!r || !r.ok) return;
        setLuckyUnlocked();
        this.spawnPityTag('lucky', `📊 收益数据已全部解锁`);
        // 重新渲染弹窗内容 + 同步按钮状态
        this.renderLuckyContent();
        this.refreshLuckyUnlockBtn();
      }, { skipReward: true });
    });
    document.getElementById('luckyModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'luckyModal') this.closeLucky();
    });

    // 续包档位 chip → 打开共用档位选择弹窗
    document.getElementById('restockToggle')?.addEventListener('click', () => this.openTierPicker('autoRestockTier'));
    // 自动拆包档位 chip → 打开同一个档位选择弹窗
    document.getElementById('autoOpenToggle')?.addEventListener('click', () => this.openTierPicker('autoOpenTier'));
    // 档位选择弹窗：关闭按钮 + 遮罩点击 + 暂停按钮
    document.getElementById('btnTierPickerClose')?.addEventListener('click', () => this.closeTierPicker());
    document.getElementById('btnTierPause')?.addEventListener('click', () => this._toggleTierPickerPause());
    document.getElementById('tierPickerModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'tierPickerModal') this.closeTierPicker();
    });

    // 挂机存储：角标点击即领取
    document.getElementById('storageBadge')?.addEventListener('click', () => {
      if (typeof collectIdleStorage !== 'function') return;
      // 存储已满：弹"双倍领取"弹窗（看广告 ×2 / 立即 ×1）
      if (State.idleStorage >= State.idleStorageMax && State.idleStorage > 0) {
        this.spawnStorageClaimModal(State.idleStorage);
        return;
      }
      // 存储未满：直接领取
      const r = collectIdleStorage(1);
      if (r && r.ok) {
        if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('coin');
        this.spawnPityTag('collect', `📥 领取 +${r.amount} ◉`);
      }
    });

    // 重新开始（测试用）
    document.getElementById('btnReset')?.addEventListener('click', () => this.handleReset());

    // 测试隐藏款（开发用）
    document.getElementById('btnTestHidden')?.addEventListener('click', () => this.testHiddenReveal());

    // 测试图鉴（开发用：随机点亮一个未收集的物品）
    document.getElementById('btnTestCodex')?.addEventListener('click', () => this.testCodexAddItem());

    // 图鉴
    document.getElementById('btnCodex')?.addEventListener('click', () => this.openCodex());
    document.getElementById('btnCodexClose')?.addEventListener('click', () => this.closeCodex());
    document.getElementById('codexModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'codexModal') this.closeCodex();
    });
    document.getElementById('btnCodexClaimAll')?.addEventListener('click', () => this.handleClaimAllCodex());

    // 成就
    document.getElementById('btnAchievement')?.addEventListener('click', () => this.openAchievement());
    document.getElementById('btnAchievementClose')?.addEventListener('click', () => this.closeAchievement());
    document.getElementById('achievementModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'achievementModal') this.closeAchievement();
    });

    // 技能卡抽卡
    document.getElementById('btnCard')?.addEventListener('click', () => this.openCard());
    document.getElementById('btnCardClose')?.addEventListener('click', () => this.closeCard());
    document.getElementById('cardModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cardModal') this.closeCard();
    });
    document.getElementById('btnDrawCoin')?.addEventListener('click', () => this.handleDrawCoin());
    document.getElementById('btnDrawAd')?.addEventListener('click', () => this.handleDrawAd());
    document.getElementById('cardFlipCard')?.addEventListener('click', () => this._resetCardFlip());
    document.getElementById('btnOpenCardCodex')?.addEventListener('click', () => this.openCardCodex());
    document.getElementById('btnCardCodexClose')?.addEventListener('click', () => this.closeCardCodex());
    document.getElementById('cardCodexModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cardCodexModal') this.closeCardCodex();
    });
    document.getElementById('btnCardAllClaim')?.addEventListener('click', () => this.handleClaimCardAll());

    // 划封带：touch
    const parcel = document.getElementById('parcel');
    if (parcel) {
      parcel.addEventListener('touchstart', (e) => {
        State._swipeStartX = e.touches[0].clientX;
        onSwipeStart(e);
      }, { passive: false });
      parcel.addEventListener('touchmove', (e) => onSwipeMove(e), { passive: false });
      parcel.addEventListener('touchend', (e) => onSwipeEnd(e), { passive: true });
      parcel.addEventListener('touchcancel', (e) => onSwipeEnd(e), { passive: true });
      // 鼠标（桌面调试）
      parcel.addEventListener('mousedown', (e) => {
        State._swipeStartX = e.clientX;
        onSwipeStart(e);
      });
      parcel.addEventListener('mousemove', (e) => {
        if (getParcelState() === 'opening') onSwipeMove(e);
      });
      parcel.addEventListener('mouseup', (e) => onSwipeEnd(e));
      parcel.addEventListener('mouseleave', (e) => onSwipeEnd(e));
    }
  },

  handleAd() {
    Ad.watch((r) => {
      if (!r || !r.ok) return;
      this.refreshCoin();
      this.refreshBuyRow();
      this.refreshSkillList();
      this.spawnAdRewardModal({
        svg: AD_SVG.tvCoin,
        title: '看完广告',
        sub: '感谢支持，金币已入账',
        lines: [
          { label: '本次奖励', value: `+${formatCoin(r.reward)} ◉`, valueClass: 'pos' },
        ],
        autoClose: 1800,
      });
    });
  },

  /* ========== 当前属性入口 + Modal ========== */
  refreshStatsPreview() {
    // 预览信息展示在弹窗标题旁（`statsPreviewInModal`），首页按钮只显示"概率"二字
    const el = document.getElementById('statsPreviewInModal');
    if (!el || typeof getCurrentStats !== 'function') return;
    const s = getCurrentStats();
    const fx = s.effects;
    const parts = [];
    if (fx.valueMult > 1.001) parts.push(`价值×${fx.valueMult.toFixed(2)}`);
    if (parts.length === 0) parts.push('未升级');
    el.innerHTML = parts.slice(0, 3).map(p => `<span class="mp-chip">${p}</span>`).join(' ');
  },

  /* ========== 幸运值入口预览（已简化为 chip，无需刷新）========== */
  refreshLuckyPreview() {
    // 简单 chip 入口，不在按钮上展示详细等级；
    // 详细等级展示在弹窗内（renderLuckyContent 读取 State.luckyLv）。
  },

  /* ========== 机器人 chip 状态（自动拆包器解锁）========== */
  refreshRobotChip() {
    const chip = document.getElementById('robotChip');
    if (!chip) return;
    const txt = chip.querySelector('.robot-text');
    if (State.autoOpenUnlocked) {
      chip.classList.add('unlocked');
      chip.classList.remove('locked');
      if (txt) txt.textContent = '已解锁';
    } else {
      chip.classList.remove('unlocked');
      chip.classList.add('locked');
      if (txt) txt.textContent = '未解锁';
    }
    // 暂停时：右下角小机器人定在第一帧，不再循环 3 帧动画
    chip.classList.toggle('paused', !!State.autoOpenPaused);
    // 系统原因状态：cantAfford（红）/ storageFull → chip 加 class；同时显示 tip 文字
    const reason = State.autoOpenBlockReason;
    chip.classList.toggle('cant-afford', reason === 'cantAfford');
    chip.classList.toggle('storage-full', reason === 'storageFull');
    // 同步显示头顶 tip 气泡（仅系统原因时显示文字，玩家手动 paused 不显示）
    const tip = document.getElementById('robotTip');
    if (tip) {
      tip.classList.remove('cant-afford', 'storage-full', 'manual');
      if (reason === 'cantAfford') {
        tip.textContent = '金币不足，已暂停';
        tip.classList.add('cant-afford');
        tip.hidden = false;
      } else if (reason === 'storageFull') {
        tip.textContent = '仓库已满，已暂停';
        tip.classList.add('storage-full');
        tip.hidden = false;
      } else {
        tip.hidden = true;
      }
    }
    // 机器人 3 帧动画的轮播速度 = 自动拆包间隔（保持节奏一致）
    // 间隔 5s（Lv.0）→ 3s（Lv.10 满加速），动画随之缩短
    if (State.autoOpenUnlocked && !State.autoOpenPaused) {
      const dur = (typeof getAutoInterval === 'function') ? getAutoInterval() : 5;
      const durStr = `${Math.max(0.5, dur)}s`;
      chip.querySelectorAll('.robot-frame').forEach(f => {
        f.style.animationDuration = durStr;
      });
    } else {
      // 暂停/未解锁时清空 inline style，让 paused/locked CSS 规则生效
      chip.querySelectorAll('.robot-frame').forEach(f => {
        f.style.animationDuration = '';
      });
    }
  },

  /* ========== 续包档位 chip：打开自动补货档位选择弹窗 ========== */
  refreshRestockToggle() {
    const chip = document.getElementById('restockToggle');
    if (!chip) return;
    if (!State.autoRestockUnlocked) {
      chip.hidden = true;
      return;
    }
    chip.hidden = false;
    this._updateRestockLabel();
  },

  /* ========== 自动拆包档位 chip：显示 + 循环切换 ========== */
  refreshAutoOpenToggle() {
    const chip = document.getElementById('autoOpenToggle');
    if (!chip) return;
    if (!State.autoOpenUnlocked) {
      chip.hidden = true;
      return;
    }
    chip.hidden = false;
    this._updateAutoOpenLabel();
  },

  _updateAutoOpenLabel() {
    const lbl = document.getElementById('autoOpenTierLabel');
    if (!lbl) return;
    // 受「机器人分拣强化」等级限制：超出范围自动降级到最高解锁档
    const tierOrder = ['ordinary', 'premium', 'luxury', 'epic', 'mythic'];
    const maxIdx = State.autoTierLv || 0;
    const curIdx = tierOrder.indexOf(State.autoOpenTier);
    if (curIdx > maxIdx) State.autoOpenTier = tierOrder[maxIdx];
    const tier = TIER[State.autoOpenTier];
    // 自动拆包 chip 不显示档位 icon，只显示中文名
    lbl.textContent = tier.cn;
    // 暂停状态视觉（与 restockToggle 完全一致：opacity 0.62 + ⏸ 前缀）
    const chip = document.getElementById('autoOpenToggle');
    if (chip) {
      chip.classList.toggle('paused', !!State.autoOpenPaused);
      chip.title = State.autoOpenPaused ? '已暂停 · 点击选择档位' : '点击选择档位';
    }
    // chip 右侧显示当前拆包速度（受「拆包加速」影响）
    const speedLbl = document.getElementById('autoOpenSpeedLabel');
    if (speedLbl) {
      const interval = (typeof getAutoInterval === 'function') ? getAutoInterval() : 5;
      speedLbl.textContent = ` · ${interval.toFixed(1)}秒`;
    }
  },

  /* ========== 档位选择弹窗（自动补货 / 自动拆包 完全复用）==========
   * stateKey: 'autoOpenTier' | 'autoRestockTier'
   * 同一个 modal，根据 stateKey 切换标题/提示/状态。
   */
  openTierPicker(stateKey) {
    // 防御：两个 chip 解锁条件不同
    if (stateKey === 'autoOpenTier' && !State.autoOpenUnlocked) return;
    if (stateKey === 'autoRestockTier' && !State.autoRestockUnlocked) return;
    const title = stateKey === 'autoOpenTier' ? '自动拆包档位' : '自动补货档位';
    // hint 显示当前实际拆包间隔（受「拆包加速」等级影响）
    const interval = (typeof getAutoInterval === 'function') ? getAutoInterval() : 5;
    const intervalStr = `${interval.toFixed(1)} 秒`;
    const hint = stateKey === 'autoOpenTier'
      ? `选一个档位，机器人每 ${intervalStr} 自动买 + 拆`
      : `选一个档位，开完一盒自动再买同档`;
    const titleEl = document.getElementById('tierPickerTitle');
    const hintEl = document.getElementById('tierPickerHint');
    if (titleEl) titleEl.textContent = title;
    if (hintEl) hintEl.textContent = hint;
    this._renderTierPicker(stateKey);
    this._syncTierPauseBtn(stateKey);
    document.getElementById('tierPickerModal')?.classList.add('show');
  },

  closeTierPicker() {
    document.getElementById('tierPickerModal')?.classList.remove('show');
  },

  /* ========== 弹窗底部暂停按钮 ========== */
  _syncTierPauseBtn(stateKey) {
    const btn = document.getElementById('btnTierPause');
    if (!btn) return;
    const paused = stateKey === 'autoOpenTier'
      ? !!State.autoOpenPaused
      : !!State.autoRestockPaused;
    btn.classList.toggle('paused', paused);
    btn.textContent = paused ? '▶ 继续' : '⏸ 暂停';
    btn.dataset.stateKey = stateKey;
  },

  _toggleTierPickerPause() {
    const btn = document.getElementById('btnTierPause');
    if (!btn) return;
    const stateKey = btn.dataset.stateKey;
    if (stateKey === 'autoOpenTier') {
      if (!State.autoOpenUnlocked) return;
      State.autoOpenPaused = !State.autoOpenPaused;
      State.autoOpenBlockReason = null;  // 玩家手动 toggle 时无条件清掉系统原因（玩家主动接管）
      this._updateAutoOpenLabel();
      this.refreshRobotChip();  // 同步右下角小机器人定帧
      this.spawnPityTag(
        State.autoOpenPaused ? 'restock-fail' : 'restock',
        State.autoOpenPaused ? '⏸ 自动拆包已暂停' : '▶ 自动拆包已恢复'
      );
    } else if (stateKey === 'autoRestockTier') {
      if (!State.autoRestockUnlocked) return;
      State.autoRestockPaused = !State.autoRestockPaused;
      this._updateRestockLabel();
      this.spawnPityTag(
        State.autoRestockPaused ? 'restock-fail' : 'restock',
        State.autoRestockPaused ? '⏸ 自动补货已暂停' : '▶ 自动补货已恢复'
      );
    }
    this._syncTierPauseBtn(stateKey);
    save();
  },

  _renderTierPicker(stateKey) {
    const body = document.getElementById('tierPickerBody');
    if (!body) return;
    // 所有档位（普通/精品/豪华/至尊/传说）
    const order = Object.keys(TIER);
    const stats = (typeof getCurrentStats === 'function') ? getCurrentStats() : null;
    // 自动拆包：根据「机器人分拣强化」等级决定哪些档位可拆
    //   Lv.0 只允许普通；Lv.1 允许到精品；Lv.2 到豪华；Lv.3 到至尊；Lv.4 全部
    const tierOrder = ['ordinary', 'premium', 'luxury', 'epic', 'mythic'];
    const autoMaxIdx = State.autoTierLv || 0;
    body.innerHTML = '<div class="restock-cards">' + order.map(tierId => {
      const tier = TIER[tierId];
      const t = stats?.tiers?.[tierId];
      const ev = t ? t.expectedProfit : 0;
      const evClass = ev >= 0 ? 'pos' : 'neg';
      const evSign = ev >= 0 ? '+' : '';
      const isSelected = State[stateKey] === tierId;
      const check = isSelected ? '<span class="rc-check">✓ 当前</span>' : '';
      // 自动拆包：超出强化等级 → 锁定
      let locked = false;
      let lockTag = '';
      if (stateKey === 'autoOpenTier') {
        const idx = tierOrder.indexOf(tierId);
        if (idx > autoMaxIdx) {
          locked = true;
          // 显示解锁该档位需要的强化等级
          const needLv = idx;
          lockTag = `<span class="rc-lock">🔒 需 Lv.${needLv}</span>`;
        }
      }
      return `<button class="restock-card ${tier.className || ''} ${isSelected ? 'selected' : ''} ${locked ? 'locked' : ''}" data-tier="${tierId}">
        <div class="rc-head">
          <div class="rc-head-l">
            <span class="rc-ic">${tier.icon}</span>
            <div>
              <div class="rc-name">${tier.cn}</div>
              <div class="rc-price">${tier.label} · ${formatCoin(tier.price)} ◉</div>
            </div>
          </div>
          ${check}
        </div>
        <div class="rc-ev">
          <span>期望盈亏</span>
          <span class="${evClass}">${evSign}${ev.toFixed(1)} ◉</span>
        </div>
        ${lockTag ? `<div class="rc-lock-row">${lockTag}</div>` : ''}
      </button>`;
    }).join('') + '</div>';

    // 绑定选择
    body.querySelectorAll('.restock-card[data-tier]').forEach(btn => {
      btn.addEventListener('click', () => this._selectTierFromPicker(stateKey, btn.dataset.tier));
    });
  },

  _selectTierFromPicker(stateKey, tierId) {
    // 自动拆包：超出强化等级的档位不能选
    if (stateKey === 'autoOpenTier') {
      const tierOrder = ['ordinary', 'premium', 'luxury', 'epic', 'mythic'];
      const autoMaxIdx = State.autoTierLv || 0;
      const idx = tierOrder.indexOf(tierId);
      if (idx > autoMaxIdx) {
        this.spawnPityTag('restock-fail', `需先升级「机器人分拣强化」到 Lv.${idx}`);
        return;
      }
    }
    if (State[stateKey] === tierId) {
      this.closeTierPicker();
      return;
    }
    State[stateKey] = tierId;
    save();
    // 同步对应 chip label
    if (stateKey === 'autoOpenTier') {
      this._updateAutoOpenLabel();
    } else {
      this._updateRestockLabel();
      this.refreshBuyRow();  // 同步 buy-row 上"自动补货中"标签位置
      // 修复切档不生效 bug: 立即替换预备队(否则 nextPending 永远占着旧档位)
      if (State.autoRestockUnlocked && !State.autoRestockPaused && State.nextPending && State.nextPending.tierId !== tierId) {
        // 退旧档位的钱
        const oldTier = TIER[State.nextPending.tierId];
        State.coin += oldTier.price;
        State.nextPending = null;
        // 用新档位重建预备队
        if (typeof tryAutoRestock === 'function') {
          const r = tryAutoRestock();
          if (r && r.ok && r.where === 'next') {
            this.refreshCoin();
            this.spawnPityTag('restock', `已切换为 ${TIER[tierId].cn} · 退还 ${oldTier.cn} ${formatCoin(oldTier.price)} ◉`);
          } else if (r && r.reason === 'no-coin') {
            this.spawnPityTag('restock-fail', `金币不足，下次自动补货时再买 ${TIER[tierId].cn}`);
            this.refreshCoin();
          } else {
            this.spawnPityTag('restock', `已切换为 ${TIER[tierId].cn} · 退还 ${oldTier.cn} ${formatCoin(oldTier.price)} ◉`);
            this.refreshCoin();
          }
        }
      } else {
        // 没预备队 或 切到同档位 → 简单提示
        this.spawnPityTag('restock', `已切换为 ${TIER[tierId].cn}`);
      }
    }
    // 视觉反馈：标签短暂变红
    const lblId = stateKey === 'autoOpenTier' ? 'autoOpenTierLabel' : 'restockTierLabel';
    const lbl = document.getElementById(lblId);
    if (lbl) {
      lbl.classList.add('changed');
      setTimeout(() => lbl.classList.remove('changed'), 400);
    }
    // 弹窗内"已切换"提示 + 关闭
    this._renderTierPicker(stateKey);
    setTimeout(() => this.closeTierPicker(), 220);
  },

  _updateRestockLabel() {
    const lbl = document.getElementById('restockTierLabel');
    if (!lbl) return;
    const tier = TIER[State.autoRestockTier];
    // 不再显示档位 icon（与自动拆包 chip 风格一致）
    if (tier) lbl.textContent = tier.cn;
    // 暂停状态视觉
    const chip = document.getElementById('restockToggle');
    if (chip) {
      chip.classList.toggle('paused', !!State.autoRestockPaused);
      chip.title = State.autoRestockPaused ? '已暂停 · 点击选择档位' : '点击选择档位';
    }
  },

  openStats() {
    if (typeof getCurrentStats !== 'function') return;
    const stats = getCurrentStats();
    this.renderStatsContent(stats);
    document.getElementById('statsModal')?.classList.add('show');
  },

  closeStats() {
    document.getElementById('statsModal')?.classList.remove('show');
  },

  /* ========== 幸运值弹窗 ========== */
  openLucky() {
    this.renderLuckyContent();
    this.refreshLuckyUnlockBtn();
    document.getElementById('luckyModal')?.classList.add('show');
  },

  closeLucky() {
    document.getElementById('luckyModal')?.classList.remove('show');
  },

  /**
   * 同步头部"解锁收益分析"按钮状态
   * 未解锁 → 橙色高亮, ▶ icon 持续 pulse
   * 已解锁 → 整个按钮隐藏（留空白）
   */
  refreshLuckyUnlockBtn() {
    const btn = document.getElementById('btnLuckyUnlockAll');
    if (!btn) return;
    if (isLuckyUnlocked()) {
      btn.style.display = 'none';
    } else {
      btn.style.display = '';
      btn.disabled = false;
      btn.title = '看广告解锁所有档位的赚钱概率和平均赚';
    }
  },

  /* ========== 破产处理：金币 ≤ 0 → 弹窗让玩家看广告续命或重置 ========== */
  handleBankrupt() {
    // 如果已经显示破产弹窗，不要重复弹
    if (document.getElementById('bankruptModal')?.classList.contains('show')) return;
    const modal = document.createElement('div');
    modal.id = 'bankruptModal';
    modal.className = 'modal bankrupt-modal show';
    modal.innerHTML = `
      <div class="modal-card bankrupt-card">
        <div class="bankrupt-title">💸 破产了！</div>
        <div class="bankrupt-desc">金币已经见底<br/>看广告领 ${Ad.getReward()} 金币继续 / 或全部清零重开</div>
        <div class="bankrupt-actions">
          <button class="bnk-btn bnk-ad" id="bnkAd">📺 看广告 +${Ad.getReward()} ◉</button>
          <button class="bnk-btn bnk-reset" id="bnkReset">⟳ 全部清零重开</button>
          <button class="bnk-btn bnk-close" id="bnkClose">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    document.getElementById('bnkAd')?.addEventListener('click', () => {
      // 走激励视频：用户完整观看后才发奖并关闭弹窗
      Ad.watch((r) => {
        if (!r || !r.ok) return;
        this.spawnAdRewardModal({
          svg: AD_SVG.rescue,
          title: '破产救援成功',
          sub: '继续拆盲盒吧！',
          lines: [
            { label: '本次奖励', value: `+${formatCoin(r.reward)} ◉`, valueClass: 'pos' },
          ],
          onClose: close,
          autoClose: 1800,
        });
      });
    });
    document.getElementById('bnkReset')?.addEventListener('click', () => {
      if (confirm('确定清零所有进度重新开始？')) {
        localStorage.removeItem('parcel_save_v1');
        location.reload();
      }
    });
    document.getElementById('bnkClose')?.addEventListener('click', close);
  },

  renderLuckyContent() {
    const body = document.getElementById('luckyModalBody');
    if (!body) return;
    const stats = getCurrentStats();
    // 所有档位（普通/精品/豪华/至尊/传说）— 跟 tierPicker 弹窗保持一致
    const order = Object.keys(TIER);
    const isUnlocked = isLuckyUnlocked();
    body.innerHTML = '<div class="lucky-cards">' + order.map(tierId => {
      const tier = TIER[tierId];
      const t = stats.tiers[tierId];
      const lv = t.luckyLv || 0;
      const maxLv = t.luckyMaxLv || LUCKY.MAX_LEVEL;
      const isMax = lv >= maxLv;
      const cost = isMax ? 0 : getLuckyCost(tierId);
      const cantAfford = !isMax && State.coin < cost;
      const winPct = t.winPct || 0;  // 赚钱概率

      // 等级进度条
      const progressPct = (lv / maxLv) * 100;
      // 升级按钮
      let btnHtml;
      if (isMax) {
        btnHtml = `<button class="lc-up-btn maxed" disabled>
          <span class="luc-label">已满级</span>
          <span class="luc-cost">MAX</span>
        </button>`;
      } else {
        const cls = cantAfford ? 'lc-up-btn cant-afford' : 'lc-up-btn';
        btnHtml = `<button class="${cls}" data-tier="${tierId}" ${cantAfford ? 'disabled' : ''}>
          <span class="luc-label">升级</span>
          <span class="luc-cost"><span class="c">◉</span> ${formatCoin(cost)}</span>
        </button>`;
      }
      // 期望盈亏（与 ROI 一起显示）
      const evClass = t.expectedProfit >= 0 ? 'pos' : 'neg';
      const evSign = t.expectedProfit >= 0 ? '+' : '';
      const roiPct = (t.expectedROI * 100 - 100).toFixed(0);
      const roiSign = roiPct >= 0 ? '+' : '';
      // 按解锁状态决定显示(全局一次性解锁)
      const winPctDisplay = isUnlocked
        ? `${winPct.toFixed(1)}%`
        : `<span class="lc-locked" title="看广告解锁">?</span>`;
      const evValDisplay = isUnlocked
        ? `<span class="${evClass}">${evSign}${formatCoin(t.expectedProfit)}</span>`
        : `<span class="lc-locked" title="看广告解锁">?</span>`;
      const roiValDisplay = isUnlocked
        ? `<span class="${evClass}">${roiSign}${roiPct}%</span>`
        : `<span class="lc-locked" title="看广告解锁">?</span>`;
      // 跟 tierPicker 弹窗同款卡片结构（restock-card 视觉），但底部加等级 + 升级
      return `<div class="lucky-card restock-card ${tier.className || ''} ${isMax ? 'maxed' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="rc-head">
          <div class="rc-head-l">
            <span class="rc-ic">${tier.icon}</span>
            <div>
              <div class="rc-name">${tier.cn}</div>
              <div class="rc-price">${tier.label} · ${formatCoin(tier.price)} ◉</div>
            </div>
          </div>
          <span class="rc-check">Lv.${lv}/${maxLv}</span>
        </div>
        <div class="lc-lvrow">
          <div class="lc-lv-track"><div class="lc-lv-fill" style="width:${progressPct}%"></div></div>
        </div>
        <div class="lc-info">
          <div class="lc-info-block">
            <span class="lc-info-label">赚钱概率</span>
            <span class="lc-info-val">${winPctDisplay}</span>
          </div>
          <div class="lc-info-block" style="text-align:center;">
            <span class="lc-info-label">期望</span>
            <span class="lc-info-val">${evValDisplay}</span>
          </div>
          <div class="lc-info-block" style="text-align:center;">
            <span class="lc-info-label">ROI</span>
            <span class="lc-info-val">${roiValDisplay}</span>
          </div>
          <div style="display:flex;align-items:center;">
            ${btnHtml}
          </div>
        </div>
      </div>`;
    }).join('') + '</div>';

    // 绑定升级按钮
    body.querySelectorAll('.lc-up-btn[data-tier]').forEach(btn => {
      btn.addEventListener('click', () => this.handleLuckyUpgrade(btn.dataset.tier));
    });
  },

  handleLuckyUpgrade(tierId) {
    const result = upgradeLucky(tierId);
    if (!result.ok) {
      // 简短提示
      this.spawnPityTag('restock-fail', result.msg);
      return;
    }
    // 升级音效
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('upgrade');
    const wasCompleted = (typeof isGameCompleted === 'function') && isGameCompleted();
    // 升级成功：重渲染弹窗 + 首页预览 + 金币
    this.refreshCoin();
    this.refreshLuckyPreview();
    this.renderLuckyContent();
    this.refreshClearBadge();  // 幸运值升满也可能通关
    // 顺手刷新属性弹窗的内容（如果在打开状态）
    if (document.getElementById('statsModal')?.classList.contains('show')) {
      this.renderStatsContent(getCurrentStats());
    }
    // 升级成功飘字
    const tier = TIER[tierId];
    if (tier) this.spawnPityTag('lucky', `🍀 ${tier.cn} 幸运 Lv.${getLuckyLv(tierId)}`);
    // ★ 达成通关 → 弹通关庆祝窗（仅在「刚达成」时弹一次）
    const nowCompleted = (typeof isGameCompleted === 'function') && isGameCompleted();
    if (!wasCompleted && nowCompleted) this.spawnClearModal();
  },

  /* ========== 通关庆祝弹窗（每次通关只弹一次）========== */
  spawnClearModal() {
    const modal = document.getElementById('clearModal');
    if (!modal) return;
    modal.classList.add('show');
  },
  closeClearModal() {
    document.getElementById('clearModal')?.classList.remove('show');
  },

  /**
   * 广告完成通用弹窗：看完广告后告诉用户得到了什么
   * @param {Object} opts
   * @param {string} opts.svg     - 大图标 SVG 字符串（必填，自己画）
   * @param {string} opts.title   - 大标题，如 "看完广告"
   * @param {string} opts.sub     - 副标题/说明
   * @param {Array}  [opts.lines] - 详细行 [{label, value, valueClass}]
   * @param {Function} [opts.onClose] - 关闭后回调
   * @param {number}  [opts.autoClose=1800] - 自动关闭毫秒（0=不自动关）
   */
  spawnAdRewardModal(opts) {
    if (!opts) return;
    // 升级音效（与升级页一致）
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('upgrade');
    // 同一时刻只显示一个广告奖励弹窗
    document.getElementById('adRewardModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'adRewardModal';
    modal.className = 'modal ad-reward-modal show';
    const linesHtml = (opts.lines || []).map(l => `
        <div class="arm-row">
          <span class="arm-label">${l.label}</span>
          <span class="arm-val ${l.valueClass || ''}">${l.value}</span>
        </div>`).join('');
    modal.innerHTML = `
      <div class="modal-card ad-reward-card">
        <button class="arm-close" id="armClose" aria-label="关闭">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="arm-icon">${opts.svg || ''}</div>
        <div class="arm-title">${opts.title || '看完广告'}</div>
        ${opts.sub ? `<div class="arm-sub">${opts.sub}</div>` : ''}
        ${linesHtml ? `<div class="arm-lines">${linesHtml}</div>` : ''}
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
      if (typeof opts.onClose === 'function') opts.onClose();
    };
    modal.querySelector('#armClose')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    const autoMs = opts.autoClose == null ? 1800 : opts.autoClose;
    if (autoMs > 0) setTimeout(close, autoMs);
  },

  /* ========== 成就系统 ========== */
  /* 时间戳（秒）转 YYYY-MM-DD HH:MM（成就解锁时间显示） */
  _achFormatTs(ts) {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    const pad = n => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  /* 打开成就页 */
  openAchievement() {
    this.renderAchievementContent();
    document.getElementById('achievementModal')?.classList.add('show');
  },
  closeAchievement() {
    document.getElementById('achievementModal')?.classList.remove('show');
  },

  /* 渲染成就页主体（5 个分类：basic / rare / codex / robot / final）
   * 视觉：克制的卡片
   *   已解锁 = 实色墨边卡 + 圆形红色 ✓ 戳 + 解锁时间
   *   未解锁 = 浅色虚线边 + 灰 icon + 条件文字
   * icon 字段既支持 emoji（'📦'）也支持 SVG 字符串（ICON.robot），
   * 通过 .startsWith('<svg') 区分；统一用 innerHTML 注入（数据来自 config 内部定义）。
   */
  renderAchievementContent() {
    const body = document.getElementById('achievementModalBody');
    if (!body) return;
    if (typeof ACHIEVEMENTS === 'undefined' || !Array.isArray(ACHIEVEMENTS)) {
      body.innerHTML = '<div class="ach-empty">成就数据未加载</div>';
      return;
    }
    const catCn = (typeof ACHIEVEMENT_CATEGORY_CN !== 'undefined') ? ACHIEVEMENT_CATEGORY_CN : {};
    const order = ['basic', 'rare', 'codex', 'robot', 'final'];
    // 按 category 分组
    const groups = {};
    for (const id of order) groups[id] = [];
    for (const ach of ACHIEVEMENTS) {
      if (!groups[ach.category]) groups[ach.category] = [];
      groups[ach.category].push(ach);
    }
    // 统计
    let unlockedCount = 0;
    for (const ach of ACHIEVEMENTS) {
      if (isAchievementUnlocked(ach.id)) unlockedCount++;
    }
    // 头部进度：xx / 18
    const headMeta = document.getElementById('achHeadMeta');
    if (headMeta) headMeta.textContent = `${unlockedCount} / ${ACHIEVEMENTS.length}`;
    const headFill = document.getElementById('achHeadFill');
    if (headFill) {
      const pct = ACHIEVEMENTS.length > 0 ? Math.round((unlockedCount / ACHIEVEMENTS.length) * 100) : 0;
      headFill.style.width = pct + '%';
    }

    // icon HTML：emoji 字符 or 完整 <svg> 字符串统一注入
    const iconHtml = (icon) => (typeof icon === 'string' && icon.startsWith('<svg'))
      ? icon
      : `<span class="ach-ic-emoji">${icon || '🏆'}</span>`;

    // 进度条辅助：仅未解锁的 robotRunStreak / robotRunAcc 成就卡显示
    const progressHtml = (ach) => {
      if (isAchievementUnlocked(ach.id)) return '';
      if (ach.kind !== 'robotRunStreak' && ach.kind !== 'robotRunAcc') return '';
      const cur  = ach.kind === 'robotRunStreak' ? (State.robotRunStreakSec || 0) : (State.robotRunAccSec || 0);
      const pct  = Math.min(100, Math.round((cur / ach.threshold) * 100));
      const curMin  = (cur / 60).toFixed(cur >= 60 ? 1 : 1);
      const tgtMin  = (ach.threshold / 60).toFixed(0);
      return `<div class="ach-card-progress">
        <div class="ach-card-progress-label">${curMin} / ${tgtMin} 分钟</div>
        <div class="ach-card-progress-track">
          <div class="ach-card-progress-fill" style="width: ${pct}%"></div>
        </div>
      </div>`;
    };

    let html = '';
    for (const catId of order) {
      const list = groups[catId];
      if (!list || list.length === 0) continue;
      const catUnlocked = list.filter(a => isAchievementUnlocked(a.id)).length;
      const itemsHtml = list.map(ach => {
        const unlocked = isAchievementUnlocked(ach.id);
        const data = (State.achievements && State.achievements[ach.id]) || null;
        const tsStr = (unlocked && data && data.ts) ? this._achFormatTs(data.ts) : '';
        const cls = unlocked ? 'ach-item unlocked' : 'ach-item locked';
        // 右上角徽标：解锁 = ✓邮戳 / 未解锁 = 锁
        const corner = unlocked
          ? `<div class="ach-corner ach-corner-stamp" title="已收集">✓</div>`
          : `<div class="ach-corner ach-corner-lock" title="未解锁">·</div>`;
        return `
        <div class="${cls}">
          ${corner}
          <div class="ach-ic-box">${iconHtml(ach.icon)}</div>
          <div class="ach-info">
            <div class="ach-name">${ach.name}</div>
            <div class="ach-desc" title="${ach.desc}">${ach.desc}</div>
            <div class="ach-meta">${unlocked
              ? `<span class="ach-meta-collected">已收入</span><span class="ach-meta-dot">·</span><span class="ach-meta-ts">${tsStr}</span>`
              : `<span class="ach-meta-hint">尚待解锁</span>`}</div>
            ${progressHtml(ach)}
          </div>
        </div>`;
      }).join('');
      html += `<div class="ach-section">
        <div class="ach-sec-head">
          <span class="ach-sec-name">${catCn[catId] || catId}</span>
          <span class="ach-sec-meta">${catUnlocked} / ${list.length}</span>
        </div>
        <div class="ach-grid">${itemsHtml}</div>
      </div>`;
    }
    body.innerHTML = html;
  },

  /* 成就解锁弹窗（集邮册仪式感：撒金 + 烫金奖章 + ribbon）
   * 复用 .ad-reward-modal 的 mask 容器与 armPop 动画；
   * 内层 .ach-unlock-card 独立设计。
   */
  spawnAchievementModal(ach) {
    if (!ach) return;
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('upgrade');
    document.getElementById('achievementUnlockModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'achievementUnlockModal';
    modal.className = 'modal ad-reward-modal show';
    // 解锁时间（与成就页一致）
    const data = (State.achievements && State.achievements[ach.id]) || null;
    const tsStr = (data && data.ts) ? this._achFormatTs(data.ts) : '';
    modal.innerHTML = `
      <div class="modal-card ad-reward-card ach-unlock-card">
        <button class="arm-close" id="aumClose" aria-label="关闭">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <!-- 4 角撒金小星点（CSS 动画旋转 + 缩放） -->
        <div class="ach-sparkles" aria-hidden="true">
          <span class="ach-spk ach-spk-1">✦</span>
          <span class="ach-spk ach-spk-2">✦</span>
          <span class="ach-spk ach-spk-3">✦</span>
          <span class="ach-spk ach-spk-4">✦</span>
          <span class="ach-spk ach-spk-5">✦</span>
          <span class="ach-spk ach-spk-6">✦</span>
        </div>
        <!-- 烫金奖章：双圈金边 + 内白 + 中心 emoji -->
        <div class="ach-medal" aria-hidden="true">
          <div class="ach-medal-ring ach-medal-ring-outer"></div>
          <div class="ach-medal-ring ach-medal-ring-inner"></div>
          <div class="ach-medal-emoji">${ach.icon || '🏆'}</div>
        </div>
        <div class="ach-unlock-eyebrow">★ ACHIEVEMENT UNLOCKED ★</div>
        <div class="ach-unlock-name">${ach.name}</div>
        <div class="ach-unlock-divider"><span></span><span></span></div>
        <div class="ach-unlock-desc">${ach.desc}</div>
        <div class="ach-unlock-ribbon">
          <span class="ach-ribbon-side"></span>
          <span class="ach-ribbon-text">已收入集邮册</span>
          <span class="ach-ribbon-side"></span>
        </div>
        ${tsStr ? `<div class="ach-unlock-ts">${tsStr}</div>` : ''}
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    };
    modal.querySelector('#aumClose')?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    // 解锁弹窗停留稍长（3.6s）让玩家看清新名 + 撒金动画
    setTimeout(close, 3600);
  },

  /* ========== 图鉴系统 ========== */
  openCodex() {
    this.renderCodexContent();
    document.getElementById('codexModal')?.classList.add('show');
  },
  closeCodex() {
    document.getElementById('codexModal')?.classList.remove('show');
  },
  renderCodexContent() {
    const body = document.getElementById('codexModalBody');
    if (!body) return;
    // 各档位物品数量
    let allComplete = true;
    let completeCount = 0;
    for (const tierId in TIER) {
      if (getCodexProgress(tierId).complete) completeCount++;
      else allComplete = false;
    }
    let html = '';
    for (const tierId in TIER) {
      const t = TIER[tierId];
      const prog = getCodexProgress(tierId);
      const isComplete = prog.complete;
      const reward = CODEX.TIER_REWARD[tierId] || 0;
      const claimed = !!State.collectionRewards[tierId];

      // 物品格
      const itemsHtml = t.items.map(it => {
        const collected = !!(State.collection[tierId] && State.collection[tierId][it.name]);
        const isHidden = !!it.hidden;
        // 隐藏款未收集：显示 ? 占位；收集后：显示真实 icon
        const inner = (isHidden && !collected)
          ? `<span class="ci-q">?</span>`
          : `<span class="ci-em">${it.emoji}</span>`;
        const cls = `codex-item ${collected ? 'collected' : ''} ${isHidden ? 'hidden-item' : ''}`;
        return `<div class="${cls}">
          ${inner}
          <span class="ci-name">${it.name}</span>
        </div>`;
      }).join('');

      // 档位标题
      const sectionCls = `codex-section ${t.className || ''}`;
      const progressPct = Math.round(prog.ratio * 100);
      const fillCls = isComplete ? 'codex-progress-fill full' : 'codex-progress-fill';

      // 领取按钮
      let claimBtnHtml;
      if (claimed) {
        claimBtnHtml = `<button class="codex-claim-btn claimed" disabled>✓ 已领取</button>`;
      } else if (isComplete) {
        claimBtnHtml = `<button class="codex-claim-btn" data-claim-tier="${tierId}">🎁 领取 <span class="cct-amt">+${formatCoin(reward)} ◉</span></button>`;
      } else {
        claimBtnHtml = `<button class="codex-claim-btn" disabled>🔒 集齐 ${prog.total} 个解锁</button>`;
      }

      html += `<div class="${sectionCls}">
        <div class="codex-sec-head">
          <div class="codex-sec-l">
            <span class="codex-sec-ic">${t.icon}</span>
            <span class="codex-sec-name">${t.cn}</span>
            <span class="codex-sec-meta">${prog.collected}/${prog.total}</span>
          </div>
          <div class="codex-progress">
            <div class="${fillCls}" style="width:${progressPct}%;"></div>
          </div>
        </div>
        <div class="codex-grid">${itemsHtml}</div>
        <div class="codex-claim">
          <span class="codex-claim-text">
            <span>单档集齐奖励</span>
            <span class="cct-amt">+${formatCoin(reward)} ◉</span>
          </span>
          ${claimBtnHtml}
        </div>
      </div>`;
    }
    body.innerHTML = html;

    // 绑定单档领取按钮
    body.querySelectorAll('.codex-claim-btn[data-claim-tier]').forEach(btn => {
      btn.addEventListener('click', () => this.handleClaimCodexTier(btn.dataset.claimTier));
    });

    // 底部全图鉴奖励
    const allBtn = document.getElementById('btnCodexClaimAll');
    const allMeta = document.getElementById('codexAllMeta');
    const allAmt = document.getElementById('codexAllAmt');
    const allRow = document.getElementById('codexAllRow');
    if (allMeta) allMeta.textContent = `${completeCount} / 5 档`;
    if (allAmt) allAmt.textContent = `+${formatCoin(CODEX.ALL_REWARD)} ◉`;
    if (allBtn) {
      if (State.allCollectionReward) {
        allBtn.disabled = true;
        allBtn.classList.add('claimed');
        allBtn.innerHTML = '✓ 已领取';
        if (allRow) allRow.classList.add('done');
      } else if (allComplete) {
        allBtn.disabled = false;
        allBtn.innerHTML = `🎁 领取 <span id="codexAllAmt">+${formatCoin(CODEX.ALL_REWARD)} ◉</span>`;
        if (allRow) allRow.classList.remove('done');
      } else {
        allBtn.disabled = true;
        allBtn.innerHTML = `🔒 集齐 5 档解锁`;
        if (allRow) allRow.classList.remove('done');
      }
    }
  },
  handleClaimCodexTier(tierId) {
    const r = claimCodexTierReward(tierId);
    if (!r.ok) {
      this.spawnPityTag('lucky', `⚠️ ${r.msg}`);
      return;
    }
    this.spawnPityTag('collect', `🎁 ${TIER[tierId].cn} 集齐奖励 +${formatCoin(r.amount)} ◉`);
    this.refreshCoin();
    this.renderCodexContent();
    this.refreshCodexBadge();  // 领取后刷新主页红点
    // 顺手刷新属性弹窗（如果在打开状态）
    if (document.getElementById('statsModal')?.classList.contains('show')) {
      this.renderStatsContent(getCurrentStats());
    }
  },
  handleClaimAllCodex() {
    const r = claimAllCodexReward();
    if (!r.ok) {
      this.spawnPityTag('lucky', `⚠️ ${r.msg}`);
      return;
    }
    this.spawnPityTag('collect', `🏆 全图鉴奖励 +${formatCoin(r.amount)} ◉`);
    this.refreshCoin();
    this.renderCodexContent();
    this.refreshCodexBadge();  // 领取后刷新主页红点
  },
  /** 刷新主页图鉴按钮右上角红点（可领取奖励时显示） */
  refreshCodexBadge() {
    const dot = document.getElementById('codexHomeDot');
    if (!dot) return;
    // 1) 任意单档已集齐但未领取 → 显示
    // 2) 全部 5 档已收齐但全图鉴奖励未领取 → 显示
    let hasUnclaimed = false;
    for (const tierId in TIER) {
      if (State.collectionRewards[tierId]) continue;            // 已领取
      if (getCodexProgress(tierId).complete) { hasUnclaimed = true; break; }
    }
    if (!hasUnclaimed && !State.allCollectionReward && isAllCodexComplete()) {
      hasUnclaimed = true;
    }
    dot.hidden = !hasUnclaimed;
  },

  /* ========== 重新开始（玩家可见）：弹窗二次确认 → 清存档并刷新 ========== */
  handleReset() {
    this.spawnResetConfirmModal();
  },

  /* ========== 重置确认弹窗（游戏内弹窗，UI 风格统一）========== */
  spawnResetConfirmModal() {
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('tap');
    document.getElementById('resetConfirmModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'resetConfirmModal';
    modal.className = 'modal reset-confirm-modal show';
    modal.innerHTML = `
      <div class="modal-card reset-confirm-card">
        <button class="arm-close" id="rcmClose" aria-label="关闭">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="arm-icon">${AD_SVG.rescue || ''}</div>
        <div class="arm-title">重置游戏</div>
        <div class="arm-sub">确定放弃当前进度？所有金币、等级、幸运值、图鉴、成就都会清空，无法恢复。</div>
        <div class="rcm-rows">
          <button class="rcm-btn rcm-btn--cancel" id="rcmCancel">取消</button>
          <button class="rcm-btn rcm-btn--ok" id="rcmOk">确认重置</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    };
    const doReset = () => {
      try {
        localStorage.removeItem(CONFIG.SAVE_KEY);
        localStorage.removeItem(LUCKY_UNLOCK_KEY);
      } catch (e) {
        console.warn('清除存档失败', e);
      }
      location.reload();
    };
    modal.querySelector('#rcmClose')?.addEventListener('click', close);
    modal.querySelector('#rcmCancel')?.addEventListener('click', close);
    modal.querySelector('#rcmOk')?.addEventListener('click', doReset);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  },

  renderStatsContent(stats) {
    const body = document.getElementById('statsModalBody');
    if (!body) return;
    const fx = stats.effects;
    // ★ 期望/ROI 显示闸门：仅当用户在幸运值处看广告解锁后才显示
    const showEv = isLuckyUnlocked();

    // 通关状态：仅当所有可购买升级全满级时显示
    const completed = (typeof isGameCompleted === 'function') && isGameCompleted();
    const completedHtml = completed
      ? `<div class="clear-banner clear-banner-inline">
          <div class="cb-ic">🏆</div>
          <div class="cb-text">
            <div class="cb-title">全部升级已满级 · 已通关</div>
            <div class="cb-sub">可以继续拆盲盒赚钱、滚雪球</div>
          </div>
        </div>`
      : '';

    // === 第 1 段：开箱概率（按档位）===
    let tiersHtml = '';
    for (const tierId in stats.tiers) {
      const t = stats.tiers[tierId];
      const rows = t.items.map(it => {
        const cls = it.isBad ? 'bad' : (it.isHidden ? 'hidden' : (it.isRare ? 'rare' : ''));
        // 隐藏款：统一显示为"神秘礼物"+ ❓，不暴露实际物品
        const displayEmoji = it.isHidden ? '❓' : it.emoji;
        const displayName = it.isHidden ? '神秘礼物' : it.name;
        // 现有价值 = 原价值 × 价值倍率
        const curValue = Math.round(it.value * fx.valueMult);
        return `<div class="item-row ${cls}">
          <span class="ir-em">${displayEmoji}</span>
          <span class="ir-name">${displayName}</span>
          <span class="ir-val">${formatCoin(it.value)} ◉</span>
          <span class="ir-valcur">${formatCoin(curValue)} ◉</span>
          <span class="ir-basepct">${it.basePct.toFixed(1)}%</span>
          <span class="ir-pct">${it.pct.toFixed(1)}%</span>
        </div>`;
      }).join('');
      const evClass = t.expectedProfit >= 0 ? '' : 'neg';
      const evSign = t.expectedProfit >= 0 ? '+' : '';
      const roiPct = (t.expectedROI * 100 - 100).toFixed(0);
      const roiSign = roiPct >= 0 ? '+' : '';
      // ★ 期望/ROI 仅在解锁收益分析后才显示（未解锁 = 空白）
      const thEvHtml = showEv
        ? `<span class="th-ev ${evClass}">期望 ${evSign}${formatCoin(t.expectedProfit)} · ROI ${roiSign}${roiPct}%</span>`
        : '';
      const colHead = `<div class="tier-colhead">
        <span></span>
        <span class="tch-name">物品</span>
        <span>原价值</span>
        <span>现有价值</span>
        <span>原掉率</span>
        <span>当前掉率</span>
      </div>`;
      tiersHtml += `<div class="tier-block">
        <div class="tier-head">
          <span class="th-name"><span class="th-ic">${t.icon}</span>${t.name} · ${formatCoin(t.price)} ◉</span>
          ${thEvHtml}
        </div>
        ${colHead}
        ${rows}
      </div>`;
    }

    // === 第 2 段：开箱倍率（仅价值加成）===
    const valCls = fx.valueMult > 1.001 ? '' : 'base';
    const valText = fx.valueMult > 1.001 ? `×${fx.valueMult.toFixed(2)}` : '×1.00';

    const section2 = `<div class="stats-section">
      <div class="sec-title"><span class="sec-ic">💰</span>开箱倍率</div>
      <div class="attr-row"><span class="ar-name">物品价值（A·价值加成）</span><span class="ar-val ${valCls}">${valText}</span></div>
    </div>`;

    // === 第 3 段：幸运值（每档）===
    let luckyHtml = '';
    for (const tierId in stats.tiers) {
      const t = stats.tiers[tierId];
      const lv = t.luckyLv || 0;
      const maxLv = t.luckyMaxLv || 10;
      luckyHtml += `<div class="attr-row">
        <span class="ar-name">${t.icon} ${t.name}</span>
        <span class="ar-val">Lv.${lv} / ${maxLv} · 稀有 ${t.rarePct.toFixed(1)}%</span>
      </div>`;
    }
    const sectionLucky = `<div class="stats-section">
      <div class="sec-title"><span class="sec-ic">🍀</span>幸运值（首页主升级）</div>
      ${luckyHtml}
    </div>`;

    // === 第 4 段：自动化 ===
    const autoOpenText = stats.autoOpenUnlocked ? `已解锁 · ${stats.autoInterval.toFixed(1)} 秒/次` : '未解锁';
    const autoOpenCls = stats.autoOpenUnlocked ? '' : 'base';
    // 机器人分拣强化：显示当前等级 + 最高可拆档位
    const autoTierMax = (typeof SKILL !== 'undefined' && SKILL.B_autoTier) ? SKILL.B_autoTier.maxLevel : 4;
    const autoTierLv = stats.autoTierLv || 0;
    const autoTierTierName = stats.autoOpenMaxTier ? TIER[stats.autoOpenMaxTier].cn : '普通';
    const autoTierText = `Lv.${autoTierLv} / ${autoTierMax}（最高可拆 ${autoTierTierName}）`;
    const autoTierCls = autoTierLv > 0 ? '' : 'base';
    const autoRestockText = stats.autoRestockUnlocked
      ? `已解锁（${TIER[stats.autoRestockTier].cn}）`
      : '未解锁';
    const autoRestockCls = stats.autoRestockUnlocked ? '' : 'base';

    const section3 = `<div class="stats-section">
      <div class="sec-title"><span class="sec-ic">🤖</span>自动化</div>
      <div class="attr-row"><span class="ar-name">自动拆包机器人</span><span class="ar-val ${autoOpenCls}">${autoOpenText}</span></div>
      <div class="attr-row"><span class="ar-name">自动补货</span><span class="ar-val ${autoRestockCls}">${autoRestockText}</span></div>
      <div class="attr-row"><span class="ar-name">机器人分拣强化</span><span class="ar-val ${autoTierCls}">${autoTierText}</span></div>
    </div>`;

    body.innerHTML = `
      ${completedHtml}
      <div class="stats-section">
        <div class="sec-title"><span class="sec-ic">📦</span>开箱概率（每档物品实际掉率）</div>
        ${tiersHtml}
        <div class="hint-text">四列依次：原价值 / 升级价值加成后的现有价值 / 原掉率 / 升级幸运后的当前掉率</div>
      </div>
      ${sectionLucky}
      ${section2}
      ${section3}
    `;
  },

  switchPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + name)?.classList.add('active');
    // 每次进入技能页，刷新状态
    if (name === 'skill') this.renderSkillList();
  },

  /* ========== 贴面单小游戏（嵌入 parcel 区域） ========== */
  _sortState: null,

  openSortingGame() {
    const inline = document.getElementById('sortInline');
    const empty = document.getElementById('parcelEmpty');
    const parcel = document.getElementById('parcel');
    if (!inline) return;
    // 隐藏其他，显示贴面单
    if (empty) empty.style.display = 'none';
    if (parcel) parcel.style.display = 'none';
    inline.classList.add('active');
    inline.style.display = 'block';
    this._sortState = { dragging: false, sessionScore: 0, stuck: false };
    this._resetSortTape();
    this._bindSortEvents();
  },

  closeSortingGame() {
    const inline = document.getElementById('sortInline');
    const empty = document.getElementById('parcelEmpty');
    if (!inline) return;
    inline.classList.remove('active');
    inline.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    this._unbindSortEvents();
    this._sortState = null;
    this.refreshCoin();
  },

  _resetSortTape() {
    const inline = document.getElementById('sortInline');
    const tape = document.getElementById('sortTape');
    const box = document.getElementById('sortBox');
    if (!inline || !tape || !box) return;

    const inlineRect = inline.getBoundingClientRect();
    const tapeW = 50, tapeH = 88;

    // 随机位置：在区域内，避开盒子中心
    const boxCX = inlineRect.width / 2;
    const boxCY = inlineRect.height / 2;

    let lx, ly;
    let attempts = 0;
    do {
      lx = Math.random() * (inlineRect.width - tapeW);
      ly = Math.random() * (inlineRect.height - tapeH - 40) + 10;
      attempts++;
    } while (
      attempts < 20 &&
      Math.abs(lx + tapeW/2 - boxCX) < 90 &&
      Math.abs(ly + tapeH/2 - boxCY) < 70
    );

    // 瞬间复位（不走过渡），下一帧再恢复过渡以便拖动/贴附动画生效
    tape.style.transition = 'none';
    tape.style.left = lx + 'px';
    tape.style.top = ly + 'px';
    tape.classList.remove('dragging', 'stuck');
    void tape.offsetWidth; // 强制 reflow
    tape.style.transition = '';

    // 重置盒子胶带效果 + 涟漪
    const boxBody = box.querySelector('.sort-box-body');
    if (boxBody) boxBody.classList.remove('taped', 'taped-perfect', 'ripple');

    // 隐藏反馈（只移除 .show，让文字随透明度一起淡出，避免空矩形闪烁）
    const fb = document.getElementById('sortFeedback');
    if (fb) { fb.classList.remove('show', 'perfect', 'good', 'miss'); }

    this._sortState.stuck = false;
  },

  _bindSortEvents() {
    const tape = document.getElementById('sortTape');
    const inline = document.getElementById('sortInline');
    if (!tape || !inline) return;

    const onStart = (e) => {
      if (this._sortState && this._sortState.stuck) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const rect = tape.getBoundingClientRect();
      const inlineRect = inline.getBoundingClientRect();
      this._sortState.dragging = true;
      this._sortState.offsetX = touch.clientX - rect.left;
      this._sortState.offsetY = touch.clientY - rect.top;
      this._sortState.inlineLeft = inlineRect.left;
      this._sortState.inlineTop = inlineRect.top;
      tape.classList.add('dragging');
      tape.classList.remove('stuck');
    };

    const onMove = (e) => {
      if (!this._sortState || !this._sortState.dragging) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const inlineRect = inline.getBoundingClientRect();
      const tapeW = 50, tapeH = 88;

      let nx = touch.clientX - this._sortState.inlineLeft - this._sortState.offsetX;
      let ny = touch.clientY - this._sortState.inlineTop - this._sortState.offsetY;

      nx = Math.max(0, Math.min(inlineRect.width - tapeW, nx));
      ny = Math.max(0, Math.min(inlineRect.height - tapeH, ny));

      tape.style.left = nx + 'px';
      tape.style.top = ny + 'px';
    };

    const onEnd = (e) => {
      if (!this._sortState || !this._sortState.dragging) return;
      this._sortState.dragging = false;
      tape.classList.remove('dragging');

      const inlineRect = inline.getBoundingClientRect();
      const box = document.getElementById('sortBox');
      const boxRect = box.getBoundingClientRect();

      const tapeCX = parseFloat(tape.style.left) + 25;
      const tapeCY = parseFloat(tape.style.top) + 44;
      const boxCX = boxRect.left - inlineRect.left + boxRect.width / 2;
      const boxCY = boxRect.top - inlineRect.top + boxRect.height / 2;

      const dist = Math.sqrt((tapeCX - boxCX) ** 2 + (tapeCY - boxCY) ** 2);
      const maxDist = Math.sqrt(boxRect.width ** 2 + boxRect.height ** 2) / 2;
      const errorRate = dist / maxDist;

      let reward = 0;
      let cls = '';
      let text = '';

      if (errorRate < 0.2) {
        reward = 2; cls = 'perfect'; text = '完美 +2 ◉';
      } else if (errorRate < 0.45) {
        reward = 1; cls = 'good'; text = '合格 +1 ◉';
      } else {
        reward = -1; cls = 'miss'; text = '贴歪了 -1 ◉';
      }

      // 恢复 CSS 过渡，让运单缓缓压平贴上（opacity 由 .stuck 控制）
      tape.style.transition = '';
      tape.style.opacity = '';
      tape.classList.add('stuck');

      // 盒子显示胶带效果 + 按压涟漪
      const boxBody = box.querySelector('.sort-box-body');
      if (boxBody) {
        boxBody.classList.remove('ripple');
        void boxBody.offsetWidth; // 重新触发动画
        if (errorRate < 0.2) boxBody.classList.add('taped-perfect');
        else if (errorRate < 0.45) boxBody.classList.add('taped');
        if (reward > 0) boxBody.classList.add('ripple');
      }

      // 文字反馈
      const fb = document.getElementById('sortFeedback');
      if (fb) {
        fb.textContent = text;
        fb.className = 'sort-feedback show ' + cls;
      }

      // 入账/扣款
      if (reward !== 0) {
        State.coin += reward;
        this._sortState.sessionScore += reward;
        save();
        // 破产检测：金币 ≤ 0 → 弹提示（看广告续命 / 重置存档）
        if (State.coin <= 0) this.handleBankrupt();
      }
      this.refreshCoin();
      this.refreshBuyRow();  // 钱够了要立刻移除"金币不足"遮罩

      this._sortState.stuck = true;

      // 1 秒后刷新下一张
      setTimeout(() => {
        if (this._sortState && !this._sortState.dragging) this._resetSortTape();
      }, 1000);
    };

    tape.addEventListener('touchstart', onStart, { passive: false });
    inline.addEventListener('touchmove', onMove, { passive: false });
    inline.addEventListener('touchend', onEnd);

    tape.addEventListener('mousedown', onStart);
    inline.addEventListener('mousemove', onMove);
    inline.addEventListener('mouseup', onEnd);
    inline.addEventListener('mouseleave', onEnd);

    this._sortEvents = { onStart, onMove, onEnd, tape, inline };
  },

  _unbindSortEvents() {
    if (!this._sortEvents) return;
    const { onStart, onMove, onEnd, tape, inline } = this._sortEvents;
    tape.removeEventListener('touchstart', onStart);
    inline.removeEventListener('touchmove', onMove);
    inline.removeEventListener('touchend', onEnd);
    tape.removeEventListener('mousedown', onStart);
    inline.removeEventListener('mousemove', onMove);
    inline.removeEventListener('mouseup', onEnd);
    inline.removeEventListener('mouseleave', onEnd);
    this._sortEvents = null;
  },

  /* ============================================================
   * 技能卡抽卡系统（UI 渲染 + 翻牌动画 + buff 倒计时）
   * 入口：主页 #btnCard
   * 子 modal：#cardCodexModal（卡牌图鉴）
   * ============================================================ */
  openCard() {
    // ★ 锁定态：未解锁 且 金币 < 800 不能进 modal，提示"积攒 X 解锁"
    if (!State.cardUnlocked && State.coin < CARD.PRICE) {
      const need = CARD.PRICE - State.coin;
      this.spawnPityTag('restock-fail', `还需积攒 ${need} ◉ 才能解锁技能卡抽卡`);
      return;
    }
    clearExpiredBuffs();
    this._resetCardFlip();
    this.renderBuffList();
    this._refreshCardDrawButtons();
    document.getElementById('cardModal')?.classList.add('show');
    this._startBuffTicker();
  },
  closeCard() {
    document.getElementById('cardModal')?.classList.remove('show');
    this._stopBuffTicker();
  },
  _resetCardFlip() {
    const card = document.getElementById('cardFlipCard');
    const front = document.getElementById('cardFront');
    if (card) {
      card.dataset.state = 'back';
      card.classList.remove('flipping', 'flipped');
    }
    if (front) front.innerHTML = '';
  },

  /* 渲染 buff 列表（最多 3 槽 + luckyStreak 计数器） */
  renderBuffList() {
    const list = document.getElementById('buffList');
    const slotInfo = document.getElementById('buffSlotInfo');
    if (!list) return;
    clearExpiredBuffs();
    const now = Date.now();
    const items = [];
    // 时效性 buff
    (State.activeBuffs || []).forEach(b => {
      if (b.type === 'luckyStreak') return;  // 单列
      if (b.expiresAt <= now) return;
      const card = CARD.POOL.find(c => c.id === b.cardId);
      if (!card) return;
      const remainMs = b.expiresAt - now;
      const remainSec = Math.ceil(remainMs / 1000);
      const mm = Math.floor(remainSec / 60);
      const ss = remainSec % 60;
      items.push(`
        <div class="buff-item card-r-${card.rarity}">
          <span class="buff-ic">${card.icon}</span>
          <span class="buff-name">${card.cn}</span>
          <span class="buff-time">${mm}:${ss.toString().padStart(2, '0')}</span>
        </div>
      `);
    });
    // luckyStreak 计数器（不入槽位）
    const luckyBuffs = (State.activeBuffs || []).filter(b => b.type === 'luckyStreak' && b.remaining > 0);
    luckyBuffs.forEach(b => {
      const card = CARD.POOL.find(c => c.id === b.cardId);
      if (!card) return;
      items.push(`
        <div class="buff-item buff-item-counter card-r-${card.rarity}">
          <span class="buff-ic">${card.icon}</span>
          <span class="buff-name">${card.cn}</span>
          <span class="buff-time">×${b.remaining}</span>
        </div>
      `);
    });
    list.innerHTML = items.length
      ? items.join('')
      : '<div class="buff-empty">无生效 buff</div>';
    const used = (State.activeBuffs || []).filter(b => b.type !== 'luckyStreak' && b.expiresAt > now).length;
    if (slotInfo) slotInfo.textContent = `${used}/${CARD.MAX_ACTIVE_BUFFS} 槽`;
  },

  /* 倒计时刷新（每秒 1 次） */
  _startBuffTicker() {
    this._stopBuffTicker();
    this._buffTicker = setInterval(() => {
      if (!document.getElementById('cardModal')?.classList.contains('show')) {
        this._stopBuffTicker();
        return;
      }
      this.renderBuffList();
      this._refreshCardDrawButtons();
    }, 1000);
  },
  _stopBuffTicker() {
    if (this._buffTicker) { clearInterval(this._buffTicker); this._buffTicker = null; }
  },

  /* 刷新 2 个抽卡按钮的冷却/费用状态 */
  _refreshCardDrawButtons() {
    const coinBtn = document.getElementById('btnDrawCoin');
    const adBtn = document.getElementById('btnDrawAd');
    const priceLabel = document.getElementById('cardPriceLabel');
    if (priceLabel) priceLabel.textContent = `${CARD.PRICE.toLocaleString('en-US')} ◉`;
    // 付费冷却
    const coinCd = Math.ceil(getCardCooldownRemaining('coin') / 1000);
    if (coinBtn) {
      const cd = formatCoin(coinCd);
      if (coinCd > 0) {
        coinBtn.disabled = true;
        coinBtn.classList.add('cd');
        coinBtn.querySelector('.cdb-t1').textContent = '冷却中';
        coinBtn.querySelector('.cdb-t2').textContent = `${cd}秒`;
      } else if (State.coin < CARD.PRICE) {
        coinBtn.disabled = true;
        coinBtn.classList.remove('cd');
        coinBtn.querySelector('.cdb-t1').textContent = '金币不足';
        coinBtn.querySelector('.cdb-t2').textContent = `${CARD.PRICE.toLocaleString('en-US')} ◉`;
      } else {
        coinBtn.disabled = false;
        coinBtn.classList.remove('cd');
        coinBtn.querySelector('.cdb-t1').textContent = '付费抽卡';
        coinBtn.querySelector('.cdb-t2').textContent = `${CARD.PRICE.toLocaleString('en-US')} ◉`;
      }
    }
    // 广告冷却
    const adCd = Math.ceil(getCardCooldownRemaining('ad') / 1000);
    if (adBtn) {
      if (adCd > 0) {
        adBtn.disabled = true;
        adBtn.classList.add('cd');
        adBtn.querySelector('.cdb-t1').textContent = '冷却中';
        adBtn.querySelector('.cdb-t2').textContent = `${adCd}秒`;
      } else {
        adBtn.disabled = false;
        adBtn.classList.remove('cd');
        adBtn.querySelector('.cdb-t1').textContent = '看广告抽卡';
        adBtn.querySelector('.cdb-t2').textContent = '▶ 免费';
      }
    }
  },

  /* 实际抽卡 → 翻牌动画 */
  _doDraw(mode) {
    const r = drawCard(mode);
    if (!r.ok) {
      this.spawnPityTag('lucky', `⚠️ ${r.error}`);
      this._refreshCardDrawButtons();
      return;
    }
    this.refreshCoin();
    this.renderCardFront(r.card);
    // 翻牌：先快速翻过去，再停 0.4s 显示牌面，再缓慢翻回
    const card = document.getElementById('cardFlipCard');
    if (card) {
      card.classList.add('flipping');
      // 翻牌音效
      if (typeof SFX_ONE !== 'undefined' && SFX_ONE.play) SFX_ONE.play('cardFlip');
      setTimeout(() => {
        card.classList.add('flipped');
        card.dataset.state = 'front';
      }, 60);
    }
    // 同步 UI
    this.renderBuffList();
    this._refreshCardDrawButtons();
    this.refreshCardBadge();
  },

  /* 渲染卡面（稀有度样式） */
  renderCardFront(card) {
    const front = document.getElementById('cardFront');
    if (!front) return;
    const rarity = CARD_RARITY[card.rarity] || { cn: '?', cssClass: 'card-r-common' };
    // 牌面稀有度背景色（CSS class 控制）
    front.innerHTML = `
      <div class="card-front-inner card-r-${card.rarity}">
        <div class="cf-rarity">${rarity.cn}</div>
        <div class="cf-icon">${card.icon}</div>
        <div class="cf-name">${card.cn}</div>
        <div class="cf-desc">${card.desc}</div>
      </div>
    `;
  },

  handleDrawCoin() { this._doDraw('coin'); },
  handleDrawAd() {
    // 调用广告（沿用现有 ad.js 接口）
    if (typeof Ad !== 'undefined' && Ad.watch) {
      Ad.watch(() => this._doDraw('ad'));
    } else {
      this._doDraw('ad');
    }
  },

  /* 主页卡片按钮红点：当前有 buff 时显示数字 */
  refreshCardBadge() {
    const dot = document.getElementById('cardHomeDot');
    if (!dot) return;
    clearExpiredBuffs();
    const active = (State.activeBuffs || []).filter(b => {
      if (b.type === 'luckyStreak') return b.remaining > 0;
      return b.expiresAt > Date.now();
    }).length;
    if (active > 0) {
      dot.hidden = false;
      dot.textContent = active;
      dot.style.fontSize = '8px';
      dot.style.fontWeight = '800';
      dot.style.color = '#fff';
      dot.style.lineHeight = '1';
      dot.style.display = 'flex';
      dot.style.alignItems = 'center';
      dot.style.justifyContent = 'center';
    } else {
      dot.hidden = true;
    }
    // ★ 抽卡按钮锁定/解锁状态：未解锁 且 金币 < 800 时灰色 + 半透明
    const btn = document.getElementById('btnCard');
    if (btn) {
      const wasLocked = btn.classList.contains('locked');
      const locked = !State.cardUnlocked && State.coin < CARD.PRICE;
      btn.classList.toggle('locked', locked);
      btn.classList.toggle('unlocked', !locked);
      btn.title = locked
        ? `积攒 ${CARD.PRICE - State.coin} ◉ 解锁技能卡抽卡`
        : '技能卡抽卡';
      // 跨越解锁瞬间的提示（仅在主页激活时）+ 持久化解锁状态
      if (wasLocked && !locked && document.getElementById('page-home')?.classList.contains('active')) {
        State.cardUnlocked = true;
        save();
        this.spawnPityTag('restock', `🎉 技能卡抽卡已解锁！点击抽卡`);
      }
    }
  },

  /* ========== 卡牌图鉴子 modal ========== */
  openCardCodex() {
    this.renderCardCodexContent();
    document.getElementById('cardCodexModal')?.classList.add('show');
  },
  closeCardCodex() {
    document.getElementById('cardCodexModal')?.classList.remove('show');
  },
  renderCardCodexContent() {
    const body = document.getElementById('cardCodexBody');
    if (!body) return;
    const prog = getCardCodexProgress();
    // 按稀有度分组
    const byRarity = { common: [], rare: [], epic: [], legend: [] };
    CARD.POOL.forEach(c => byRarity[c.rarity].push(c));
    let html = '';
    for (const rarity of ['common', 'rare', 'epic', 'legend']) {
      const rar = CARD_RARITY[rarity];
      const cards = byRarity[rarity];
      const itemsHtml = cards.map(c => {
        const collected = !!(State.cardCollection && State.cardCollection[c.id]);
        return `<div class="card-codex-item card-r-${rarity} ${collected ? 'collected' : 'locked'}">
          <div class="cci-ic">${collected ? c.icon : '?'}</div>
          <div class="cci-name">${collected ? c.cn : '???'}</div>
          <div class="cci-desc">${collected ? c.desc : '尚未抽到'}</div>
        </div>`;
      }).join('');
      html += `<div class="card-codex-section card-r-${rarity}">
        <div class="card-codex-head">
          <span class="cch-rarity">${rar.cn}</span>
          <span class="cch-pct">${rar.pct}%</span>
        </div>
        <div class="card-codex-grid">${itemsHtml}</div>
      </div>`;
    }
    body.innerHTML = html;
    // 底部全收集奖励
    const allBtn = document.getElementById('btnCardAllClaim');
    const allMeta = document.getElementById('cardAllMeta');
    const allAmt = document.getElementById('cardAllAmt');
    if (allMeta) allMeta.textContent = `${prog.collected} / ${prog.total}`;
    const allTotal = document.getElementById('cardAllTotal');
    if (allTotal) allTotal.textContent = prog.total;
    if (allAmt) allAmt.textContent = `+${(CARD.ALL_REWARD / 1000).toFixed(0)}k ◉`;
    if (allBtn) {
      if (State.cardAllCollectedReward) {
        allBtn.disabled = true;
        allBtn.classList.add('claimed');
        allBtn.innerHTML = '✓ 已领取';
      } else if (prog.complete) {
        allBtn.disabled = false;
        allBtn.innerHTML = `🎁 领取 <span id="cardAllAmt">+${(CARD.ALL_REWARD / 1000).toFixed(0)}k ◉</span>`;
      } else {
        allBtn.disabled = true;
        allBtn.innerHTML = `🔒 集齐 ${prog.total} 张解锁`;
      }
    }
  },
  handleClaimCardAll() {
    const r = claimCardAllReward();
    if (!r.ok) {
      this.spawnPityTag('lucky', `⚠️ ${r.msg}`);
      return;
    }
    this.spawnPityTag('collect', `🏆 卡牌全收集奖励 +${formatCoin(r.amount)} ◉`);
    this.refreshCoin();
    this.renderCardCodexContent();
  },
};
