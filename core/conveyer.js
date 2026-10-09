/**
 * core/conveyer.js · ABCD-конвейер
 * processInput: очистка → разбор → усиление → прочность → переход.
 * P0 → P3 → P7 / P10 → P0
 */
(function (M) {
  'use strict';

  const THRESH = {
    minWordLen: 2,
    minDurability: 0.15,
  };

  function processInput(raw) {
    const cleaned = raw.trim()
      .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
      .toLowerCase();
    const words = cleaned.split(/\s+/).filter(w => w.length > THRESH.minWordLen);

    if (words.length === 0) {
      M.emit('mm:phase', { phase: 'P0' });
      return { words: [], durability: 0 };
    }

    // усиление
    // парные связи (все пары)
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        M.graph.strengthen(words[i], words[j], '3D');
      }
    }
    // §bigram · последовательные пары
    for (let i = 0; i < words.length - 1; i++) {
      M.graph.observeSequence(words[i], words[i + 1]);
    }
    // §trigram · последовательные тройки
    for (let i = 0; i < words.length - 2; i++) {
      M.graph.observeTriple(words[i], words[i + 1], words[i + 2]);
    }

    // прочность
    let tw = 0, lc = 0;
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const k = [words[i], words[j]].sort().join('→');
        const l = M.graph.edges.get(k);
        if (l) { tw += l.weight; lc++; }
      }
    }
    const dur = lc > 0 ? tw / lc : 0.2;

    // затухание
    M.graph.decay();

    // запись
    M.memory.record(words, '3D', dur);

    // сохранение
    M.graph.save();
    M.memory.save();

    // эмиссия
    M.emit('mm:conveyer:result', {
      words,
      edges: M.graph.size(),
      durability: +dur.toFixed(3),
    });

+   // §gen · генерация только при удачном маршруте
+   if (dur >= THRESH.minDurability) {
+     M.emit('mm:generator:request', { words });
+   }

    if (dur < THRESH.minDurability) {
      M.emit('mm:phase', { phase: 'P7' });
    } else {
      M.emit('mm:phase', { phase: 'P10' });
      // §gen · запрос генератору
      M.emit('mm:generator:request', { words });
    }

    return { words, durability: dur };
  }

  M.conveyer = { processInput, THRESH };
  M.modules.conveyer = M.conveyer;
})(window.MONOMODE);