(function (M) {
  /* ==========================================================================
     INPUT — перехват ввода
     «новая сфера» — создаёт сферу.
     Всё остальное — уходит в Query.
     ========================================================================== */

  function attach() {
    const input = document.getElementById('user-input');
    if (!input) return;

    input.addEventListener('keydown', async (e) => {
      if (e.key !== 'Enter') return;
      const value = input.value.trim();
      if (!value) return;

      e.preventDefault();
      e.stopPropagation();

      // визуальный отклик
      M.emit('mm:input:start', { value });
      input.value = '';

      // прогон
      const result = await M.query.run(value);

      // визуальный отклик
      if (result.kind === 'sphere') {
        M.emit('mm:input:sphere', result);
      } else if (result.kind === 'learn') {
        M.emit('mm:input:learn', result);
      } else if (result.kind === 'empty') {
        M.emit('mm:input:empty', {});
      }
    }, true); // capture — до базового обработчика
  }

  M.on('mm:ready', attach);
})(window.MONOMODE);