(function (M) {
  /* ==========================================================================
     LEARN — обучение MONOMOD через MONOMODE
     Принимает обновления, применяет в граф текущей сферы,
     наследует при создании дочерней, усиливает связи.
     ========================================================================== */

  const Learn = {
    // --- приём обновления ---------------------------------------------------
    apply(update, targetId) {
      if (!update || !Array.isArray(update.words)) return false;
      const id = targetId || M.id.current();
      const [w1, w2] = update.words;
      if (!w1 || !w2) return false;

      const graph = M.core.graph(id);
      const map = new Map(graph);
      const key = [w1, w2].sort().join('→');
      const link = map.get(key) || {
        weight: 0.3, dim: update.dim || '3D', count: 0, lastUsed: Date.now(),
      };
      link.weight = Math.min(1.0, link.weight * 1.05);
      link.count++;
      link.lastUsed = Date.now();
      map.set(key, link);
      M.core.save(id, 'graph', Array.from(map.entries()));

      // усиление родословной при обучении
      const parent = M.id.children().find(c => c.id === id)?.parent;
      if (parent && M.links) M.links.strengthen(parent, id, 'learn');

      M.emit('mm:learn:applied', { id, key, weight: link.weight });
      return true;
    },

    // --- наследование при создании дочерней ---------------------------------
    inherit(parentId, childId) {
      if (!parentId || !childId) return;
      const parentGraph = M.core.graph(parentId);
      if (!parentGraph.length) return;

      // копируем с затуханием — дети получают ослабленную версию
      const inherited = parentGraph.map(([k, v]) => [
        k,
        { ...v, weight: v.weight * 0.8, lastUsed: Date.now() },
      ]);
      M.core.save(childId, 'graph', inherited);

      const parentTpl = M.core.templates(parentId);
      if (parentTpl.length) {
        M.core.save(childId, 'templates', parentTpl.map(([k, v]) => [k, { ...v }]));
      }

      M.emit('mm:learn:inherited', { parentId, childId, edges: inherited.length });
    },

    // --- экспорт обучения текущей сферы -------------------------------------
    export(id) {
      const target = id || M.id.current();
      return JSON.stringify({
        id: target,
        graph: M.core.graph(target),
        templates: M.core.templates(target),
        trail: M.core.trail(target),
        ts: Date.now(),
      });
    },

    // --- импорт обучения в текущую сферу ------------------------------------
    import(json, targetId) {
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const id = targetId || M.id.current();
        if (Array.isArray(data.graph)) M.core.save(id, 'graph', data.graph);
        if (Array.isArray(data.templates)) M.core.save(id, 'templates', data.templates);
        if (Array.isArray(data.trail)) M.core.save(id, 'trail', data.trail);
        M.emit('mm:learn:imported', { id, edges: (data.graph || []).length });
        return true;
      } catch (e) {
        M.emit('mm:learn:error', { error: String(e) });
        return false;
      }
    },

    // --- снимок наследуемого (для нового ребёнка) ---------------------------
    snapshot(parentId) {
      return {
        graph: M.core.graph(parentId || M.id.current()),
        templates: M.core.templates(parentId || M.id.current()),
      };
    },
  };

  M.learn = Learn;
  M.modules.learn = Learn;

  // При создании сферы — наследование
  M.on('mm:sphere:add', (e) => Learn.inherit(e.detail.parent, e.detail.id));
})(window.MONOMODE);