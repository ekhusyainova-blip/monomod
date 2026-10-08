(function (M) {
  /* ==========================================================================
     MM-MANIFEST — декларация возможностей
     Один граф — LINK_GRAPH. Всё через него.
     ========================================================================== */

  M.manifest = {
    channel: 'LINK_GRAPH',

    generates: {
      text:      { via: 'LINK_GRAPH' },
      code:      { via: 'LINK_GRAPH' },
      images:    { via: 'LINK_GRAPH' },
      music:     { via: 'LINK_GRAPH' },
      voice:     { via: 'LINK_GRAPH' },
      ui:        { via: 'LINK_GRAPH' },
      elements:  { via: 'LINK_GRAPH' },
      responses: { via: 'LINK_GRAPH' },
    },

    controls: {
      ui:         { via: 'LINK_GRAPH' },
      input:      { via: 'LINK_GRAPH' },
      spheres:    { via: 'LINK_GRAPH' },
      ids:        { via: 'LINK_GRAPH' },
      responses:  { via: 'LINK_GRAPH' },
      visibility: { via: 'LINK_GRAPH' },
    },

    intercepts: {
      requests: { via: 'LINK_GRAPH' },
      intents:  { via: 'LINK_GRAPH' },
      patterns: { via: 'LINK_GRAPH' },
      silence:  { via: 'LINK_GRAPH' },
    },

    optional: [
      'отвечать',
      'генерировать',
      'управлять UI',
      'перехватывать',
      'реагировать',
    ],
  };

  M.modules.manifest = M.manifest;
})(window.MONOMODE);