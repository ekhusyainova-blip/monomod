(function (M) {
  /* ==========================================================================
     LINKS — родословная между сферами
     Работает как LINK_GRAPH в MONOMOD: усиливается, затухает, удаляется.
     ========================================================================== */

  const KEY = 'mm_sphere_links';
  const THRESHOLD_DELETE = 0.15;
  const THRESHOLD_DISCOVER = 0.3;
  const DECAY_HOURS = 24;
  const DECAY_RATE = 0.9;
  const STRENGTHEN_RATE = 1.05;

  const Links = {
    edges: new Map(),  // key = [parentId, childId].sort().join('→')

    // --- инициализация -----------------------------------------------------
    init() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) this.edges = new Map(JSON.parse(raw));
      } catch { this.edges = new Map(); }

      // строим базовые рёбра из существующей родословной
      this.seedFromLineage();
    },

    seedFromLineage() {
      for (const c of M.id.children()) {
        if (c.parent) {
          this.ensure(c.parent, c.id);
        }
      }
      this.save();
    },

    key(a, b) {
      return [a, b].sort().join('→');
    },

    // --- усиление (как LINK_GRAPH.strengthen) ------------------------------
    strengthen(a, b, reason) {
      const k = this.key(a, b);
      const link = this.edges.get(k) || {
        weight: 0.3,
        count: 0,
        reason: reason || 'lineage',
        lastUsed: Date.now(),
        discovered: false,
      };
      link.weight = Math.min(1.0, link.weight * STRENGTHEN_RATE);
      link.count++;
      link.lastUsed = Date.now();
      if (reason) link.reason = reason;

      // обнаружение: связь вернулась
      if (link.discovered === false && link.weight > THRESHOLD_DISCOVER) {
        link.discovered = true;
        M.emit('mm:link:discovered', { a, b, weight: link.weight });
      }

      this.edges.set(k, link);
      this.save();
      M.emit('mm:link:strengthen', { a, b, weight: link.weight });
      return link;
    },

    ensure(a, b) {
      if (!a || !b) return;
      const k = this.key(a, b);
      if (!this.edges.has(k)) {
        this.edges.set(k, {
          weight: 0.3, count: 0, reason: 'lineage',
          lastUsed: Date.now(), discovered: true,
        });
      }
    },

    // --- затухание (как LINK_GRAPH.decay) ----------------------------------
    decay() {
      const now = Date.now();
      let changed = false;
      for (const [k, link] of this.edges) {
        const hours = (now - link.lastUsed) / 3600000;
        if (hours > DECAY_HOURS) {
          link.weight *= DECAY_RATE;
          changed = true;
          if (link.weight < THRESHOLD_DELETE) {
            this.edges.delete(k);
            M.emit('mm:link:removed', { key: k });
          }
        }
      }
      if (changed) this.save();
    },

    // --- запросы -----------------------------------------------------------
    parents(id) {
      return M.id.lineage(id).slice(0, -1);
    },
    children(id) {
      return M.id.children().filter(c => c.parent === id).map(c => c.id);
    },
    all() {
      return Array.from(this.edges.entries()).map(([k, v]) => ({ key: k, ...v }));
    },
    weight(a, b) {
      const l = this.edges.get(this.key(a, b));
      return l ? l.weight : 0;
    },
    isWeak(a, b) {
      return this.weight(a, b) < THRESHOLD_DELETE;
    },

    save() {
      localStorage.setItem(KEY, JSON.stringify(Array.from(this.edges.entries())));
    },

    // --- реакция на события ------------------------------------------------
    hook() {
      // усиление при переключении
      M.on('mm:sphere:switch', (e) => {
        const id = e.detail.id;
        const lineage = M.id.lineage(id);
        for (let i = 0; i < lineage.length - 1; i++) {
          this.strengthen(lineage[i], lineage[i + 1], 'switch');
        }
      });

      // усиление при создании
      M.on('mm:sphere:add', (e) => {
        this.strengthen(e.detail.parent, e.detail.id, 'create');
      });

      // усиление при обучении (обмен с родителем)
      M.on('mm:core:reload', (e) => {
        const id = e.detail.id;
        const parent = M.id.children().find(c => c.id === id)?.parent;
        if (parent) this.strengthen(parent, id, 'learn');
      });

      // периодическое затухание
      setInterval(() => this.decay(), 60 * 60 * 1000);
      M.emit('mm:links:ready', { count: this.edges.size });
    },
  };

  M.links = Links;
  M.modules.links = Links;
  M.on('mm:ready', () => { Links.init(); Links.hook(); });
})(window.MONOMODE);