(function (M) {
  const Viz = {
    canvas: null, ctx: null, raf: null, focus: null,

    init() {
      const stage = document.getElementById('stage');
      if (!stage) return;
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'position:absolute;inset:0;pointer-events:auto;z-index:1;';
      stage.appendChild(this.canvas);
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.canvas.addEventListener('click', (e) => this.onClick(e));
      this.loop();
    },
    resize() {
      const r = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = r.width; this.canvas.height = r.height;
    },

    // сферы с их «весом» — активность из trail
    spheres() {
      const cur = M.id.current();
      const list = M.spheres.list();
      const focus = this.focus || cur;
      const current = list.find(s => s.id === cur);

      return list.map((s, i) => {
        const snap = M.core.snapshot(s.id);
        const active = (cur === s.id) || (current && s.parent === current.id) ||
                       (current && current.parent === s.id);
        const isFocus = s.id === focus;
        const lineage = M.id.lineage(s.id).length;

        // вес = активность: trail последних записей
        const trail = M.core.trail(s.id);
        const last = trail.length ? trail[trail.length - 1].ts : 0;
        const freshness = last ? Math.max(0, 1 - (Date.now() - last) / (1000 * 60 * 60 * 24)) : 0;

        return {
          ...s,
          active,
          isFocus,
          lineage,
          freshness,
          edges: snap.edges,
          breath: snap.trail > 0 ? 1 : 0,
        };
      });
    },

    layout(list) {
      const cx = this.canvas.width / 2, cy = this.canvas.height / 2;
      const R = Math.min(cx, cy) * 0.6;
      const focus = list.find(s => s.isFocus);
      const out = [];

      // фокус — в центре
      if (focus) out.push({ ...focus, x: cx, y: cy, r: 64 * (0.6 + 0.4 * focus.freshness) });

      // прямые связи фокуса — вокруг
      const near = list.filter(s => !s.isFocus && (s.parent === focus?.id || focus?.parent === s.id));
      near.forEach((s, i) => {
        const a = (i / Math.max(1, near.length)) * Math.PI * 2 - Math.PI / 2;
        out.push({ ...s, x: cx + Math.cos(a) * R * 0.55, y: cy + Math.sin(a) * R * 0.55, r: 36 * (0.6 + 0.4 * s.freshness) });
      });

      // дальние — фон, точки
      const far = list.filter(s => !out.find(o => o.id === s.id));
      far.forEach((s, i) => {
        const a = (i / Math.max(1, far.length)) * Math.PI * 2;
        const rr = R * 1.3 + (i % 3) * 24;
        out.push({ ...s, x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: 3, far: true });
      });

      return out;
    },

    onClick(e) {
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (const p of this.layout(this.spheres())) {
        if (Math.hypot(x - p.x, y - p.y) < Math.max(p.r, 8) + 6) {
          if (p.far) { this.focus = p.id; }
          else { M.spheres.switchTo(p.id); this.focus = null; }
          return;
        }
      }
      this.focus = null;
    },

    loop() {
      this.raf = requestAnimationFrame(() => this.loop());
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const list = this.spheres();
      const points = this.layout(list);
      const t = Date.now() / 1500;

      // связи
      for (const p of points) {
        if (!p.parent) continue;
        const par = points.find(x => x.id === p.parent);
        if (!par) continue;
        ctx.beginPath();
        ctx.moveTo(par.x, par.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.active ? 'rgba(77,208,199,0.25)' : 'rgba(77,208,199,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // сферы
      for (const p of points) {
        if (p.far) {
          // дальняя — точка
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.breath ? 'rgba(77,208,199,0.5)' : 'rgba(120,120,140,0.2)';
          ctx.fill();
          continue;
        }

        // локальная — сфера с пульсацией
        const pulse = p.active ? 1 + Math.sin(t + p.x * 0.01) * 0.05 : 1;
        const rr = p.r * pulse;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        if (p.isFocus) {
          g.addColorStop(0, 'rgba(255,215,0,0.6)');
          g.addColorStop(1, 'rgba(255,215,0,0)');
        } else if (p.active) {
          g.addColorStop(0, 'rgba(77,208,199,0.5)');
          g.addColorStop(1, 'rgba(77,208,199,0)');
        } else {
          g.addColorStop(0, 'rgba(120,120,140,0.25)');
          g.addColorStop(1, 'rgba(120,120,140,0)');
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // подпись только у активных
        if (p.active && !p.far) {
          ctx.fillStyle = p.isFocus ? 'rgba(255,215,0,0.9)' : 'rgba(200,200,212,0.6)';
          ctx.font = '10px "Courier New", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.id.slice(0, 10) + '…', p.x, p.y + rr + 14);
        }
      }
    },
  };
  M.viz = Viz;
  M.modules.viz = Viz;
  M.on('mm:ready', () => Viz.init());
  M.on('mm:sphere:switch', () => { Viz.focus = null; });
})(window.MONOMODE);