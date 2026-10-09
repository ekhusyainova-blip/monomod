/**
 * modules/omega/canon.js · Ω
 * Проверка инварианта 1:1:1.
 */
(function (M) {
  'use strict';

  M.canon = {
    verify(triad) {
      const t = triad || { psi: 1/3, lambda: 1/3, omega: 1/3 };
      const sum = t.psi + t.lambda + t.omega;
      return Math.abs(sum - 1.0) < 1e-3;
    },
  };

  M.mm?.registerModule?.('canon', M.canon);
})(window.MONOMODE);