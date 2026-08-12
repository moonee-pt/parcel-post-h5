/* ============================================================
 * ui.js — UI 渲染 + 事件绑定
 * ============================================================ */

const UI = {
  // 当前技能 tab
  currentTab: 'A',

  /* ========== 初始化 ========== */
  init() {
    this.renderBuyRow();
    this.renderSkillTabs();
    this.renderSkillList();
    this.bindEvents();
    this.refreshCoin();
    this.refreshStatsPreview();
    this.refreshLuckyPreview();
    this.refreshRobotChip();
    this.refreshRestockToggle();
    this.refreshAutoOpenToggle();
    this.renderStorageBadge();  // 初始化挂机存储角标（存储 > 0 才显示）
    this.setupDragScroll(document.getElementById('buyRow'));
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
        <div class="price"><span class="c">◉</span>${t.price}</div>
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
    if (State.pending) {
      // 还有没拆的，提示一下
      this.spawnPityTag('restock-fail', '还有盲盒没拆');
      return;
    }
    const result = buyParcel(tierId);
    if (!result.ok) {
      // 买不起：明确提示差额
      if (result.msg === '金币不足') {
        const tier = TIER[tierId];
        const need = Math.ceil(tier.price - State.coin);
        this.spawnPityTag('restock-fail', `金币不足，还差 ${need} 金`);
      } else {
        this.spawnPityTag('restock-fail', result.msg);
      }
      return;
    }
    // 渲染盲盒
    this.showParcel(tierId);
    this.refreshCoin();
    this.refreshBuyRow();
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
      setTimeout(() => this.spawnHiddenReveal(item), 250);
      return; // 隐藏款跳过常规 fx
    }

    // 触发 fx
    this.spawnFx(item, tierId);
    // 自动售卖站开启 → 直接入账
    if (State.autoSellUnlocked) {
      setTimeout(() => {
        State.coin += item.finalValue;
        save();
        this.refreshCoin();
        this.refreshBuyRow();
        this.refreshSkillList(); // 钱变了，升级按钮状态要更新
        // 自动补货触发由 main.js 在 parcel cleared 后统一处理
      }, 600);
    } else {
      // 手动售卖：显示"出售"按钮（这里 MVP 先自动入账，TODO: 改成手动）
      State.coin += item.finalValue;
      save();
      this.refreshCoin();
    }
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
    numEl.textContent = `${item.emoji} ${sign}${net} ◉`;
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

  /* ========== 隐藏款豪华揭示动画（屏幕中央） ========== */
  spawnHiddenReveal(item) {
    // 入账（隐藏款必入账，玩家开出来就获得金币）
    State.coin += item.finalValue;
    save();
    this.refreshCoin();
    this.refreshBuyRow();
    this.refreshSkillList();

    // 创建全屏遮罩 + 中央揭示
    const overlay = document.createElement('div');
    overlay.className = 'hidden-reveal';
    overlay.innerHTML = `
      <div class="hr-particles">
        ${Array.from({length: 24}).map((_,i) => `<i style="--i:${i}"></i>`).join('')}
      </div>
      <div class="hr-card">
        <div class="hr-tag">👑 隐藏款！</div>
        <div class="hr-icon">${item.emoji}</div>
        <div class="hr-name">${item.name}</div>
        <div class="hr-value">+${formatCoin(item.finalValue)} 金</div>
        <div class="hr-tap">点击关闭</div>
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
      restock:        { text: '🔄 自动补货',       color: 'var(--green)',  dur: 900 },
      'restock-fail': { text: customText || '❌ 补货失败', color: 'var(--red)', dur: 1400 },
      lucky:          { text: customText || '🍀 幸运值提升', color: 'var(--green)', dur: 1200 },
      hidden:         { text: '👑 隐藏款！暴富！', color: '#b8860b',      dur: 2200 },
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
  },

  /* ========== 金币扣除飘字（自动补货扣下一个时用）========== */
  showCoinDeduct(amount) {
    const el = document.getElementById('coinDeduct');
    if (!el) return;
    el.textContent = `-${amount} ◉`;
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
    } else {
      btnHtml = `<button class="up-btn" data-skill="${id}">
        <span class="c">◉</span> ${formatCoin(cost)} <span class="lb">${def.oneTime ? '解锁' : 'UP'}</span>
      </button>`;
    }

    const card = document.createElement('div');
    card.className = 'skill-card'
      + (locked ? ' locked' : '')
      + (isMax ? ' maxed' : '')
      + (cantAfford ? ' cant-afford' : '');
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
    this.refreshCoin();
    this.renderSkillList();
    this.refreshStatsPreview();
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
      if (typeof collectIdleStorage === 'function') {
        const r = collectIdleStorage();
        if (r && r.ok) {
          this.spawnPityTag('collect', `📥 领取 +${r.amount} ◉`);
        }
      }
    });

    // 重新开始（测试用）
    document.getElementById('btnReset')?.addEventListener('click', () => this.handleReset());

    // 测试隐藏款（开发用）
    document.getElementById('btnTestHidden')?.addEventListener('click', () => this.testHiddenReveal());

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
    const r = Ad.watch();
    if (!r.ok) return;
    this.refreshCoin();
    this.refreshBuyRow();
    this.refreshSkillList();
    // 金币 bump
    this.refreshCoin();
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
    // 系统原因状态：cantAfford（红）/ storageFull（黄）→ chip 加 class + 头顶小字
    const reason = State.autoOpenBlockReason;
    chip.classList.toggle('cant-afford', reason === 'cantAfford');
    chip.classList.toggle('storage-full', reason === 'storageFull');
    const tip = document.getElementById('robotTip');
    if (tip) {
      if (reason === 'cantAfford') {
        tip.textContent = '金币不足';
        tip.hidden = false;
        tip.className = 'robot-tip cant-afford';
      } else if (reason === 'storageFull') {
        tip.textContent = '存储已满';
        tip.hidden = false;
        tip.className = 'robot-tip storage-full';
      } else if (State.autoOpenPaused) {
        tip.textContent = '已暂停';
        tip.hidden = false;
        tip.className = 'robot-tip manual';
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
              <div class="rc-price">${tier.label} · ${tier.price} ◉</div>
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
    document.getElementById('luckyModal')?.classList.add('show');
  },

  closeLucky() {
    document.getElementById('luckyModal')?.classList.remove('show');
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
        <div class="bankrupt-desc">金币已经见底<br/>看广告领 30 金币继续 / 或全部清零重开</div>
        <div class="bankrupt-actions">
          <button class="bnk-btn bnk-ad" id="bnkAd">📺 看广告 +30 ◉</button>
          <button class="bnk-btn bnk-reset" id="bnkReset">⟳ 全部清零重开</button>
          <button class="bnk-btn bnk-close" id="bnkClose">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    document.getElementById('bnkAd')?.addEventListener('click', () => {
      State.coin = 30;
      save();
      this.refreshCoin();
      this.refreshBuyRow();
      this.spawnPityTag('lucky', '📺 广告奖励 +30 ◉');
      close();
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
      // 期望盈亏
      const evClass = t.expectedProfit >= 0 ? 'pos' : 'neg';
      const evSign = t.expectedProfit >= 0 ? '+' : '';
      // 跟 tierPicker 弹窗同款卡片结构（restock-card 视觉），但底部加等级 + 升级
      return `<div class="lucky-card restock-card ${tier.className || ''} ${isMax ? 'maxed' : ''}">
        <div class="rc-head">
          <div class="rc-head-l">
            <span class="rc-ic">${tier.icon}</span>
            <div>
              <div class="rc-name">${tier.cn}</div>
              <div class="rc-price">${tier.label} · ${tier.price} ◉</div>
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
            <span class="lc-info-val">${winPct.toFixed(1)}%</span>
          </div>
          <div class="lc-info-block" style="text-align:center;">
            <span class="lc-info-label">期望盈亏</span>
            <span class="lc-info-val ${evClass}">${evSign}${t.expectedProfit.toFixed(1)}</span>
          </div>
          <div class="lc-info-block" style="text-align:right;">
            <span class="lc-info-label">ROI</span>
            <span class="lc-info-val ${evClass}">${evSign}${(t.expectedROI * 100 - 100).toFixed(0)}%</span>
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
    // 升级成功：重渲染弹窗 + 首页预览 + 金币
    this.refreshCoin();
    this.refreshLuckyPreview();
    this.renderLuckyContent();
    // 顺手刷新属性弹窗的内容（如果在打开状态）
    if (document.getElementById('statsModal')?.classList.contains('show')) {
      this.renderStatsContent(getCurrentStats());
    }
    // 升级成功飘字
    const tier = TIER[tierId];
    if (tier) this.spawnPityTag('lucky', `🍀 ${tier.cn} 幸运 Lv.${getLuckyLv(tierId)}`);
  },

  /* ========== 重新开始（测试用：清存档并刷新）========== */
  handleReset() {
    if (!confirm('确定清除存档重新开始？所有金币、等级、幸运值都会清空。')) return;
    try {
      localStorage.removeItem(CONFIG.SAVE_KEY);
    } catch (e) {
      console.warn('清除存档失败', e);
    }
    location.reload();
  },

  renderStatsContent(stats) {
    const body = document.getElementById('statsModalBody');
    if (!body) return;
    const fx = stats.effects;

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
          <span class="ir-val">${it.value} ◉</span>
          <span class="ir-valcur">${curValue} ◉</span>
          <span class="ir-basepct">${it.basePct.toFixed(1)}%</span>
          <span class="ir-pct">${it.pct.toFixed(1)}%</span>
        </div>`;
      }).join('');
      const evClass = t.expectedProfit >= 0 ? '' : 'neg';
      const evSign = t.expectedProfit >= 0 ? '+' : '';
      const roiPct = (t.expectedROI * 100 - 100).toFixed(0);
      const roiSign = roiPct >= 0 ? '+' : '';
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
          <span class="th-name"><span class="th-ic">${t.icon}</span>${t.name} · ${t.price} ◉</span>
          <span class="th-ev ${evClass}">期望 ${evSign}${t.expectedProfit.toFixed(1)} · ROI ${roiSign}${roiPct}%</span>
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
    const autoSellText = stats.autoSellUnlocked ? '已开启' : '未开启';
    const autoSellCls = stats.autoSellUnlocked ? '' : 'base';
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
      <div class="attr-row"><span class="ar-name">自动售卖站</span><span class="ar-val ${autoSellCls}">${autoSellText}</span></div>
      <div class="attr-row"><span class="ar-name">机器人分拣强化</span><span class="ar-val ${autoTierCls}">${autoTierText}</span></div>
    </div>`;

    body.innerHTML = `
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
};
