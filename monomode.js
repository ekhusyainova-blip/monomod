/**
 * monomode.js · CANON 9.0.0
 * Загрузчик модулей + шина событий + M-пространство.
 * Единственная точка, откуда всё начинается.
 */
(function (root) {
  'use strict';

  const CFG = {
    version: '9.0.0',
    origin: location.origin + location.pathname.replace(/\/[^/]*$/, '/'),
    manifest: 'modules.json',
    sw: 'sw.js',
  };

  // ─── ШИНА ───
  const bus = new EventTarget();
  const emit = (name, detail) =>
    bus.dispatchEvent(new CustomEvent(name, { detail }));
  const on = (name, fn) => bus.addEventListener(name, fn);

  // ─── M (пространство имён) ───
  const M = {
    version: CFG.version,
    origin: CFG.origin,
    modules: new Map(),      // реестр модулей
    loaded: new Set(),       // загруженные файлы
    emit, on,
    ready: false,
  };
  root.MONOMODE = M;

  // ─── загрузка одного модуля ───
  async function loadOne(path) {
    if (M.loaded.has(path)) return;
    try {
      const res = await fetch(CFG.origin + path, { cache: 'no-cache' });
      if (!res.ok) { console.warn('[MONOMODE] skip', path, res.status); return; }
      const code = await res.text();
      const fn = new Function('M', code + '\n//# sourceURL=' + path);
      fn(M);
      M.loaded.add(path);
      emit('mm:module:loaded', { path });
    } catch (e) {
      console.warn('[MONOMODE] fail', path, e);
      emit('mm:module:failed', { path, error: String(e) });
    }
  }
  M.load = loadOne;

  // ─── boot ───
  async function boot() {
    let list = [];
    try {
      const res = await fetch(CFG.origin + CFG.manifest, { cache: 'no-cache' });
      if (res.ok) list = await res.json();
    } catch (_) {}

    if (!Array.isArray(list) || !list.length) {
      console.warn('[MONOMODE] пустой manifest');
    }

    for (const path of list) await loadOne(path);

    M.ready = true;
    emit('mm:ready', { version: CFG.version });
  }

  // ─── PWA ───
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(CFG.origin + CFG.sw, { scope: CFG.origin })
      .catch(e => console.warn('[MONOMODE] SW', e));
  }

  boot();
  console.log('[MONOMODE ' + CFG.version + '] boot');
})(window);