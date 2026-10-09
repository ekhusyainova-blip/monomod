/**
 * renderers/input.js · перехват Enter
 */
(function (M) {
  'use strict';

  const I = {
    attach() {
      const input = document.getElementById('user-input');
      if (!input) return;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          M.emit('mm:phase', { phase: 'P3' });
          setTimeout(() => {
            M.conveyer.processInput(input.value);
            input.value = '';
          }, 800);
        }
      });
    },
  };

  M.input = I;
  M.on('mm:ready', () => I.attach());
})(window.MONOMODE);