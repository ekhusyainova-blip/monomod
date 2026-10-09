/**
 * tests/translator.test.js · Ω · translator
 */
const { test } = require('node:test');
const assert = require('node:assert');

const DICT = {
  ru: { 'свет': 'свет', 'дом': 'дом', 'волна': 'волна' },
  en: { 'свет': 'light', 'дом': 'home', 'волна': 'wave' },
  ja: { 'свет': '光', 'дом': '家', 'волна': '波' },
  de: { 'свет': 'Licht', 'дом': 'Haus', 'волна': 'Welle' },
};

function interpret(template, lang) {
  if (!template || !Array.isArray(template.words)) {
    return { id: null, lang: lang || 'ru', words: [], source: [] };
  }
  const dict = DICT[lang] || {};
  const words = template.words.map(w => dict[w] || w);
  return {
    id: template.id,
    lang,
    words,
    source: template.words.slice(),
  };
}

test('§translator · ru не меняет', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const r = interpret(t, 'ru');
  assert.deepStrictEqual(r.words, ['свет', 'дом']);
});

test('§translator · en переводит', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const r = interpret(t, 'en');
  assert.deepStrictEqual(r.words, ['light', 'home']);
});

test('§translator · ja переводит', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const r = interpret(t, 'ja');
  assert.deepStrictEqual(r.words, ['光', '家']);
});

test('§translator · de переводит', () => {
  const t = { id: 'TPL-1', words: ['свет', 'волна'] };
  const r = interpret(t, 'de');
  assert.deepStrictEqual(r.words, ['Licht', 'Welle']);
});

test('§translator · шаблон НЕ изменён', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const before = JSON.stringify(t.words);
  interpret(t, 'en');
  interpret(t, 'ja');
  interpret(t, 'de');
  assert.strictEqual(JSON.stringify(t.words), before);
});

test('§translator · source — копия, не ссылка', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const r = interpret(t, 'en');
  r.source.push('xyz');
  assert.strictEqual(t.words.length, 2);
});

test('§translator · слово без перевода остаётся', () => {
  const t = { id: 'TPL-1', words: ['свет', 'xyz'] };
  const r = interpret(t, 'en');
  assert.deepStrictEqual(r.words, ['light', 'xyz']);
});

test('§translator · неизвестный язык возвращает исходное', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  const r = interpret(t, 'xx');
  assert.deepStrictEqual(r.words, ['свет', 'дом']);
});

test('§translator · 4 языка в словаре', () => {
  assert.strictEqual(Object.keys(DICT).length, 4);
});

test('§translator · пустой шаблон не падает', () => {
  const r = interpret(null, 'en');
  assert.strictEqual(r.id, null);
  assert.deepStrictEqual(r.words, []);
});

test('§translator · id сохраняется в интерпретации', () => {
  const t = { id: 'TPL-abc12def', words: ['свет'] };
  const r = interpret(t, 'en');
  assert.strictEqual(r.id, 'TPL-abc12def');
});