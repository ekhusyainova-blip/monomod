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
      const id = M.id.spawn(pid);

      // базовое ребро родословной
      M.links.ensure(pid, id);

      // фрагмент-сфера тоже регистрируется в графе фрагментов
      if (M.fragments) {
        M.fragments.register(id, 'sphere');
        M.fragments.link(pid, id, 'lineage');
      }

      M.emit('mm:sphere:add', { id, parent: pid });
      return id;
    },

    remove(id) {
      // нельзя удалить корень
      if (id === M.id.root()) return false;

      // удаляем сферу
      const list = M.id.children().filter(c => c.id !== id);
      localStorage.setItem(M.id.KEY_CHILDREN, JSON.stringify(list));

      // удаляем её пространство
      const p = 'mm:' + id + ':';
      localStorage.removeItem(p + 'graph');
      localStorage.removeItem(p + 'templates');
      localStorage.removeItem(p + 'trail');

      // отключаем все связи
      if (M.links) {
        for (const [k] of M.links.edges) {
          if (k.includes(id)) M.links.edges.delete(k);
        }
        M.links.save();
      }
      if (M.fragments) {
        M.fragments.unregister(id);
      }

      // если текущая — переключаемся на корень
      if (M.id.current() === id) {
        M.id.setCurrent(M.id.root());
        M.core.reload(M.id.root());
      }

      M.emit('mm:sphere:remove', { id });
      return true;
    },

    // родословная: кто родитель, кто дети, кто внуки
    tree(id) {
      const target = id || M.id.current();
      const list = this.list();
      const node = list.find(s => s.id === target);
      if (!node) return null;
      return {
        id: target,
        parent: node.parent,
        children: list.filter(s => s.parent === target).map(s => s.id),
        lineage: M.id.lineage(target),
      };
    },
  };

  M.spheres = Spheres;
  M.modules.spheres = Spheres;

  // усиление связей при переключении и добавлении
  M.on('mm:sphere:switch', (e) => {
    if (!M.links) return;
    const lineage = M.id.lineage(e.detail.id);
    for (let i = 0; i < lineage.length - 1; i++) {
      M.links.strengthen(lineage[i], lineage[i + 1], 'switch');
    }
    if (M.fragments) {
      for (let i = 0; i < lineage.length - 1; i++) {
        M.fragments.link(lineage[i], lineage[i + 1], 'switch');
      }
    }
  });

  M.on('mm:sphere:add', (e) => {
    if (M.links) M.links.strengthen(e.detail.parent, e.detail.id, 'create');
  });
})(window.MONOMODE);