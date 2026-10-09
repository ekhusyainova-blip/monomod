/**
 * renderers/output.js · рендер ответа + панель стратегий.
 */
(function (M) {
  'use strict';

  const R = {
    el: null,
    switchEl: null,
    _timer: null,

    init() {
      this.el = document.getElementById('output');
      this.switchEl = document.getElementById('strategy-switch');
      this._bindStrategy();
    },

    _bindStrategy() {
      if (!this.switchEl) return;
      this.switchEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const s = btn.dataset.strategy;
        M.generator?.setStrategy?.(s);
        this._markStrategy(s);
      });
      this._markStrategy(M.generator?.getStrategy?.() || 'auto');
    },

    _markStrategy(s) {
      if (!this.switchEl) return;
      for (const b of this.switchEl.querySelectorAll('button')) {
        b.classList.toggle('on', b.dataset.strategy === s);
      }
    },

    show(result) {
      if (!this.el) this.init();
      if (!this.el) return;

      const golden = result.words.length >= 5 && result.strategy !== 'echo';
      const html = result.words
        .map(w => `<span class="gen-word">${_esc(w)}</span>`)
        .join('<span class="gen-sep">·</span>');
      const meta = `<span class="gen-meta">${result.strategy} · ${result.words.length} слов</span>`;

      this.el.innerHTML = html + meta;
      this.el.classList.toggle('golden', golden);
      this.el.classList.add('visible');

      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.el.classList.remove('visible');
        setTimeout(() => {
          this.el.classList.remove('golden');
          this.el.innerHTML = '';
        }, 800);
      }, 7000);
    },

    clear() {
      if (!this.el) this.init();
      if (!this.el) return;
      this.el.classList.remove('visible');
      this.el.innerHTML = '';
    },
  };

  function _esc(s) {
    return String(s).replace(/[&<>"]/g,
      m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]));
  }

  M.output = R;
  M.modules.output = R;

  M.on('mm:generator:produced', (e) => R.show(e.detail));
  M.on('mm:phase', (e) => {
    if (e.detail.phase === 'P7') R.clear();
  });

  M.on('mm:ready', () => R.init());
})(window.MONOMODE);