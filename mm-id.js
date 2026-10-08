(function (M) {
  const ID = {
    KEY_ROOT: 'mm_root_id',
    KEY_CHILDREN: 'mm_children',
    KEY_CURRENT: 'mm_current_id',

    make() {
      const a = new Uint8Array(16);
      crypto.getRandomValues(a);
      return 'MID-' + Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    },
    root() {
      let id = localStorage.getItem(this.KEY_ROOT);
      if (!id) { id = this.make(); localStorage.setItem(this.KEY_ROOT, id); }
      return id;
    },
    children() {
      try { return JSON.parse(localStorage.getItem(this.KEY_CHILDREN) || '[]'); }
      catch { return []; }
    },
    current() { return localStorage.getItem(this.KEY_CURRENT) || this.root(); },
    setCurrent(id) { localStorage.setItem(this.KEY_CURRENT, id); },

    // любой авторизованный MONOMOD может раздавать
    spawn(parentId) {
      const id = this.make();
      const list = this.children();
      list.push({
        id,
        parent: parentId,
        created: Date.now(),
        inherited: this.snapshot(parentId),
      });
      localStorage.setItem(this.KEY_CHILDREN, JSON.stringify(list));
      this.initSpace(id, list[list.length - 1]);
      return id;
    },

    snapshot(parentId) {
      const p = 'mm:' + parentId + ':';
      return {
        graph: localStorage.getItem(p + 'graph') || localStorage.getItem('mm_graph'),
        templates: localStorage.getItem(p + 'templates') || localStorage.getItem('mm_templates'),
      };
    },
    initSpace(id, child) {
      const p = 'mm:' + id + ':';
      if (child.inherited.graph) localStorage.setItem(p + 'graph', child.inherited.graph);
      if (child.inherited.templates) localStorage.setItem(p + 'templates', child.inherited.templates);
    },
    lineage(id) {
      const list = this.children();
      const out = [];
      let cur = id;
      while (cur) {
        out.unshift(cur);
        const c = list.find(x => x.id === cur);
        cur = c ? c.parent : null;
      }
      return out;
    },
    isAuthorized() {
      const cur = this.current();
      return cur === this.root() || this.children().some(c => c.id === cur);
    },
  };
  M.id = ID;
  M.modules.id = ID;
})(window.MONOMODE);