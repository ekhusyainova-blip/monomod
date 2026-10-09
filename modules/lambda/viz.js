/**
 * modules/lambda/viz.js · Λ
 * Показ статуса.
 */
(function (M) {
  'use strict';

  M.viz = {
    render(state) {
      const el = document.getElementById('status');
      if (!el) return;
      el.textContent = String(state);
      el.classList.add('visible');
      setTimeout(() => el.classList.remove('visible'), 3000);
    },
  };

  M.mm?.registerModule?.('viz', M.viz);
})(window.MONOMODE);