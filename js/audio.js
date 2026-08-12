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

  /** 初始化（在 DOMContentLoaded 后调用） */
  init() {
    this.audio = document.getElementById('bgm');
    if (!this.audio) return;
    this.audio.loop = true;
    this.audio.volume = 0.5;
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
    const mask = document.getElementById('bgmModal');
    if (mask) mask.classList.add('show');
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
  },

  /** 更新弹窗内全局按钮文字 */
  updateGlobalBtn() {
    const btn = document.getElementById('btnBgmGlobalToggle');
    if (!btn) return;
    btn.textContent = this.isPlaying ? '⏸ 全部暂停' : '▶ 全部播放';
  },
};
