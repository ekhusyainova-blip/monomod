/**
 * renderers/output.js · рендер ответа генератора.
 */
(function (M) {
  'use strict';

  const R = {
    el: null,

    init() {
      this.el = document.getElementById('output');
    },

    show(result) {
      if (!this.el) this.init();
      if (!this.el) return;

      // подсветка золотом, если стратегия — graph
      const golden = result.strategy === 'graph' && result.words.length >= 4;

      // собираем HTML с обёрткой по словам
      const html = result.words.map(w =>
        `<span class="gen-word">${_esc(w)}</span>`
      ).join('<span class="gen-sep">·</span>');

      const meta = `<span class="gen-meta">${result.strategy} · ${result.words.length} слов</span>`;

      this.el.innerHTML = html + meta;
      this.el.classList.toggle('golden', golden);
      this.el.classList.add('visible');

      // авто-затухание
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
    // при P7 (rupture) — очищаем поле
    if (e.detail.phase === 'P7') R.clear();
  });

  M.on('mm:ready', () => R.init());
})(window.MONOMODE);