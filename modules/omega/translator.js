/**
 * modules/omega/translator.js · CANON 9.0.0
 * Интерпретирует шаблоны на 3 языка. Шаблоны НЕ меняет.
 * @triad omega
 */
(function (M) {
  'use strict';

  const DICT = {
    ru: { 'свет': 'свет', 'дом': 'дом' },
    en: { 'свет': 'light', 'дом': 'home' },
    ja: { 'свет': '光',   'дом': '家' },
  };

  const T = {
    lang: 'ru',

    setLang(l) {
      if (DICT[l]) {
        this.lang = l;
        M.emit('mm:translator:lang', { lang: l });
      }
    },

    // интерпретация — НЕ изменяет шаблон
    interpret(template, lang) {
      const l = lang || this.lang;
      const dict = DICT[l] || {};
      const words = template.words.map(w => dict[w] || w);
      return {
        id: template.id,
        lang: l,
        words,          // новые слова
        source: template.words,  // шаблон не тронут
      };
    },

    stats() { return { lang: this.lang, langs: Object.keys(DICT) }; },
  };

  M.translator = T;
  M.modules.translator = T;

  M.on('mm:ready', () => console.log('[omega] translator ready'));

  // интерпретируем любой шаблон, если запросили
  M.on('mm:template:interpret:request', (e) => {
    const { template, lang } = e.detail;
    const r = T.interpret(template, lang);
    M.emit('mm:template:interpreted', r);
  });
})(window.MONOMODE);