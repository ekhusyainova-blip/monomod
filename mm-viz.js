(function (M) {
  /* ==========================================================================
     MM-VIZ — визуализация
     Точка MONOMODE в центре. Сферу рисует база.
     ========================================================================== */

  const Viz = {
    canvas: null, ctx: null, raf: null,

    init() {
      const stage = document.getElementById('stage');
      if (!stage) return;

      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = [
        'position:absolute',
        'inset:0',
        'pointer-events:none',   // не мешает вводу
        'z-index:1',
      ].join(';');
      stage.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.loop();
    },

    resize() {
      if (!this.canvas) return;
      const r = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = r.width;
      this.canvas.height = r.height;
    },

    loop() {
      this.raf = requestAnimationFrame(() => this.loop());
      const { ctx, canvas } = this;
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // есть ли граф?
      let hasGraph = false;
      try {
        const g = JSON.parse(localStorage.getItem('mm_graph') || '[]');
        hasGraph = g.length > 0;
      } catch {}

      // пульсация точки MONOMODE
      const t = Date.now() / 1500;
      const pulse = 1 + Math.sin(t) * 0.15;
      const r = (hasGraph ? 6 : 3) * pulse;

      // градиент вокруг точки
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      if (hasGraph) {
        grd.addColorStop(0, 'rgba(77,208,199,0.6)');
        grd.addColorStop(1, 'rgba(77,208,199,0)');
      } else {
        grd.addColorStop(0, 'rgba(77,208,199,0.2)');
        grd.addColorStop(1, 'rgba(77,208,199,0)');
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // сама точка
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = hasGraph ? '#4dd0c7' : 'rgba(77,208,199,0.4)';
      ctx.fill();
    },
  };

  M.viz = Viz;
  M.modules.viz = Viz;
  M.on('mm:ready', () => Viz.init());
})(window.MONOMODE);