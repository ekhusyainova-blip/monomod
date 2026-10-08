(function (M) {
  const Export = {
    exportAll() {
      const id = M.id.current();
      const data = {
        version: M.version,
        id,
        root: M.id.root(),
        children: M.id.children(),
        spheres: M.spheres.list(),
        graph: M.core.graph(id),
        templates: M.core.templates(id),
        trail: M.core.trail(id),
        links: M.links ? M.links.all() : [],
        fragments: M.fragments ? M.fragments.all() : [],
        ts: Date.now(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'monomod-' + id.slice(0, 12) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      M.emit('mm:export:done', { id });
    },

    importAll(json) {
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const id = data.id || M.id.current();
        if (Array.isArray(data.graph)) M.core.save(id, 'graph', data.graph);
        if (Array.isArray(data.templates)) M.core.save(id, 'templates', data.templates);
        if (Array.isArray(data.trail)) M.core.save(id, 'trail', data.trail);
        if (Array.isArray(data.links) && M.links) {
          M.links.edges = new Map(data.links.map(l => [l.key, l]));
          M.links.save();
        }
        if (Array.isArray(data.fragments) && M.fragments) {
          M.fragments.edges = new Map(data.fragments.map(l => [l.key, l]));
          M.fragments.save();
        }
        M.emit('mm:import:done', { id });
        return true;
      } catch (e) {
        M.emit('mm:import:error', { error: String(e) });
        return false;
      }
    },

    pickFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = () => {
        const f = input.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => this.importAll(reader.result);
        reader.readAsText(f);
      };
      input.click();
    },

    hook() {
      window.addEventListener('keydown', (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
          e.preventDefault();
          this.exportAll();
        }
        if (e.key === 'i' || e.key === 'I' || e.key === 'ш' || e.key === 'Ш') {
          e.preventDefault();
          this.pickFile();
        }
      });
    },
  };

  M.export = Export;
  M.modules.export = Export;
  M.on('mm:ready', () => Export.hook());
})(window.MONOMODE);