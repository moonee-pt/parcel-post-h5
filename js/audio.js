// =====================================================
// BGM 背景音乐管理
// =====================================================
// 资源位置：assets/audio/bgm_NN.mp3
// 后续加歌：在 BGM_PLAYLIST 数组里加一行即可，UI 自动支持
// =====================================================

const BGM_PLAYLIST = [
  { id: 'bgm_01', name: '休憩时光', file: 'assets/audio/bgm_01.mp3' },
  { id: 'bgm_02', name: '拆盒跃响', file: 'assets/audio/bgm_02.mp3' },
  // 后续加歌示例：
  // { id: 'bgm_03', name: '夜晚', file: 'assets/audio/bgm_03.mp3' },
];

const BGM = {
  audio: null,       // <audio> 元素
  idx: 0,            // 当前播放索引
  isPlaying: false,  // 是否在播
  volume: 0.5,       // 音量（0-1），init 时从 localStorage 读

  /** 初始化（在 DOMContentLoaded 后调用） */
  init() {
    this.audio = document.getElementById('bgm');
    if (!this.audio) return;
    this.audio.loop = true;
    // 从 localStorage 读音量，没有则用 CONFIG.AUDIO.DEFAULT_BGM
    try {
      const v = localStorage.getItem(CONFIG.AUDIO.BGM_VOL_KEY);
      this.volume = v != null ? clamp01(parseFloat(v)) : CONFIG.AUDIO.DEFAULT_BGM;
    } catch (e) {
      this.volume = CONFIG.AUDIO.DEFAULT_BGM;
    }
    this.audio.volume = this.volume;
    this.audio.addEventListener('error', () => {
      // 资源 404 等不抛错，console 提示即可
      console.warn('[BGM] 资源加载失败：', BGM_PLAYLIST[this.idx]?.file);
      this.isPlaying = false;
      this.updateBtn();
    });
    this.load(this.idx, false);

    // 头部按钮 → 打开选歌弹窗
    const btn = document.getElementById('btnBgm');
    if (btn) btn.addEventListener('click', () => this.openPicker());

    // 弹窗内：关闭按钮 / 全局暂停-继续按钮
    const closeBtn = document.getElementById('btnBgmModalClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closePicker());
    const globalBtn = document.getElementById('btnBgmGlobalToggle');
    if (globalBtn) globalBtn.addEventListener('click', () => this.toggle());

    // 音量滑块：背景音乐
    this._bindVolumeSlider('volBgm', 'volBgmNum', (v) => this.setVolume(v));

    // 点遮罩关闭
    const mask = document.getElementById('bgmModal');
    if (mask) mask.addEventListener('click', (e) => {
      if (e.target === mask) this.closePicker();
    });

    // 试自动播放（移动端会被拦截，失败不报错）
    this.play();

    // 兜底：监听用户首次任意点击/触屏，若还没播就启动
    const kickoff = () => {
      if (!this.isPlaying) this.play();
    };
    document.addEventListener('pointerdown', kickoff, { once: true });
    document.addEventListener('keydown', kickoff, { once: true });
  },

  /** 绑定音量滑块 input 事件（label 自动跟随 + 写 localStorage） */
  _bindVolumeSlider(sliderId, numId, setter) {
    const slider = document.getElementById(sliderId);
    const num = document.getElementById(numId);
    if (!slider) return;
    // 初始值由 openPicker 同步；这里先跳过空值
    slider.addEventListener('input', () => {
      const pct = parseInt(slider.value, 10) || 0;
      setter(pct / 100);
      if (num) num.textContent = String(pct);
    });
  },

  /** 加载指定索引的歌曲（不自动播） */
  load(idx, autoplay = false) {
    this.idx = ((idx % BGM_PLAYLIST.length) + BGM_PLAYLIST.length) % BGM_PLAYLIST.length;
    if (this.audio) {
      this.audio.src = BGM_PLAYLIST[this.idx].file;
    }
    if (autoplay) this.play();
  },

  /** 播放（Promise 返回播放失败原因） */
  play() {
    if (!this.audio) return;
    return this.audio.play().then(() => {
      this.isPlaying = true;
      this.updateBtn();
    }).catch(err => {
      this.isPlaying = false;
      this.updateBtn();
    });
  },

  /** 暂停 */
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.updateBtn();
  },

  /** 切换播放/暂停（全局按钮） */
  toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  },

  /** 切到指定索引并播放 */
  playIdx(idx) {
    this.load(idx, false);
    this.play();
  },

  /** 打开选歌弹窗 */
  openPicker() {
    this.renderPicker();
    this._syncVolumeSliders();
    const mask = document.getElementById('bgmModal');
    if (mask) mask.classList.add('show');
  },

  /** 把当前 BGM/SFX 音量同步到滑块 UI */
  _syncVolumeSliders() {
    const bgmSlider = document.getElementById('volBgm');
    const bgmNum = document.getElementById('volBgmNum');
    if (bgmSlider) bgmSlider.value = String(Math.round(this.volume * 100));
    if (bgmNum) bgmNum.textContent = String(Math.round(this.volume * 100));

    const sfxSlider = document.getElementById('volSfx');
    const sfxNum = document.getElementById('volSfxNum');
    if (sfxSlider) sfxSlider.value = String(Math.round((typeof SFX !== 'undefined' ? SFX.getVolume() : CONFIG.AUDIO.DEFAULT_SFX) * 100));
    if (sfxNum) sfxNum.textContent = String(Math.round((typeof SFX !== 'undefined' ? SFX.getVolume() : CONFIG.AUDIO.DEFAULT_SFX) * 100));
  },

  /** 关闭选歌弹窗 */
  closePicker() {
    const mask = document.getElementById('bgmModal');
    if (mask) mask.classList.remove('show');
  },

  /** 渲染选歌弹窗列表 */
  renderPicker() {
    const body = document.getElementById('bgmModalBody');
    if (!body) return;
    body.innerHTML = BGM_PLAYLIST.map((bgm, i) => {
      const isCur = i === this.idx;
      const isOn = isCur && this.isPlaying;
      return `<div class="bgm-row ${isCur ? 'is-current' : ''} ${isOn ? 'is-playing' : ''}" data-idx="${i}">
        <div class="bgm-row-ic">${isOn ? '♬' : '♪'}</div>
        <div class="bgm-row-info">
          <div class="bgm-row-name">${bgm.name}</div>
          <div class="bgm-row-file">${bgm.id}.mp3</div>
        </div>
        <div class="bgm-row-tag">${isOn ? '播放中' : (isCur ? '当前' : '点击播放')}</div>
      </div>`;
    }).join('');

    // 绑定每行 click → 切到这首并播放
    body.querySelectorAll('.bgm-row').forEach(row => {
      row.addEventListener('click', () => {
        const i = parseInt(row.dataset.idx, 10);
        this.playIdx(i);
        this.renderPicker(); // 重新渲染以更新高亮
      });
    });

    // 更新全局按钮文字
    this.updateGlobalBtn();
  },

  /** 更新全局按钮文字 + 首页按钮状态 */
  updateBtn() {
    const btn = document.getElementById('btnBgm');
    if (btn) btn.classList.toggle('playing', this.isPlaying);
    this.updateGlobalBtn();
    // 弹窗打开时，行上的 is-playing class 也要同步刷新（暂停/继续时行高亮和 pulse 动效要立即更新）
    const mask = document.getElementById('bgmModal');
    if (mask && mask.classList.contains('show')) {
      this.renderPicker();
    }
  },

  /** 更新弹窗内全局按钮：按 isPlaying 切 class + 文字，icon 由 CSS 控制显示 */
  updateGlobalBtn() {
    const btn = document.getElementById('btnBgmGlobalToggle');
    if (!btn) return;
    btn.classList.toggle('is-playing', this.isPlaying);
    const label = btn.querySelector('.bgm-toggle-label');
    if (label) label.textContent = this.isPlaying ? '全部暂停' : '全部播放';
  },

  /** 设置音量（0-1），持久化 */
  setVolume(v) {
    this.volume = clamp01(v);
    if (this.audio) this.audio.volume = this.volume;
    try { localStorage.setItem(CONFIG.AUDIO.BGM_VOL_KEY, String(this.volume)); } catch (e) {}
  },

  /** 读取当前音量（0-1） */
  getVolume() {
    return this.volume;
  },
};

// =====================================================
// SFX 划拉音（短音效：拆盲盒封带时循环播放）
// =====================================================
// 资源位置：assets/audio/sfx_tear.mp3
// 行为：开始划 → 从头播；中途松手 → 暂停（保留位置）；再次划 → 继续播；拉满 → 停
// 速度：0.5x 播放，时长 ≈ 2 倍（原曲太短）
// =====================================================

const SFX = {
  audio: null,
  src: 'assets/audio/sfx_tear.mp3',
  isPlaying: false,
  rate: 0.5,      // 0.5x 播放，时长 ≈ 2 倍
  volume: 0.8,    // 默认 0.8（与 BGM 一致）

  init() {
    this.audio = document.getElementById('sfxTear');
    if (!this.audio) return;
    this.audio.loop = true;
    // 从 localStorage 读音量
    try {
      const v = localStorage.getItem(CONFIG.AUDIO.SFX_VOL_KEY);
      this.volume = v != null ? clamp01(parseFloat(v)) : CONFIG.AUDIO.DEFAULT_SFX;
    } catch (e) {
      this.volume = CONFIG.AUDIO.DEFAULT_SFX;
    }
    this.audio.volume = this.volume;
    this.audio.playbackRate = this.rate;
    this.audio.addEventListener('error', () => {
      console.warn('[SFX] 资源加载失败：', this.src);
      this.isPlaying = false;
    });
    // 设置 src（即使 html 没写，也补上）
    try {
      if (!this.audio.src || this.audio.src.endsWith('/')) {
        this.audio.src = this.src;
      }
    } catch (e) {}
    // 绑定 SFX 音量滑块
    const slider = document.getElementById('volSfx');
    const num = document.getElementById('volSfxNum');
    if (slider) {
      slider.addEventListener('input', () => {
        const pct = parseInt(slider.value, 10) || 0;
        this.setVolume(pct / 100);
        if (num) num.textContent = String(pct);
      });
    }
  },

  /** 开始划：播放（保留 currentTime，从断点继续；stop 后会从头） */
  play() {
    if (!this.audio) return;
    this.audio.play().then(() => {
      this.isPlaying = true;
    }).catch(() => {
      this.isPlaying = false;
    });
  },

  /** 中途松手：暂停（保留 currentTime，再次 play 从断点继续） */
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
  },

  /** 拉满 / 取消：停止并回到 0 */
  stop() {
    if (!this.audio) return;
    this.audio.pause();
    try {
      this.audio.currentTime = 0;
    } catch (e) {}
    this.isPlaying = false;
  },

  /** 设置音量（0-1），持久化 */
  setVolume(v) {
    this.volume = clamp01(v);
    if (this.audio) this.audio.volume = this.volume;
    try { localStorage.setItem(CONFIG.AUDIO.SFX_VOL_KEY, String(this.volume)); } catch (e) {}
    // 联动一次性音效（同用 SFX_VOL_KEY + 同一个音量滑块）
    if (typeof SFX_ONE !== 'undefined' && SFX_ONE.setVolume) SFX_ONE.setVolume(this.volume);
  },

  /** 读取当前音量（0-1） */
  getVolume() {
    return this.volume;
  },
};

// =====================================================
// SFX_ONE 一次性短音效（隐藏款 / 领取金币等）
// 资源位置：assets/audio/sfx_hidden.mp3  / sfx_coin.mp3
// 行为：每次 play() 从头播；新播放会打断旧的
// 音量：共用 SFX_VOL_KEY（与 SFX 划拉音一个滑块一起调）
// =====================================================

const SFX_ONE = {
  // id → 资源路径。新增音效在这里加一行即可
  files: {
    hidden:   'assets/audio/sfx_hidden.mp3',    // 抽出隐藏款时
    coin:     'assets/audio/sfx_coin.mp3',      // 领取金币时（图鉴奖励 / 机器人存储）
    cardFlip: 'assets/audio/sfx_card_flip.mp3', // 技能里抽卡翻牌时
    upgrade:  'assets/audio/sfx_upgrade.mp3',   // 所有升级时（技能 / 幸运值 / 看广告解锁）
  },
  audio: null,
  volume: 0.8,

  init() {
    this.audio = document.getElementById('sfxOne');
    if (!this.audio) return;
    // 共用 SFX 音量 key（一个滑块统一控所有音效）
    try {
      const v = localStorage.getItem(CONFIG.AUDIO.SFX_VOL_KEY);
      this.volume = v != null ? clamp01(parseFloat(v)) : CONFIG.AUDIO.DEFAULT_SFX;
    } catch (e) {
      this.volume = CONFIG.AUDIO.DEFAULT_SFX;
    }
    this.audio.volume = this.volume;
    this.audio.addEventListener('error', () => {
      console.warn('[SFX_ONE] 资源加载失败：', this.audio?.src);
    });
  },

  /** 播放指定 id 的一次性音效（打断旧的） */
  play(id) {
    if (!this.audio) return;
    const file = this.files[id];
    if (!file) {
      console.warn('[SFX_ONE] 未知音效 id：', id);
      return;
    }
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = file;
      this.audio.play().catch(() => {});
    } catch (e) {}
  },

  /** 设置音量（0-1），不单独持久化（共用 SFX_VOL_KEY） */
  setVolume(v) {
    this.volume = clamp01(v);
    if (this.audio) this.audio.volume = this.volume;
  },

  getVolume() {
    return this.volume;
  },
};

/** 工具：把任意数字裁到 0-1 */
function clamp01(v) {
  v = Number(v);
  if (isNaN(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
