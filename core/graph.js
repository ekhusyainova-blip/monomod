/**
 * core/graph.js · LINK_GRAPH
 * Граф слов. weight · count · decay.
 */
(function (M) {
  'use strict';

  M.graph = {
    edges: new Map(),

    // усилить связь между словами
    strengthen(w1, w2, dim) {
      const key = [w1, w2].sort().join('→');
      const link = this.edges.get(key) ||
        { weight: 0.3, dim, count: 0, lastUsed: Date.now() };
      link.weight = Math.min(1.0, link.weight * 1.05);
      link.count++;
      link.lastUsed = Date.now();
      this.edges.set(key, link);

      // шаблон при сильной связи
      if (link.count >= 3 && link.weight > 0.5) {
        M.archive?.tryCreate?.([w1, w2], dim, link.weight);
      }
      return link;
    },

    // затухание старых связей
    decay() {
      const now = Date.now();
      for (const [key, link] of this.edges) {
        const hours = (now - link.lastUsed) / 3600000;
        if (hours > 24) {
          link.weight *= 0.9;
          if (link.weight < 0.15) this.edges.delete(key);
        }
      }
    },

    // запрос по подстроке
    query(pattern) {
      const results = [];
      for (const [key, link] of this.edges) {
        if (key.includes(pattern)) results.push({ key, link });
      }
      return results;
    },

    // размер
    size() { return this.edges.size; },

    // init / save
    init() {
      const saved = localStorage.getItem('mm_graph');
      if (saved) {
        try { this.edges = new Map(JSON.parse(saved)); }
        catch (_) { this.edges = new Map(); }
      }
    },
    save() {
      try {
        localStorage.setItem('mm_graph',
          JSON.stringify(Array.from(this.edges.entries())));
      } catch (_) {}
    },

    // очистка
    clear() { this.edges = new Map(); this.save(); },
  };

  M.modules.graph = M.graph;
})(window.MONOMODE);