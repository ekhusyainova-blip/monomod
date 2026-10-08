/* ============================================================================
   MONOMODE — загрузчик + шина + автопроверка обновлений
   Репо: GitHub Pages
   База MONOMOD не меняется.
   ============================================================================ */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // КОНФИГ
  // ---------------------------------------------------------------------------
  const CFG = {
    version: '6.0.0',
    origin: location.origin + location.pathname.replace(/\/[^/]*$/, '/'),
    manifest: 'modules.json',
    sw: 'sw.js',
    swInterval: 60 * 1000,   // проверка обновлений раз в минуту
  };

  // ---------------------------------------------------------------------------
  // ШИНА
  // ---------------------------------------------------------------------------
  const bus = new EventTarget();
  const emit = (n, d) => bus.dispatchEvent(new CustomEvent(n, { detail: d }));
  const on  = (n, f) => bus.addEventListener(n, f);

  // ---------------------------------------------------------------------------
  // ПУБЛИЧНЫЙ ОБЪЕКТ
  // ---------------------------------------------------------------------------
  window.MONOMODE = {
    version: CFG.version,
    origin: CFG.origin,
    emit,
    on,
    modules: {},
    loaded: new Set(),
  };

  // ---------------------------------------------------------------------------
  // ЗАГРУЗКА ОДНОГО МОДУЛЯ
  // ---------------------------------------------------------------------------
  async function loadOne(name) {
    if (window.MONOMODE.loaded.has(name)) return;
    try {
      const res = await fetch(CFG.origin + name, { cache: 'no-cache' });
      if (!res.ok) {
        console.warn('skip:', name, res.status);
        emit('mm:module:failed', { name, status: res.status });
        return;
      }
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

  // внешняя загрузка
  window.MONOMODE.load = loadOne;

  // ---------------------------------------------------------------------------
  // ЗАГРУЗКА ВСЕХ МОДУЛЕЙ
  // ---------------------------------------------------------------------------
  async function boot() {
    let list = [];
    try {
      const res = await fetch(CFG.origin + CFG.manifest, { cache: 'no-cache' });
      if (res.ok) list = await res.json();
    } catch {}

    if (!Array.isArray(list) || !list.length) {
      // встроенный список по умолчанию
      list = [
        'mm-query.js',
        'mm-input.js',
        'mm-viz.js',
        'mm-ui.js',
      ];
    }

    for (const m of list) await loadOne(m);
    emit('mm:ready', { version: CFG.version });
  }

  // ---------------------------------------------------------------------------
  // PWA — регистрация + автопроверка обновлений
  // ---------------------------------------------------------------------------
  const PWA = {
    async register() {
      if (!('serviceWorker' in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.register(CFG.origin + CFG.sw, {
          scope: CFG.origin,
        });

        // проверка обновлений раз в минуту
        setInterval(() => {
          reg.update().catch(() => {});
        }, CFG.swInterval);

        // если новый SW активируется — сообщаем, но НЕ перезагружаем
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              emit('mm:sw:updated', {});
              console.log('[MONOMODE] обновление доступно, применится при следующем запуске');
            }
          });
        });
      } catch (e) {
        console.warn('SW:', e);
      }
    },
  };

  // ---------------------------------------------------------------------------
  // СТАРТ
  // ---------------------------------------------------------------------------
  PWA.register();
  boot();

})();