(function (M) {
  /* ==========================================================================
     QUERY — обработка запросов ввода
     Различает «новая сфера» / обычный запрос. Прогоняет конвейер.
     Пишет в пространство текущего ID.
     ========================================================================== */

  const Query = {
    // --- очистка ------------------------------------------------------------
    clean(raw) {
      return String(raw || '').trim()
        .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
        .toLowerCase();
    },

    // --- разбор -------------------------------------------------------------
    parse(raw) {
      const cleaned = this.clean(raw);
      const words = cleaned.split(/\s+/).filter(w => w.length > 2);
      return { cleaned, words };
    },

    // --- прогон -------------------------------------------------------------
    async run(raw) {
      const cmd = String(raw || '').trim().toLowerCase();

      // команда: новая сфера
      if (cmd === 'новая сфера') {
        M.spheres.add(M.id.current());
        M.emit('mm:query:sphere', {});
        return { kind: 'sphere' };
      }

      // команда: экспорт
      if (cmd === 'экспорт') {
        M.emit('mm:query:export', {});
        return { kind: 'export' };
      }

      // обычный запрос — обучение
      const { words } = this.parse(raw);
      if (!words.length) return { kind: 'empty' };

      const id = M.id.current();

      // строим связи — как это делает база
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          M.learn.apply({ words: [words[i], words[j]], dim: '3D' }, id);
        }
      }

      // считаем прочность
      let tw = 0, lc = 0;
      const graph = new Map(M.core.graph(id));
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const key = [words[i], words[j]].sort().join('→');
          const link = graph.get(key);
          if (link) { tw += link.weight; lc++; }
        }
      }
      const durability = lc > 0 ? tw / lc : 0.2;

      // запись в trail текущей сферы
      const trail = M.core.trail(id);
      trail.push({ words, dim: '3D', durability: +durability.toFixed(3), ts: Date.now() });
      if (trail.length > 110) trail.shift();
      M.core.save(id, 'trail', trail);

      M.emit('mm:query:done', { id, words, durability });
      return { kind: 'learn', words, durability };
    },
  };

  M.query = Query;
  M.modules.query = Query;
})(window.MONOMODE);