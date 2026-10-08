(function (M) {
  const Query = {

    // ввод уходит в граф
    run(value) {
      M.emit('mm:graph:input', { value });
    },

    // ответ — из графа
    respond(text, meta) {
      M.emit('mm:graph:response', { text, meta });
    },

    // молчание — тоже из графа
    silence(reason) {
      M.emit('mm:graph:silence', { reason });
    },
  };

  M.query = Query;
  M.modules.query = Query;

  M.on('mm:graph:input', (e) => {
    // маршрут: в LINK_GRAPH
    M.emit('mm:linkgraph:write', { value: e.detail.value });
  });
})(window.MONOMODE);