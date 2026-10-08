(function (M) {
  const Auth = {
    check() {
      const incoming = new URLSearchParams(location.search).get('id');
      if (incoming && /^MID-[0-9a-f]{32}$/.test(incoming)) {
        M.id.setCurrent(incoming);
        return true;
      }
      if (!localStorage.getItem(M.id.KEY_ROOT)) {
        M.id.root();
        M.id.setCurrent(M.id.root());
        return true;
      }
      return M.id.isAuthorized();
    },

    enter(id) {
      if (!/^MID-[0-9a-f]{32}$/.test(id)) return false;
      M.id.setCurrent(id);
      M.core.reload(id);
      M.emit('mm:auth:ok', { id });
      return true;
    },

    becomeRoot() {
      M.id.setCurrent(M.id.root());
      M.core.reload(M.id.root());
      M.emit('mm:auth:new', { id: M.id.root() });
      return true;
    },

    logout() {
      M.id.setCurrent(M.id.root());
      M.core.reload(M.id.root());
      M.emit('mm:auth:logout', {});
    },

    prompt() { M.emit('mm:auth:prompt', {}); },
  };

  M.auth = Auth;
  M.modules.auth = Auth;
})(window.MONOMODE);