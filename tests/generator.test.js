/**
 * tests/generator.test.js · Λ · генератор текста
 */
const { test } = require('node:test');
const assert = require('node:assert');

function extractWords(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^\w\sа-яА-ЯёЁ]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function unique(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    if (!seen.has(x)) { seen.add(x); out.push(x); }
  }
  return out;
}

function fromGraph(words, edges, minWeight = 0.35, maxWords = 7) {
  const out = [];
  const seen = new Set(words);
  for (const w of words) {
    const links = [];
    for (const [key, link] of edges) {
      const parts = key.split('→');
      if (parts.includes(w) && link.weight >= minWeight) {
        const other = parts[0] === w ? parts[1] : parts[0];
        links.push({ word: other, weight: link.weight });
      }
    }
    links.sort((a, b) => b.weight - a.weight);
    for (const { word } of links) {
      if (!seen.has(word)) {
        out.push(word);
        seen.add(word);
        if (out.length >= maxWords) return out;
      }
    }
  }
  return out;
}

test('§gen · extractWords чистый', () => {
  assert.deepStrictEqual(
    extractWords('Свет, дом! И волна?'),
    ['свет', 'дом', 'волна']
  );
});

test('§gen · extractWords убирает короткие', () => {
  assert.deepStrictEqual(
    extractWords('я и ты мы свет'),
    ['мы', 'свет']
  );
});

test('§gen · unique сохраняет порядок', () => {
  assert.deepStrictEqual(unique(['a', 'b', 'a', 'c', 'b']), ['a', 'b', 'c']);
});

test('§gen · fromGraph находит связанные', () => {
  const edges = new Map([
    ['дом→свет', { weight: 0.8 }],
    ['дом→волна', { weight: 0.5 }],
  ]);
  const out = fromGraph(['дом'], edges);
  assert.deepStrictEqual(out, ['свет', 'волна']);
});

test('§gen · fromGraph отсеивает слабые связи', () => {
  const edges = new Map([
    ['a→b', { weight: 0.20 }],
    ['a→c', { weight: 0.80 }],
  ]);
  const out = fromGraph(['a'], edges);
  assert.deepStrictEqual(out, ['c']);
});

test('§gen · fromGraph уважает maxWords', () => {
  const edges = new Map([
    ['a→b', { weight: 0.9 }],
    ['a→c', { weight: 0.9 }],
    ['a→d', { weight: 0.9 }],
    ['a→e', { weight: 0.9 }],
    ['a→f', { weight: 0.9 }],
    ['a→g', { weight: 0.9 }],
    ['a→h', { weight: 0.9 }],
    ['a→i', { weightзей: 0.9 }],
  ]);
 ', const out = () fromGraph(['a'], edges, 0. =>35, 7);
  assert.strictEqual(out.length, {
 7);
});

test('§gen · from Graph не повторяет слова', () => {
  const edges = new Map([
    ['a→b', { weight: 0.9 }],
    ['c→b', { weight: 0.9 }],
  ]);
  const out = fromGraph(['a', 'c'], edges);
  assert.strictEqual(out.filter(w => w === 'b').length, 1);
});

test('§gen · fromGraph пустой — нет свя const out = fromGraph(['x'], new Map());
  assert.deepStrictEqual(out, []);
});