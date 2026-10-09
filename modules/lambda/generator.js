/**
 * modules/lambda/generator.js · Λ
 * Генератор текста: trigram → bigram → graph → memory → echo.
 * Стоп-слова. Ручной выбор стратегии.
 */
(function (M) {
  'use strict';

  const LIMITS = {
    minWords: 3,
    maxWords: 8,
    minWeight: 0.35,
  };

  // ─── стоп-слова (ru + en) ────────────────────────
  const STOP = new Set([
    'и', 'в', 'во', 'на', 'с', 'со', 'к', 'ко', 'о', 'об', 'за', 'из', 'по',
    'до', 'для', 'от', 'у', 'при', 'без', 'через', 'над', 'под', 'про',
    'что', 'как', 'это', 'этот', 'эта', 'эти', 'то', 'же', 'бы', 'ли', 'не',
    'ни', 'да', 'нет', 'но', 'а', 'или', 'если', 'чтобы', 'когда', 'где',
    'кто', 'чем', 'тем', 'так', 'вот', 'ну', 'уж', 'ли', 'бы',
    'он', 'она', 'оно', 'они', 'мы', 'вы', 'я', 'ты', 'его', 'её', 'их',
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'by',
    'for', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that',
    'it', 'he', 'she', 'they', 'we', 'you', 'i',
  ]);

  // ─── пользовательская стратегия ─────────────────
  let userStrategy = 'auto';

  const GEN = {
    last: null,
    total: 0,
    byStrategy: { trigram: 0, bigram: 0, graph: 0, memory: 0, echo: 0 },

    setStrategy(s) {
      if (['auto', 'graph', 'memory', 'echo', 'trigram', 'bigram'].includes(s)) {
        userStrategy = s;
        M.emit('mm:generator:strategy', { strategy: s });
      }
    },

    getStrategy() { return userStrategy; },

    // ─── главный вход ────────────────────────────────
    generate(input, opts = {}) {
      const raw = _extract(input);
      const words = raw.filter(w => !STOP.has(w));
      if (!words.length) return this._empty();

      const context = _lastContext(input);   // последние 2-3 значимых слова

      let next = [];
      let strategy = userStrategy;

      // ─── выбор маршрута ─────────────────────────────
      if (strategy === 'echo') {
        next = words.slice(0, LIMITS.maxWords);
      } else if (strategy === 'graph') {
        next = this._fromGraph(words);
      } else if (strategy === 'memory') {
        next = this._fromMemory(words);
      } else if (strategy === 'trigram') {
        next = this._fromSequences(context, 'tri');
      } else if (strategy === 'bigram') {
        next = this._fromSequences(context, 'bi');
      } else {
        // auto: trigram → bigram → graph → memory → echo
        next = this._fromSequences(context, 'tri');
        if (next.length < LIMITS.minWords) {
          const more = this._fromSequences(context, 'bi');
          next = next.concat(more);
        }
        if (next.length < LIMITS.minWords) {
          next = next.concat(this._fromGraph(words));
        }
        if (next.length < LIMITS.minWords) {
          next = next.concat(this._fromMemory(words));
        }
        if (next.length < LIMITS.minWords) {
          next = words.slice(0, LIMITS.maxWords);
          strategy = 'echo';
        }
      }

      const final = _unique(next).slice(0, LIMITS.maxWords);
      const detected = strategy === 'auto' ? this._detect(final, words, context) : strategy;

      const result = {
        input,
        context,
        words: final,
        text: final.join(' '),
        strategy: detected,
        ts: Date.now(),
      };
      this.last = result;
      this.total++;
      this.byStrategy[detected] = (this.byStrategy[detected] || 0) + 1;
      M.emit('mm:generator:produced', result);
      return result;
    },

    // ─── §trigram/bigram · по последовательностям ───
    _fromSequences(context, kind) {
      const out = [];
      const seen = new Set(context);
      let ctx = context.slice();

      for (let step = 0; step < LIMITS.maxWords; step++) {
        const next = M.graph?.nextByContext?.(ctx);
        if (!next) break;
        if (!seen.has(next)) { out.push(next); seen.add(next); }
        ctx = ctx.concat(next).slice(-3);
      }
      return out;
    },

    // ─── §graph · по связям ─────────────────────────
    _fromGraph(words) {
      const out = [];
      const seen = new Set(words);
      const candidates = [];

      for (const w of words) {
        const related = M.graph?.related?.(w, LIMITS.minWeight) || [];
        for (const r of related) {
          if (!seen.has(r.word) && !STOP.has(r.word)) {
            candidates.push(r);
          }
        }
      }
      // сортируем по весу
      candidates.sort((a, b) => b.weight - a.weight);
      for (const c of candidates) {
        if (!seen.has(c.word)) {
          out.push(c.word);
          seen.add(c.word);
          if (out.length >= LIMITS.maxWords) break;
        }
      }
      return out;
    },

    // ─── §memory · по trail ─────────────────────────
    _fromMemory(words) {
      const out = [];
      const seen = new Set(words);
      const trail = M.memory?.trail || [];
      for (let i = trail.length - 1; i >= 0; i--) {
        for (const w of trail[i].words || []) {
          if (!seen.has(w) && !STOP.has(w)) {
            out.push(w);
            seen.add(w);
            if (out.length >= LIMITS.maxWords) return out;
          }
        }
      }
      return out;
    },

    _detect(next, words, context) {
      if (!next.length) return 'echo';
      if (next.length >= LIMITS.minWords) return 'trigram';
      if (next.length >= 2) return 'bigram';
      if (next.length >= 1) return 'graph';
      return 'memory';
    },

    _empty() {
      return { input: '', words: [], text: '', strategy: 'empty', ts: Date.now() };
    },

    stats() {
      return {
        total: this.total,
        strategy: userStrategy,
        last_text: this.last?.text || null,
        last_strategy: this.last?.strategy || null,
        by_strategy: { ...this.byStrategy },
      };
    },
  };

  // ─── утилиты ──────────────────────────────────────
  function _extract(input) {
    return String(input || '')
      .toLowerCase()
      .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  function _lastContext(input) {
    return _extract(input).filter(w => !STOP.has(w)).slice(-3);
  }

  function _unique(arr) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      if (!seen.has(x)) { seen.add(x); out.push(x); }
    }
    return out;
  }

  // ─── экспорт утилит для UI ───────────────────────
  M.generator = GEN;
  M.generator.STOP = STOP;
  M.modules.generator = GEN;

  // ─── запуск по запросу конвейера ────────────────
  M.on('mm:generator:request', (e) => {
    const d = e.detail || {};
    if (!d.words || !d.words.length) return;
    GEN.generate(d.words.join(' '));
  });

  // фолбэк — если генератор не подписан выше
  M.on('mm:conveyer:result', (e) => {
    const d = e.detail || {};
    if (d.durability >= 0.15 && !M._genHandled) {
      GEN.generate(d.words.join(' '));
    }
  });

  console.log('[lambda] generator ready · trigram/bigram/graph/memory/echo');
})(window.MONOMODE);