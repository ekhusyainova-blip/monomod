/**
 * modules/psi/state.js · Ψ
 * Key/value хранилище.
 */
(function (M) {
  'use strict';

  M.state = {
    get(key) { return localStorage.getItem('mm_' + key); },
    set(key, value) { localStorage.setItem('mm_' + key, String(value)); },
    remove(key) { localStorage.removeItem('mm_' + key); },
    clear() {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('mm_')) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    },
  };

  M.mm?.registerModule?.('state', M.state);
})(window.MONOMODE);