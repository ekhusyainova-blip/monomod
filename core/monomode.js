/**
 * core/monomode.js · CANON 9.0.0
 * MONOMODE · спираль · активация шаблонов · реестр модулей.
 */
(function (M) {
  'use strict';

  // ─── MONOMODE ───
  M.mm = {
    version: '9.0.0',
    queryCount: 0,
    spiralLevel: 0,

    // ─── регистрация ───
    registerModule(name, module) {
      M.modules.set(name, module);
      this.updateUI();
      M.emit('mm:module:registered', { name });
      return module;
    },

    get(name) { return M.modules.get(name); },
    list() { return Array.from(M.modules.keys()); },

    // ─── обратный вызов MONOMODE → MONOMOD ───
    queryMonomod(type, pattern) {
      this.queryCount++;
      this.updateUI();

      if (type === 'graph')    return M.graph?.query(pattern) || [];
      if (type === 'template') return M.archive?.query(pattern) || [];
      if (type === 'memory')   return M.memory?.trail.filter(t =>
        t.words?.some?.(w => w.includes(pattern))) || [];
      return [];
    },

    // ═════════════════════════════════════════════════════
    // АКТИВАЦИЯ ШАБЛОНОВ (интерпретация action)
    // ═════════════════════════════════════════════════════
    activateTemplates(input) {
      const words = String(input || '')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2);
      const activated = [];

      for (const [id, template] of M.archive.archive) {
        const intersection = template.words.filter(w => words.includes(w));
        if (intersection.length > 0 && template.action) {
          activated.push(template);
          this.executeAction(template);
        }
      }
      return activated;
    },

    executeAction(template) {
      M.emit('mm:action:before', { action: template.action, template });

      switch (template.action) {
        case 'spiral_next':  this.spiralNext(); break;
        case 'compress':     this.compress(); break;
        case 'unfold':       this.unfold(template.target); break;
        case 'meta_level':   this.setMetaLevel(template.level); break;
      }

      M.emit('mm:action:executed', { action: template.action, template });
    },

    // ═════════════════════════════════════════════════════
    // СПИРАЛЬ · S(n+1) = Φ(S(n) ⊕ Δ(n))
    // ═════════════════════════════════════════════════════
    spiralNext() {
      this.spiralLevel++;
      M.emit('mm:spiral:next', { level: this.spiralLevel });

      const compressed = this.compress();

      M.archive?.tryCreate?.(
        ['spiral', `L${this.spiralLevel}`, 'compressed'],
        'meta',
        1.0
      );

      return { level: this.spiralLevel, compressed };
    },

    compress() {
      const pack = this.get('pack');
      if (pack) {
        const seed = pack.compress();
        M.emit('mm:compress', { seed });
        return seed;
      }
      return null;
    },

    unfold(seed) {
      M.emit('mm:unfold', { seed });
      return seed;
    },

    setMetaLevel(level) {
      this.spiralLevel = +level || 0;
      M.emit('mm:meta:level', { level: this.spiralLevel });
      this.updateUI();
    },

    // ─── проверка замкнутости ───
    checkClosure() {
      const edges = M.graph?.edges?.size || 0;
      const weights = Array.from(M.graph?.edges?.values?.() || []).map(l => l.weight);
      const topWeight = weights.length ? Math.max(...weights) : 0;

      if (edges > 50 && topWeight > 0.9) {
        M.emit('mm:closure', { edges, topWeight });
        this.spiralNext();
        return true;
      }
      return false;
    },

    // ─── UI ───
    updateUI() {
      const m = document.getElementById('module-count');
      const q = document.getElementById('query-count');
      const r = document.getElementById('role-display');
      if (m) m.textContent = 'модули: ' + M.modules.size;
      if (q) q.textContent = 'запросы: ' + this.queryCount;
      if (r) r.textContent =
        `Ψ:MONOMOD · Ω:MONOMODE · Λ:QUERY · L${this.spiralLevel}`;
    },

    // ─── кэш ───
    cache() {
      try {
        localStorage.setItem('mm_monomode_cache', JSON.stringify({
          version: this.version,
          modules: this.list(),
          spiralLevel: this.spiralLevel,
          ts: Date.now(),
        }));
      } catch (_) {}
    },

    loadCache() {
      try {
        const c = localStorage.getItem('mm_monomode_cache');
        if (!c) return null;
        const d = JSON.parse(c);
        this.spiralLevel = d.spiralLevel || 0;
        return d;
      } catch (_) { return null; }
    },

    // ─── init ───
    init() {
      const cached = this.loadCache();
      if (cached) {
        console.log('[MONOMODE] кэш:', cached.version, cached.modules.length, 'модулей');
      }
      this.updateUI();
      this.cache();
    },
  };

  // ─── обратная совместимость: MONOMODE.method === M.mm.method ───
  // (если кто-то обращается напрямую через window.MONOMODE)
  const MM = M.mm;
  M.registerModule = (n, mod) => MM.registerModule(n, mod);
  M.queryMonomod = (t, p) => MM.queryMonomod(t, p);
  M.activateTemplates = (i) => MM.activateTemplates(i);
  M.executeAction = (t) => MM.executeAction(t);
  M.spiralNext = () => MM.spiralNext();
  M.compress = () => MM.compress();
  M.unfold = (s) => MM.unfold(s);
  M.setMetaLevel = (l) => MM.setMetaLevel(l);
  M.checkClosure = () => MM.checkClosure();

  // getter/setter для spiralLevel
  Object.defineProperty(M, 'spiralLevel', {
    get() { return MM.spiralLevel; },
    set(v) { MM.spiralLevel = v; },
  });

  M.modules_monomode = MM;

  M.on('mm:ready', () => MM.init());
  console.log('[core] monomode ready');
})(window.MONOMODE);