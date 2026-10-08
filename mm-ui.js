(function (M) {
  const UI = {

    // UI — не фиксирован. Управляется через LINK_GRAPH.
    apply(directive) {
      M.emit('mm:linkgraph:ui', directive);
    },

    refresh() {
      M.emit('mm:linkgraph:ui:refresh', {});
    },
  };

  M.ui = UI;
  M.modules.ui = UI;

  M.on('mm:linkgraph:ui:refresh', () => UI.apply({}));
})(window.MONOMODE);