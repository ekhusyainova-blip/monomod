/**
 * modules/omega/pack.js · Ω
 * Сжатие состояния в SEED-xxxxx.
 */
(function (M) {
  'use strict';

  M.pack = {
    compress() {
      const topEdges = Array.from(M.graph.edges.entries())
        .sort((a, b) => b[1].weight - a[1].weight)
        .slice(0, 8)
        .map(e => e[0])
        .join(',');
      let hash = 0;
      for (let i = 0; i < topEdges.length; i++) {
        hash = ((hash << 5) - hash) + topEdges.charCodeAt(i);
        hash |= 0;
      }
      return 'SEED-' + Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    },
  };

  M.mm?.registerModule?.('pack', M.pack);
})(window.MONOMODE);