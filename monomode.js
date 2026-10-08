(function () {
  'use strict';

  const CFG = {
    version: '5.0.0',
    origin: location.origin + location.pathname.replace(/\/[^/]*$/, '/'),
    manifest: 'modules.json',
  };

  const bus = new EventTarget();
  const emit = (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d }));
  const on  = (n, f) => bus.addEventListener(n, f);

  window.MONOMODE = {
    version: CFG.version,
    origin: CFG.origin,
    emit, on,
    modules: {},
    loaded: new Set(),
  };

  async function loadOne(name) {
    if (window.MONOMODE.loaded.has(name)) return;
    try {
      const res = await fetch(CFG.origin + name, { cache: 'no-cache' });
      if (!res.ok) { console.warn('skip:', name, res.status); return; }
      const code = await res.text();
      const fn = new Function('MONOMODE', code + '\n//# sourceURL=' + name);
      fn(window.MONOMODE);
      window.MONOMODE.loaded.add(name);
      emit('mm:module:loaded', { name });
    } catch (e) {
      console.warn('module fail:', name, e);
      emit('mm:module:failed', { name, error: String(e) });
    }
  }

  async function boot() {
    let list = [];
    try {
      const res = await fetch(CFG.origin + CFG.manifest, { cache: 'no-cache' });
      if (res.ok) list = await res.json();
    } catch {}
    if (!Array.isArray(list) || !list.length) {
      list = ['mm-id.js', 'mm-core.js', 'mm-links.js', 'mm-fragments.js',
              'mm-spheres.js', 'mm-auth.js', 'mm-ui.js', 'mm-viz.js',
              'mm-input.js', 'mm-pwa.js'];
    }
    for (const m of list) await loadOne(m);
    emit('mm:ready', { version: CFG.version });
  }

  // внешняя загрузка (для фрагментов, добавляемых на лету)
  window.MONOMODE.load = loadOne;

  boot();
})();