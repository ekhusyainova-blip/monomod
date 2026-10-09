/**
 * core/graph.js · LINK_GRAPH
 * Граф слов: weight · count · decay.
 * + sequences: bigrams и trigrams.
 */
(function (M) {
  'use strict';

  const SEQ_LIMIT = 512;

  M.graph = {
    edges: new Map(),
    sequences: {
      bi:  new Map(),   // "w1|w2"      → Map(w3 → count)
      tri: new Map(),   // "w1|w2|w3"   → Map(w4 → count)
    },

    // ─── усилие парной связи (все пары) ─────────────
    strengthen(w1, w2, dim) {
      const key = [w1, w2].sort().join('→');
      const link = this.edges.get(key) ||
        { weight: 0.3, dim, count: 0, lastUsed: Date.now() };
      link.weight = Math.min(1.0, link.weight * 1.05);
      link.count++;
      link.lastUsed = Date.now();
      this.edges.set(key, link);

      if (link.count >= 3 && link.weight > 0.5) {
        M.archive?.tryCreate?.([w1, w2], dim, link.weight);
      }
      return link;
    },

    // ─── §bigram · последовательная пара ────────────
    observeSequence(w1, w2) {
      if (!w1 || !w2 || w1 === w2) return;
      const key = `${w1}|${w2}`;
      let inner = this.sequences.bi.get(key);
      if (!inner) { inner = new Map(); this.sequences.bi.set(key, inner); }
      inner.set(w2, (inner.get(w2) || 0) + 1);
      this._trimInner(this.sequences.bi, key, inner);
    },

    // ─── §trigram · последовательная тройка ─────────
    observeTriple(w1, w2, w3) {
      if (!w1 || !w2 || !w3) return;
      const key = `${w1}|${w2}|${w3}`;
      let inner = this.sequences.tri.get(key);
      if (!inner) { inner = new Map(); this.sequences.tri.set(key, inner); }
      inner.set(w3, (inner.get(w3) || 0) + 1);
      this._trimInner(this.sequences.tri, key, inner);
    },

    _trimInner(map, key, inner) {
      if (map.size > SEQ_LIMIT) {
        // удаляем самый старый ключ
        const first = map.keys().next().value;
        if (first !== key) map.delete(first);
      }
    },

    // ─── §next · следующий токен по контексту ──────
    // ctx — массив последних слов
    nextByContext(ctx) {
      if (!Array.isArray(ctx) || !ctx.length) return null;

      // 1 · триграмма: последние 3 → ищем 4-е
      if (ctx.length >= 3) {
        const [a, b, c] = ctx.slice(-3);
        const inner = this.sequences.tri.get(`${a}|${b}|${c}`);
        if (inner && inner.size) {
          return _pickBest(inner);
        }
      }

      // 2 · биграмма: последние 2 → ищем 3-е
      if (ctx.length >= 2) {
        const [a, b] = ctx.slice(-2);
        const inner = this.sequences.bi.get(`${a}|${b}`);
        if (inner && inner.size) {
          return _pickBest(inner);
        }
      }

      // 3 · граф: любая связь с последним словом
      const last = ctx[ctx.length - 1];
      const links = [];
      for (const [key, link] of this.edges) {
        const parts = key.split('→');
        if (parts.includes(last) && link.weight >= 0.35) {
          const other = parts[0] === last ? parts[1] : parts[0];
          links.push({ word: other, weight: link.weight });
        }
      }
      links.sort((a, b) => b.weight - a.weight);
      return links[0]?.word || null;
    },

    // ─── затухание ───────────────────────────────────
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

    // ─── запросы ─────────────────────────────────────
    query(pattern) {
      const out = [];
      for (const [key, link] of this.edges) {
        if (key.includes(pattern)) out.push({ key, link });
      }
      return out;
    },

    related(word, minWeight = 0.35) {
      const out = [];
      for (const [key, link] of this.edges) {
        const parts = key.split('→');
        if (parts.includes(word) && link.weight >= minWeight) {
          const other = parts[0] === word ? parts[1] : parts[0];
          out.push({ word: other, weight: link.weight });
        }
      }
      out.sort((a, b) => b.weight - a.weight);
      return out;
    },

    size() { return this.edges.size; },
    seqSize() {
      return { bi: this.sequences.bi.size, tri: this.sequences.tri.size };
    },

    // ─── init / save ─────────────────────────────────
    init() {
      try {
        const g = localStorage.getItem('mm_graph');
        if (g) this.edges = new Map(JSON.parse(g));
        const s = localStorage.getItem('mm_seq');
        if (s) {
          const d = JSON.parse(s);
          this.sequences.bi = new Map(
            (d.bi || []).map(([k, arr]) => [k, new Map(arr)])
          );
          this.sequences.tri = new Map(
            (d.tri || []).map(([k, arr]) => [k, new Map(arr)])
          );
        }
      } catch (_) {}
    },

    save() {
      try {
        localStorage.setItem('mm_graph',
          JSON.stringify(Array.from(this.edges.entries())));
        localStorage.setItem('mm_seq', JSON.stringify({
          bi: Array.from(this.sequences.bi.entries())
            .map(([k, m]) => [k, Array.from(m.entries())]),
          tri: Array.from(this.sequences.tri.entries())
            .map(([k, m]) => [k, Array.from(m.entries())]),
        }));
      } catch (_) {}
    },

    clear() {
      this.edges = new Map();
      this.sequences.bi = new Map();
      this.sequences.tri = new Map();
      this.save();
    },
  };

  function _pickBest(inner) {
    let bestWord = null;
    let bestCount = 0;
    for (const [w, c] of inner) {
      if (c > bestCount) { bestWord = w; bestCount = c; }
    }
    return bestWord;
  }

  M.modules.graph = M.graph;
})(window.MONOMODE);