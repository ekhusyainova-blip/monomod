(function (M) {
  /* ==========================================================================
     MM-QUERY — запись в граф и запуск конвейера
     Слушает mm:graph:input, пишет в localStorage, зовёт transition.
     ========================================================================== */

  const Query = {

    // -----------------------------------------------------------------------
    // запись в LINK_GRAPH (mm_graph)
    // -----------------------------------------------------------------------
    writeGraph(words) {
      let map;
      try {
        map = new Map(JSON.parse(localStorage.getItem('mm_graph') || '[]'));
      } catch {
        map = new Map();
      }

      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const key = [words[i], words[j]].sort().join('→');
          const link = map.get(key) || {
            weight: 0.3, dim: '3D', count: 0, lastUsed: Date.now(),
          };
          link.weight = Math.min(1.0, link.weight * 1.05);
          link.count++;
          link.lastUsed = Date.now();
          map.set(key, link);
        }
      }

      localStorage.setItem('mm_graph', JSON.stringify(Array.from(map.entries())));
    },

    // -----------------------------------------------------------------------
    // запись в память (mm_trail)
    // -----------------------------------------------------------------------
    writeTrail(words) {
      let trail;
      try {
        trail = JSON.parse(localStorage.getItem('mm_trail') || '[]');
      } catch {
        trail = [];
      }
      trail.push({
        words, dim: '3D', durability: 0.5, ts: Date.now(),
      });
      if (trail.length > 110) trail.shift();
      localStorage.setItem('mm_trail', JSON.stringify(trail));
    },

    // -----------------------------------------------------------------------
    // запуск конвейера базы (если есть)
    // -----------------------------------------------------------------------
    runConveyor() {
      if (typeof transition !== 'function') return;
      transition('P3');
      setTimeout(() => transition('P10'), 800);
      setTimeout(() => transition('P0'), 2000);
    },

    // -----------------------------------------------------------------------
    // главный обработчик
    // -----------------------------------------------------------------------
    handle(value) {
      const cleaned = String(value || '').trim()
        .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
        .toLowerCase();
      const words = cleaned.split(/\s+/).filter(w => w.length > 2);
      if (!words.length) return;

      this.writeGraph(words);
      this.writeTrail(words);

      // запустить визуальную фазу
      this.runConveyor();

      M.emit('mm:graph:done', { words });
    },
  };

  M.query = Query;
  M.modules.query = Query;

  // слушаем ввод
  M.on('mm:graph:input', (e) => Query.handle(e.detail.value));
})(window.MONOMODE);