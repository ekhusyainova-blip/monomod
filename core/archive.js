/**
 * core/archive.js · TemplateArchive
 * Шаблоны из сильных связей. TPL-xxxxxxxx.
 */
(function (M) {
  'use strict';

  M.archive = {
    archive: new Map(),

    generateId(words) {
      const str = words.slice().sort().join('|').toLowerCase();
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return 'TPL-' + Math.abs(h).toString(16).padStart(8, '0').slice(0, 8);
    },

    tryCreate(words, dim, weight) {
      const id = this.generateId(words);
      if (this.archive.has(id)) {
        const t = this.archive.get(id);
        t.lastUsed = Date.now();
        t.usageCount++;
        return t;
      }
      const t = {
        id,
        words: words.slice().sort(),
        dim,
        weight: +weight.toFixed(3),
        created: Date.now(),
        lastUsed: Date.now(),
        usageCount: 1,
      };
      this.archive.set(id, t);
      this.save();
      M.emit('mm:archive:created', t);
      return t;
    },

    query(pattern) {
      const results = [];
      for (const [id, t] of this.archive) {
        if (t.words.some(w => w.includes(pattern))) results.push(t);
      }
      return results;
    },

    size() { return this.archive.size; },

    init() {
      const saved = localStorage.getItem('mm_templates');
      if (saved) {
        try { this.archive = new Map(JSON.parse(saved)); }
        catch (_) { this.archive = new Map(); }
      }
    },
    save() {
      try {
        localStorage.setItem('mm_templates',
          JSON.stringify(Array.from(this.archive.entries())));
      } catch (_) {}
    },

    clear() { this.archive = new Map(); this.save(); },
  };

  M.modules.archive = M.archive;
})(window.MONOMODE);