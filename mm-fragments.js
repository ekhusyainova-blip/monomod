(function (M) {
  /* ==========================================================================
     FRAGMENTS — граф связей между файлами и фрагментами
     Принцип тот же, что LINK_GRAPH: strengthen / decay / remove / discover.
     ========================================================================== */

  const KEY = 'mm_fragment_graph';
  const THRESHOLD_DELETE = 0.15;
  const THRESHOLD_DISCOVER = 0.3;
  const DECAY_HOURS = 24;
  const DECAY_RATE = 0.9;
  const STRENGTHEN_RATE = 1.05;

  const Fragments = {
    edges: new Map(),      // key: "a→b" → { weight, count, lastUsed, discovered }
    known: new Set(),      // известные фрагменты

    // --- инициализация -----------------------------------------------------
    init() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const data = JSON.parse(raw);
          this.edges = new Map(data.edges || []);
          this.known = new Set(data.known || []);
        }
      } catch { this.edges = new Map(); this.known = new Set(); }

      // авторегистрация уже загруженных модулей
      for (const name of M.loaded) this.register(name, 'module');

      // реакция на загрузку новых
      M.on('mm:module:loaded', (e) => this.register(e.detail.name, 'module'));
      M.on('mm:module:failed', (e) => this.unregister(e.detail.name));

      // фрагменты могут регистрироваться сами
      M.on('mm:fragment:add',    (e) => this.register(e.detail.id, e.detail.kind || 'fragment'));
      M.on('mm:fragment:remove', (e) => this.unregister(e.detail.id));
      M.on('mm:fragment:link',   (e) => this.link(e.detail.a, e.detail.b, e.detail.reason));

      // затухание раз в час
      setInterval(() => this.decay(), 60 * 60 * 1000);
    },

    // --- регистрация -------------------------------------------------------
    register(id, kind) {
      if (!id || this.known.has(id)) return;
      this.known.add(id);
      M.emit('mm:fragment:registered', { id, kind });
      this.save();
    },

    unregister(id) {
      if (!this.known.has(id)) return;
      this.known.delete(id);
      // удаляем все рёбра, связанные с фрагментом
      for (const [k] of this.edges) {
        if (k.includes(id)) {
          this.edges.delete(k);
          M.emit('mm:fragment:link:removed', { key: k, reason: 'fragment-removed' });
        }
      }
      this.save();
    },

    // --- рёбра -------------------------------------------------------------
    key(a, b) { return [a, b].sort().join('→'); },

    link(a, b, reason) {
      if (!a || !b || a === b) return;
      this.register(a, 'auto');
      this.register(b, 'auto');

      const k = this.key(a, b);
      const link = this.edges.get(k) || {
        weight: 0.3, count: 0, reason: reason || 'auto',
        lastUsed: Date.now(), discovered: false,
      };
      link.weight = Math.min(1.0, link.weight * STRENGTHEN_RATE);
      link.count++;
      link.lastUsed = Date.now();
      if (reason) link.reason = reason;

      if (!link.discovered && link.weight > THRESHOLD_DISCOVER) {
        link.discovered = true;
        M.emit('mm:fragment:link:discovered', { a, b, weight: link.weight });
      }

      this.edges.set(k, link);
      this.save();
      M.emit('mm:fragment:link:strengthen', { a, b, weight: link.weight });
    },

    unlink(a, b) {
      const k = this.key(a, b);
      if (this.edges.delete(k)) {
        this.save();
        M.emit('mm:fragment:link:removed', { key: k, reason: 'manual' });
      }
    },

    weight(a, b) {
      const l = this.edges.get(this.key(a, b));
      return l ? l.weight : 0;
    },

    neighbors(id) {
      const out = [];
      for (const [k, l] of this.edges) {
        const [a, b] = k.split('→');
        if (a === id) out.push({ id: b, weight: l.weight });
        if (b === id) out.push({ id: a, weight: l.weight });
      }
      return out;
    },

    // --- затухание (как в LINK_GRAPH) --------------------------------------
    decay() {
      const now = Date.now();
      let changed = false;
      for (const [k, l] of this.edges) {
        const hours = (now - l.lastUsed) / 3600000;
        if (hours > DECAY_HOURS) {
          l.weight *= DECAY_RATE;
          changed = true;
          if (l.weight < THRESHOLD_DELETE) {
            this.edges.delete(k);
            M.emit('mm:fragment:link:removed', { key: k, reason: 'decay' });
          }
        }
      }
      if (changed) this.save();
    },

    // --- ревизия: восстановить или удалить ---------------------------------
    audit() {
      for (const [k, l] of this.edges) {
        if (l.weight < THRESHOLD_DELETE) {
          this.edges.delete(k);
          M.emit('mm:fragment:link:removed', { key: k, reason: 'audit' });
        } else if (!l.discovered && l.weight > THRESHOLD_DISCOVER) {
          l.discovered = true;
          M.emit('mm:fragment:link:discovered', { key: k });
        }
      }
      this.save();
    },

    save() {
      localStorage.setItem(KEY, JSON.stringify({
        edges: Array.from(this.edges.entries()),
        known: Array.from(this.known),
      }));
    },

    all() {
      return Array.from(this.edges.entries()).map(([k, v]) => ({ key: k, ...v }));
    },
  };

  M.fragments = Fragments;
  M.modules.fragments = Fragments;
  M.on('mm:ready', () => Fragments.init());
})(window.MONOMODE);