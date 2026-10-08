(function (M) {
  /* ==========================================================================
     MM-UI — интерфейс
     Показывает поле ввода. Ничего больше.
     ========================================================================== */

  const UI = {
    showInput() {
      const area = document.getElementById('input-area');
      if (area) area.classList.add('visible');
      const input = document.getElementById('user-input');
      if (input) input.focus();
    },

    refresh() {
      this.showInput();
    },
  };

  M.ui = UI;
  M.modules.ui = UI;

  M.on('mm:ready', () => UI.showInput());
  M.on('mm:graph:done', () => UI.showInput());
})(window.MONOMODE);