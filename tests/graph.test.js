const { test } = require('node:test');
const assert = require('node:assert');

function makeGraph() {
  return {
    edges: new Map(),
    strengthen(w1, w2, dim) {
      const key = [w1, w2].sort().join('→');
      const link = this.edges.get(key) ||
        { weight: 0.3, dim, count: 0, lastUsed: Date.now() };
      link.weight = Math.min(1.0, link.weight * 1.05);
      link.count++;
      link.lastUsed = Date.now();
      this.edges.set(key, link);
      return link;
    },
    query(pattern) {
      const out = [];
      for (const [k, l] of this.edges) {
        if (k.includes(pattern)) out.push({ key: k, link: l });
      }
      return out;
    },
  };
}

test('§graph · усиление связи', () => {
  const g = makeGraph();
  const l1 = g.strengthen('дом', 'свет', '3D');
  assert.strictEqual(l1.count, 1);
  const l2 = g.strengthen('дом', 'свет', '3D');
  assert.strictEqual(l2.count, 2);
  assert.ok(l2.weight > 0.3);
});

test('§graph · ключ сортирован', () => {
  const g = makeGraph();
  g.strengthen('свет', 'дом', '3D');
  g.strengthen('дом', 'свет', '3D');
  assert.strictEqual(g.edges.size, 1);
});

test('§graph · weight не превышает 1.0', () => {
  const g = makeGraph();
  for (let i = 0; i < 100; i++) g.strengthen('a', 'b', '3D');
  assert.ok(g.edges.get('a→b').weight <= 1.0);
});

test('§graph · query по подстроке', () => {
  const g = makeGraph();
  g.strengthen('дом', 'свет', '3D');
  g.strengthen('дом', 'волна', '3D');
  assert.strictEqual(g.query('дом').length, 2);
});