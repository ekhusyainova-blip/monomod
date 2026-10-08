(function (M) {
  function attach() {
    const input = document.getElementById('user-input');
    if (!input) return;

    input.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter') return;
      const value = input.value.trim();
      if (!value) return;

      e.preventDefault();
      e.stopPropagation();
      input.value = '';

      // всё — через LINK_GRAPH
      M.emit('mm:graph:input', { value });
    }, true);
  }

  M.on('mm:ready', attach);
})(window.MONOMODE);