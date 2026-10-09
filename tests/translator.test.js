const { test } = require('node:test');
const assert = require('node:assert');

const DICT = {
  ru: { 'свет': 'свет', 'дом': 'дом' },
  en: { 'свет': 'light', 'дом': 'home' },
  ja: { 'свет': '光',   'дом': '家' },
};

function interpret(template, lang) {
  const dict = DICT[lang] || {};
  return {
    id: template.id,
    words: template.words.map(w => dict[w] || w),
    source: template.words,
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

test('§translator · шаблон не изменён', () => {
  const t = { id: 'TPL-1', words: ['свет', 'дом'] };
  interpret(t, 'en');
  assert.deepStrictEqual(t.words, ['свет', 'дом']);
});

test('§translator · слово без перевода остаётся', () => {
  const t = { id: 'TPL-1', words: ['свет', 'xyz'] };
  const r = interpret(t, 'en');
  assert.deepStrictEqual(r.words, ['light', 'xyz']);
});