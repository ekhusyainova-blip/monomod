(function (M) {
  M.on('mm:ready', () => {
    const i = document.getElementById('user-input');
    if (!i) return;
    i.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && i.value.trim().toLowerCase() === 'новая сфера') {
        e.preventDefault(); e.stopPropagation();
        M.spheres.add(M.id.current());
        i.value = '';
      }
    }, true);
  });
})(window.MONOMODE);