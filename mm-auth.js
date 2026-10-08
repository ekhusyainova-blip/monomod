(function (M) {
  const Auth = {
    check() {
      const incoming = new URLSearchParams(location.search).get('id');
      if (incoming && /^MID-[0-9a-f]{32}$/.test(incoming)) {
        M.id.setCurrent(incoming);
        return true;
      }
      if (!localStorage.getItem(M.id.KEY_ROOT)) {
        M.id.root(); M.id.setCurrent(M.id.root());
        return true;
      }
      return M.id.isAuthorized();
    },
    prompt() { M.emit('mm:auth:prompt'); },
  };
  M.auth = Auth;
  M.modules.auth = Auth;
})(window.MONOMODE);