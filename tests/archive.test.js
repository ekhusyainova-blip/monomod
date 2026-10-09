const { test } = require('node:test');
const assert = require('node:assert');

function makeArchive() {
  return {
    archive: new Map(),
    generateId(words) {
      const str = words.slice().sort().join('|').toLowerCase();
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return 'TPL-' + Math.abs(h).toString(16).padStart(8, '0').slice(0, 8);
    },
    tryCreate(words, dim, weight) {
      const id = this.generateId(words);
      if (this.archive.has(id)) {
        const t = this.archive.get(id);
        t.usageCount++;
        return t;
      }
      const t = { id, words: words.slice().sort(), dim,
        weight: +weight.toFixed(3), created: Date.now(),
        lastUsed: Date.now(), usageCount: 1 };
      this.archive.set(id, t);
      return t;
    },
  };
}

test('§archive · id детерминирован', () => {
  const a = makeArchive();
  const t1 = a.tryCreate(['свет', 'дом'], '3D', 0.6);
  const t2 = a.tryCreate(['дом', 'свет'], '3D', 0.6);
  assert.strictEqual(t1.id, t2.id);
});

test('§archive · повторный tryCreate увеличивает count', () => {
  const a = makeArchive();
  a.tryCreate(['a', 'b'], '3D', 0.6);
  const t = a.tryCreate(['a', 'b'], '3D', 0.6);
  assert.strictEqual(t.usageCount, 2);
});

test('§archive · id начинается с TPL-', () => {
  const a = makeArchive();
  const t = a.tryCreate(['x', 'y'], '3D', 0.5);
  assert.ok(t.id.startsWith('TPL-'));
  assert.strictEqual(t.id.length, 12);
});