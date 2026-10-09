/**
 * core/snapshot.js · CANON 9.0.0
 * Снимок состояния: graph + memory + archive → JSON.
 * Только чтение. Не меняет источник.
 */
(function (M) {
  'use strict';

  const S = {
    // собрать снимок
    take() {
      return {
        id: 'SNP-' + Math.abs(Date.now()).toString(16).slice(-8),
        ts: Date.now(),
        version: '9.0.0',
        graph: {
          edges: M.graph.edges.size,
          sequences: M.graph.seqSize?.() || { bi: 0, tri: 0 },
          data: Array.from(M.graph.edges.entries()),
        },
        archive: {
          size: M.archive.archive.size,
          ids: Array.from(M.archive.archive.keys()),
        },
        memory: {
          size: M.memory.trail.length,
          last: M.memory.trail[M.memory.trail.length - 1] || null,
        },
      };
    },

    // применить снимок (только graph)
    apply(snap) {
      if (!snap || !snap.graph || !Array.isArray(snap.graph.data)) return false;
      try {
        M.graph.edges = new Map(snap.graph.data);
        M.graph.save();
        M.emit('mm:snapshot:applied', { id: snap.id, ts: snap.ts });
        return true;
      } catch (_) {
        return false;
      }
    },

    // размер в символах JSON
    size() {
      return JSON.stringify(this.take()).length;
    },
  };
  
  M.on('mm:ready', () => {
  // авто-снимок при закрытии страницы
  window.addEventListener('beforeunload', () => {
    const s = S.take();
    localStorage.setItem('mm_snapshot_last', JSON.stringify(s));
  });

  // авто-снимок при рождении шаблона
  M.on('mm:archive:created', () => {
    const s = S.take();
    localStorage.setItem('mm_snapshot_last', JSON.stringify(s));
  });

  // авто-восстановление при загрузке (если есть)
  const saved = localStorage.getItem('mm_snapshot_last');
  if (saved) {
    try {
      const snap = JSON.parse(saved);
      if (snap.graph?.data) {
        S.apply(snap);
        console.log('[core] snapshot restored:', snap.id);
      }
    } catch (_) {}
  }
});

  M.snapshot = S;
  M.modules.snapshot = S;

  M.on('mm:ready', () => console.log('[core] snapshot ready'));
})(window.MONOMODE);