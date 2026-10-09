/**
 * core/monomode.js · MONOMODE wrapper
 * Реестр модулей, кэш, обратный вызов MONOMODE → MONOMOD.
 */
(function (M) {
  'use strict';

  const MM = {
    version: '9.0.0',
    registry: new Map(),
    queryCount: 0,

    registerModule(name, module) {
      this.registry.set(name, module);
      M.emit('mm:module:registered', { name });
      this.updateUI();
      return module;
    },

    get(name) { return this.registry.get(name); },
    has(name) { return this.registry.has(name); },
    list() { return Array.from(this.registry.keys()); },

    // смена ролей: MONOMODE → MONOMOD
    queryMonomod(type, pattern) {
      this.queryCount++;
      this.updateUI();

      if (type === 'graph')    return M.graph?.query(pattern) || [];
      if (type === 'template') return M.archive?.query(pattern) || [];
      if (type === 'memory')   return M.memory?.trail.filter(t =>
        t.words?.some?.(w => w.includes(pattern))) || [];
      return [];
    },

    cache() {
      try {
        localStorage.setItem('mm_monomode_cache', JSON.stringify({
          version: this.version,
          modules: this.list(),
          ts: Date.now(),
        }));
      } catch (_) {}
    },

    loadCache() {
      try {
        const cached = localStorage.getItem('mm_monomode_cache');
        if (cached) {
          const data = JSON.parse(cached);
          return data;
        }
      } catch (_) {}
      return null;
    },

    updateUI() {
      const el1 = document.getElementById('module-count');
      const el2 = document.getElementById('query-count');
      if (el1) el1.textContent = 'модули: ' + this.registry.size;
      if (el2) el2.textContent = 'запросы: ' + this.queryCount;
    },
  };

  M.mm = MM;
  M.modules.monomode = MM;

  M.on('mm:ready', () => {
    const cached = MM.loadCache();
    if (cached) {
      console.log('[MONOMODE] кэш:', cached.version, cached.modules.length, 'модулей');
    }
    MM.cache();
  });
})(window.MONOMODE);