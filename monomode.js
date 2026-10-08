(function () {
  'use strict';
  const MODULES = [
    'mm-id.js',
    'mm-core.js',
    'mm-spheres.js',
    'mm-auth.js',
    'mm-ui.js',
    'mm-viz.js',
    'mm-input.js',
    'mm-pwa.js',
  ];
  const CFG = {
    version: '4.0.0',
    origin: location.origin + location.pathname.replace(/\/[^/]*$/, '/'),
  };
  const bus = new EventTarget();
  const emit = (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d }));
  const on  = (n, f) => bus.addEventListener(n, f);
  window.MONOMODE = { version: CFG.version, origin: CFG.origin, emit, on, modules: {} };

  (async () => {
    for (const m of MODULES) {
      try {
        const code = await fetch(CFG.origin + m).then(r => r.text());
        const fn = new Function('MONOMODE', code + '\n//# sourceURL=' + m);
        fn(window.MONOMODE);
      } catch (e) { console.warn('module fail:', m, e); }
    }
    emit('mm:ready', { version: CFG.version });
  })();
})();