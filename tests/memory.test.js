const { test } = require('node:test');
const assert = require('node:assert');

function makeMemory() {
  return {
    trail: [],
    maxSize: 110,
    record(words, dim, durability) {
      this.trail.push({
        words: Array.isArray(words) ? words : [words],
        dim, durability: +(+durability).toFixed(3), ts: Date.now(),
      });
      if (this.trail.length > this.maxSize) this.trail.shift();
    },
  };
}

test('§memory · запись добавляет в trail', () => {
  const m = makeMemory();
  m.record(['a', 'b'], '3D', 0.5);
  assert.strictEqual(m.trail.length, 1);
});

test('§memory · лимит 110', () => {
  const m = makeMemory();
  for (let i = 0; i < 200; i++) m.record(['w' + i], '3D', 0.5);
  assert.strictEqual(m.trail.length, 110);
});

test('§memory · durability округляется', () => {
  const m = makeMemory();
  m.record(['a'], '3D', 0.123456);
  assert.strictEqual(m.trail[0].durability, 0.123);
});