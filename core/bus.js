/**
 * core/bus.js · MONOMODE.bus
 * Обёртка над EventTarget для симметричной подписки.
 */
(function (M) {
  'use strict';

  // M.emit и M.on уже определены в monomode.js
  // здесь только дополнительный helper — once
  M.once = function (name, fn) {
    const wrap = (e) => {
      M.bus?.removeEventListener?.(name, wrap);
      fn(e);
    };
    M.on(name, wrap);
  };

  M.modules.bus = { ok: true };
})(window.MONOMODE);