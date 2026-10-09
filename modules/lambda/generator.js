/**
 * modules/lambda/generator.js · Λ
 * Генератор текста из LINK_GRAPH и Memory.
 * Три стратегии: прямая, через шаблон, через память.
 */
(function (M) {
  'use strict';

  const LIMITS = {
    minWords: 3,
    maxWords: 7,
    minWeight: 0.35,
    maxAttempts: 32,
  };

  const GEN = {
    last: null,
    total: 0,

    // ─── главный вход ─────────────────────────────────
    generate(input, opts = {}) {
      const words = _extractWords(input);
      if (!words.length) return this._empty();

      // 1 · ищем связанные слова в графе
      let next = this._fromGraph(words);

      // 2 · если граф пуст — используем память
      if (next.length < LIMITS.minWords) {
        const mem = this._fromMemory(words);
        next = next.concat(mem);
      }

      // 3 · если совсем пусто — возвращаем слова ввода
      if (next.length < LIMITS.minWords) {
        next = words.slice(0, LIMITS.maxWords);
      }

      // схлопнуть до maxWords, убрать повторы, сохранить порядок
      const final = _unique(next).slice(0, LIMITS.maxWords);

      const result = {
        input,
        words: final,
        text: final.join(' '),
        strategy: opts.strategy || this._strategy(next, words),
        ts: Date.now(),
      };
      this.last = result;
      this.total++;
      M.emit('mm:generator:produced', result);
      return result;
    },

    // ─── стратегия 1 · из графа ──────────────────────
    _fromGraph(words) {
      const out = [];
      const seen = new Set(words);

      for (const w of words) {
        // все исходящие связи
        const links = [];
        for (const [key, link] of M.graph.edges) {
          const parts = key.split('→');
          if (parts.includes(w) && link.weight >= LIMITS.minWeight) {
            const other = parts[0] === w ? parts[1] : parts[0];
            links.push({ word: other, weight: link.weight });
          }
        }
        // сортируем по весу, берём лучшую
        links.sort((a, b) => b.weight - a.weight);
        for (const { word } of links) {
          if (!seen.has(word)) {
            out.push(word);
            seen.add(word);
            if (out.length >= LIMITS.maxWords) return out;
          }
        }
      }
      return out;
    },

    // ─── стратегия 2 · из памяти ─────────────────────
    _fromMemory(words) {
      const out = [];
      const seen = new Set(words);
      const trail = M.memory.trail.slice(-20);
      for (let i = trail.length - 1; i >= 0; i--) {
        for (const w of trail[i].words || []) {
          if (!seen.has(w)) {
            out.push(w);
            seen.add(w);
            if (out.length >= LIMITS.maxWords) return out;
          }
        }
      }
      return out;
    },

    // ─── стратегия · диагностика ─────────────────────
    _strategy(next, words) {
      if (next.length === 0) return 'echo';
      if (next.length >= LIMITS.minWords) return 'graph';
      return 'memory';
    },

    _empty() {
      return { input: '', words: [], text: '', strategy: 'empty', ts: Date.now() };
    },

    // ─── утилита ─────────────────────────────────────
    stats() {
      return {
        total: this.total,
        last_text: this.last?.text || null,
        last_strategy: this.last?.strategy || null,
      };
    },
  };

  function _extractWords(input) {
    return String(input || '')
      .toLowerCase()
      .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  function _unique(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      if (!seen.has(x)) { seen.add(x); out.push(x); }
    }
    return out;
  }

  M.generator = GEN;
  M.modules.generator = GEN;

  // ─── реакция на завершение конвейера ─────────────
  - M.on('mm:conveyer:result', (e) => {
-   const d = e.detail || {};
-   if (!d.words || !d.words.length) return;
-   if (d.durability >= 0.15) {
-     GEN.generate(d.words.join(' '));
-   }
- });
+ M.on('mm:generator:request', (e) => {
+   const d = e.detail || {};
+   if (!d.words || !d.words.length) return;
+   GEN.generate(d.words.join(' '));
+ });

  console.log('[lambda] generator ready');
})(window.MONOMODE);