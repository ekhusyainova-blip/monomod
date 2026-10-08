(function (M) {
  const Viz = {
    canvas: null, ctx: null, raf: null,

    init() {
      const stage = document.getElementById('stage');
      if (!stage) return;

      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = [
        'position:absolute',
        'inset:0',
        'pointer-events:none',   // ← НЕ перехватывает ввод
        'z-index:1',
      ].join(';');
      stage.appendChild(this.canvas);

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
      const graph = M.core ? M.core.graph() : [];
      const hasGraph = graph.length > 0;

      // пульсация
      const t = Date.now() / 1500;
      const pulse = 1 + Math.sin(t) * 0.05;
      const r = 60 * pulse;

      // градиент — присутствие MONOMODE
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      if (hasGraph) {
        g.addColorStop(0, 'rgba(77,208,199,0.5)');
        g.addColorStop(1, 'rgba(77,208,199,0)');
      } else {
        g.addColorStop(0, 'rgba(77,208,199,0.15)');
        g.addColorStop(1, 'rgba(77,208,199,0)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    },
  };

  M.viz = Viz;
  M.modules.viz = Viz;
  M.on('mm:ready', () => Viz.init());
})(window.MONOMODE);