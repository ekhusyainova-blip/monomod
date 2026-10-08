(function (M) {
  const Spheres = {
    list() {
      const root = M.id.root();
      return [
        { id: root, parent: null, isRoot: true },
        ...M.id.children().map(c => ({ id: c.id, parent: c.parent, isRoot: false })),
      ];
    },
    current() { return M.id.current(); },
    switchTo(id) {
      M.id.setCurrent(id);
      M.core.reload(id);
      M.emit('mm:sphere:switch', { id });
    },
    add(parentId) {
      const pid = parentId || M.id.current();
      const id = M.id.spawn(pid);          // ← теперь любой может раздавать
      M.emit('mm:sphere:add', { id, parent: pid });
      return id;
    },
  };
  M.spheres = Spheres;
  M.modules.spheres = Spheres;
})(window.MONOMODE);