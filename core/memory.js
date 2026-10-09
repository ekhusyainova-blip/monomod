/**
 * core/memory.js · Memory
 * Trail последних вводов. Лимит 110.
 */
(function (M) {
  'use strict';

  M.memory = {
    trail: [],
    maxSize: 110,

    record(words, dim, durability) {
      this.trail.push({
        words: Array.isArray(words) ? words : [words],
        dim,
        durability: +(+durability).toFixed(3),
        ts: Date.now(),
      });
      if (this.trail.length > this.maxSize) this.trail.shift();
    },

    last() { return this.trail[this.trail.length - 1] || null; },
    size() { return this.trail.length; },

    init() {
      const saved = localStorage.getItem('mm_trail');
      if (saved) {
        try { this.trail = JSON.parse(saved); }
        catch (_) { this.trail = []; }
      }
    },
    save() {
      try { localStorage.setItem('mm_trail', JSON.stringify(this.trail)); }
      catch (_) {}
    },

    clear() { this.trail = []; this.save(); },
  };

  M.modules.memory = M.memory;
})(window.MONOMODE);