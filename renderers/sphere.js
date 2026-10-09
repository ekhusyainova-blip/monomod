/**
 * renderers/sphere.js · визуализация сферы
 * P0 → P3 → P7/P10 → P0
 */
(function (M) {
  'use strict';

  const R = {
    sphere: null,
    slider: null,
    inputArea: null,

    init() {
      this.sphere = document.getElementById('sphere');
      this.slider = document.getElementById('slider-fill');
      this.inputArea = document.getElementById('input-area');
    },

    transition(phase) {
      if (!this.sphere) this.init();
      if (!this.sphere) return;

      this.slider.style.width =
        phase === 'P0' ? '0%' :
        phase === 'P7' ? '70%' : '100%';

      if (phase === 'P0') {
        this.sphere.className = 'sphere';
        if (this.inputArea) {
          this.inputArea.className = 'visible';
          const input = document.getElementById('user-input');
          if (input) { input.value = ''; input.focus(); }
        }
      } else if (phase === 'P3') {
        if (this.inputArea) this.inputArea.className = '';
        this.sphere.className = 'sphere active';
      } else if (phase === 'P7') {
        this.sphere.className = 'sphere rupture';
        setTimeout(() => this.transition('P0'), 2500);
      } else if (phase === 'P10') {
        this.sphere.className = 'sphere active';
        setTimeout(() => this.transition('P0'), 2000);
      }
    },

    showGolden() {
      if (!this.sphere) this.init();
      if (!this.sphere) return;
      this.sphere.className = 'sphere golden';
      setTimeout(() => {
        if (this.sphere.classList.contains('golden')) {
          this.sphere.className = 'sphere active';
        }
      }, 3000);
    },
  };

  M.sphere = R;
  M.modules.sphere = R;

  M.on('mm:phase', (e) => R.transition(e.detail.phase));
  M.on('mm:archive:created', () => R.showGolden());
})(window.MONOMODE);