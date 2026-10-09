/**
 * modules/lambda/klepa.js · Λ
 * Пиксельный фон. Реагирует на граф, ввод, фазы.
 */
(function (M) {
  'use strict';

  const W = 96, H = 96;
  const FPS = 24;

  const PALETTES = {
    idle:    { r: 77,  g: 208, b: 199 },   // cyan
    golden:  { r: 255, g: 215, b: 0 },     // gold
    rupture: { r: 255, g: 106, b: 154 },   // pink-red
    breath:  { r: 167, g: 139, b: 250 },   // purple
  };

  const K = {
    canvas: null,
    ctx: null,
    img: null,
    cells: new Float32Array(W * H),
    next: new Float32Array(W * H),
    phase: 'idle',
    phaseUntil: 0,
    density: 0.02,
    lastFrame: 0,
    raf: null,
    running: false,

    init() {
      this.canvas = document.getElementById('klepa');
      if (!this.canvas) return;
      this.canvas.width = W;
      this.canvas.height = H;
      this.ctx = this.canvas.getContext('2d');
      this.img = this.ctx.createImageData(W, H);

      // начальная засевка
      for (let i = 0; i < W * H; i++) {
        if (Math.random() < this.density) this.cells[i] = Math.random() * 0.5 + 0.3;
      }

      this.running = true;
      this._loop();
      console.log('[lambda] klepa ready · ' + W + '×' + H);
    },

    // ─── реакция на события ──────────────────────────
    _stimulus(x, y, strength, radius = 6) {
      const cx = Math.floor(x), cy = Math.floor(y);
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = cx + dx, py = cy + dy;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const fall = 1 - dist / radius;
          const idx = py * W + px;
          this.cells[idx] = Math.min(1, this.cells[idx] + strength * fall);
        }
      }
    },

    pulseFromCenter(strength = 0.9, radius = 10) {
      this._stimulus(W / 2, H / 2, strength, radius);
      this._setPhase('breath', 800);
    },

    pulseRandom(strength = 0.5) {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        this._stimulus(
          Math.random() * W, Math.random() * H, strength, 4 + Math.random() * 4
        );
      }
    },

    shake(strength = 0.8) {
      // разброс яркости по всей сетке
      for (let i = 0; i < W * H; i++) {
        if (Math.random() < 0.15) this.cells[i] = Math.min(1, this.cells[i] + strength * Math.random());
      }
      this._setPhase('rupture', 1500);
    },

    goldenWave() {
      // волна от центра
      for (let i = 0; i < W * H; i++) {
        const x = i % W, y = Math.floor(i / W);
        const dx = x - W / 2, dy = y - H / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45) {
          this.cells[i] = Math.min(1, this.cells[i] + 0.7);
        }
      }
      this._setPhase('golden', 2500);
    },

    _setPhase(name, duration) {
      this.phase = name;
      this.phaseUntil = performance.now() + duration;
    },

    // ─── шаг клеточного автомата ─────────────────────
    _step() {
      const c = this.cells, n = this.next;
      const decay = 0.02;
      const spread = 0.15;
      const sprout = 0.0015;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x;
          let sum = 0, count = 0;

          // соседи (8)
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const px = x + dx, py = y + dy;
              if (px < 0 || px >= W || py < 0 || py >= H) continue;
              sum += c[py * W + px];
              count++;
            }
          }
          const avg = sum / count;

          let v = c[i];
          // рост от соседей
          v += (avg - v) * spread;
          // собственное затухание
          v -= v * decay;
          // редкие вспышки
          if (Math.random() < sprout) v += 0.4;
          // clamp
          if (v < 0) v = 0;
          if (v > 1) v = 1;

          n[i] = v;
        }
      }

      // swap
      this.cells = n;
      this.next = c;
    },

    // ─── отрисовка ───────────────────────────────────
    _draw() {
      const data = this.img.data;
      let palette = PALETTES[this.phase];
      // фаза истекла?
      if (performance.now() > this.phaseUntil && this.phase !== 'idle') {
        this.phase = 'idle';
        palette = PALETTES.idle;
      }

      for (let i = 0; i < W * H; i++) {
        const v = this.cells[i];
        const p = i * 4;
        data[p]     = palette.r * v;
        data[p + 1] = palette.g * v;
        data[p + 2] = palette.b * v;
        data[p + 3] = 255 * Math.min(1, v * 1.3);
      }
      this.ctx.putImageData(this.img, 0, 0);
    },

    // ─── цикл ────────────────────────────────────────
    _loop() {
      if (!this.running) return;
      const now = performance.now();
      if (now - this.lastFrame < 1000 / FPS) {
        this.raf = requestAnimationFrame(() => this._loop());
        return;
      }
      this.lastFrame = now;

      this._step();
      this._draw();

      // фоновый шум: иногда
      if (Math.random() < 0.02) this.pulseRandom(0.3);

      this.raf = requestAnimationFrame(() => this._loop());
    },

    stop() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
    },

    stats() {
      return {
        running: this.running,
        phase: this.phase,
        size: W + '×' + H,
        total_intensity: Array.from(this.cells).reduce((s, x) => s + x, 0) / (W * H),
      };
    },
  };

  M.klepa = K;
  M.modules.klepa = K;

  // ─── подписки на события ────────────────────────
  M.on('mm:ready', () => K.init());

  M.on('mm:conveyer:result', () => K.pulseFromCenter(0.7, 8));
  M.on('mm:archive:created', () => K.goldenWave());
  M.on('mm:generator:produced', () => K.pulseRandom(0.35));

  M.on('mm:phase', (e) => {
    const p = e.detail?.phase;
    if (p === 'P3') K.pulseFromCenter(0.5, 6);
    if (p === 'P7') K.shake(0.6);
    if (p === 'P10') K.pulseRandom(0.4);
  });

  M.on('mm:generator:strategy', () => K.pulseFromCenter(0.3, 5));
})(window.MONOMODE);