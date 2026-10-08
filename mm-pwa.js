(function (M) {
  const PWA = {
    symbol: '𝕄⁺⁺',
    bg: '#0a0a0c',
    accent: '#4dd0c7',
    gold: '#ffd700',

    init() {
      this.injectIcons();
      this.injectManifest();
      this.registerSW();
    },

    makeIcon(size, glow, gold) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = this.bg;
      ctx.fillRect(0, 0, size, size);
      if (glow) {
        const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        g.addColorStop(0, gold ? 'rgba(255,215,0,0.2)' : 'rgba(77,208,199,0.15)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }
      ctx.fillStyle = gold ? this.gold : this.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${size * 0.5}px "Courier New", monospace`;
      ctx.fillText(this.symbol, size/2, size/2);
      return c.toDataURL('image/png');
    },

    injectIcons() {
      let fav = document.querySelector('link[rel="icon"]');
      if (!fav) {
        fav = document.createElement('link');
        fav.rel = 'icon';
        document.head.appendChild(fav);
      }
      fav.href = this.makeIcon(64, false, false);
    },

    injectManifest() {
      const manifest = {
        name: 'MONOMOD',
        short_name: 'MONOMOD',
        description: 'Автономная среда MONOMOD + MONOMODE',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: this.bg,
        theme_color: this.accent,
        lang: 'ru',
        icons: [
          { src: this.makeIcon(192, false, false), sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: this.makeIcon(512, true,  false), sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: this.makeIcon(512, true,  true),  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = url;
    },

    async registerSW() {
      if (!('serviceWorker' in navigator)) return;
      try {
        await navigator.serviceWorker.register('./sw.js', { scope: './' });
      } catch (e) { console.warn('SW:', e); }
    },
  };

  M.pwa = PWA;
  M.modules.pwa = PWA;
  M.on('mm:ready', () => PWA.init());
})(window.MONOMODE);