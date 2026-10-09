/**
 * modules/psi/spiral.js · Ψ
 * Уровень спирали. level++.
 */
(function (M) {
  'use strict';

  M.spiral = {
    level: 0,
    next() {
      this.level++;
      M.emit('mm:spiral:step', { level: this.level });
      return this.level;
    },
    reset() { this.level = 0; },
  };

  M.mm?.registerModule?.('spiral', M.spiral);
})(window.MONOMODE);