(function (M) {
  /* ==========================================================================
     MM-INPUT — перехват Enter
     Не блокирует базу. Эмитит событие и пропускает дальше.
     ========================================================================== */

  function attach() {
    const input = document.getElementById('user-input');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const value = input.value.trim();
      if (!value) return;

      // эмитим — MONOMODE решает, что делать
      M.emit('mm:graph:input', { value });

      // НЕ вызываем preventDefault и stopPropagation —
      // база MONOMOD получает Enter и запускает свой конвейер.
    });
  }

  M.on('mm:ready', attach);
})(window.MONOMODE);