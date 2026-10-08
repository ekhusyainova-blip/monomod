(function (M) {
  const Core = {
    space(id) { return 'mm:' + (id || M.id.current()) + ':'; },
    graph(id)    { try { return JSON.parse(localStorage.getItem(this.space(id) + 'graph') || '[]'); } catch { return []; } },
    templates(id){ try { return JSON.parse(localStorage.getItem(this.space(id) + 'templates') || '[]'); } catch { return []; } },
    trail(id)    { try { return JSON.parse(localStorage.getItem(this.space(id) + 'trail') || '[]'); } catch { return []; } },
    reload(id) {
      const p = this.space(id);
      const g = localStorage.getItem(p + 'graph');
      const t = localStorage.getItem(p + 'templates');
      const tr = localStorage.getItem(p + 'trail');
      if (g)  localStorage.setItem('mm_graph', g);
      if (t)  localStorage.setItem('mm_templates', t);
      if (tr) localStorage.setItem('mm_trail', tr);
      M.emit('mm:core:reload', { id });
    },
    snapshot(id) {
      const g = this.graph(id), t = this.templates(id), tr = this.trail(id);
      return { id: id || M.id.current(), edges: g.length, templates: t.length, trail: tr.length };
    },
  };
  M.core = Core;
  M.modules.core = Core;
})(window.MONOMODE);