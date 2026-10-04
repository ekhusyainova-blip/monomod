/* MONOMOD — один интерфейс, модифицированный под тебя.
   Всё работает в браузере: профиль и прогресс хранятся в localStorage. */
(function () {
  'use strict';

  // ---------- Данные ----------
  var COLORS = [
    { name: 'Фиолетовый', hex: '#7c5cff' },
    { name: 'Синий', hex: '#2f6bff' },
    { name: 'Бирюзовый', hex: '#12b5a5' },
    { name: 'Зелёный', hex: '#3ccf4e' },
    { name: 'Оранжевый', hex: '#ff7a1a' },
    { name: 'Красный', hex: '#ff3b5c' }
  ];

  var GOAL_EXAMPLES = ['Выучить английский', 'Пробежать марафон', 'Научиться программировать', 'Читать 20 книг в год', 'Накопить подушку'];

  var CATEGORIES = [
    {
      id: 'language', label: 'Языки',
      keys: ['англ', 'язык', 'немец', 'испан', 'франц', 'итальян', 'китай', 'япон', 'корей', 'english', 'слов', 'грамматик'],
      unit: 'дней практики',
      tips: [
        'Выучи 10 новых слов и составь с каждым по предложению.',
        'Посмотри 15 минут видео на языке без субтитров.',
        'Запиши голосовое на 1 минуту о своём дне — на изучаемом языке.',
        'Прочитай одну короткую статью и выпиши 5 незнакомых слов.',
        'Повтори слова за прошлую неделю — интервальное повторение работает.',
        'Разбери одно грамматическое правило и сделай 5 упражнений.',
        'Переведи на язык 5 фраз, которые ты сегодня сказал(а) по-русски.'
      ]
    },
    {
      id: 'fitness', label: 'Тело',
      keys: ['спорт', 'бег', 'пробеж', 'марафон', 'похуд', 'вес', 'зал', 'трен', 'фитнес', 'здоров', 'йог', 'плаван', 'отжим'],
      unit: 'тренировок',
      tips: [
        '20 минут движения — любого. Главное начать.',
        'Пройди сегодня на 2 000 шагов больше обычного.',
        'Сделай 3 подхода планки — сколько сможешь.',
        'Лёгкая пробежка или быстрая ходьба 25 минут.',
        'Растяжка 10 минут перед сном.',
        'Выпей 8 стаканов воды и отметь, как себя чувствуешь.',
        'Ляг спать на 30 минут раньше — восстановление тоже тренировка.'
      ]
    },
    {
      id: 'code', label: 'Код',
      keys: ['код', 'програм', 'разработ', 'python', 'javascript', 'js', 'сайт', 'frontend', 'backend', 'айти', 'it'],
      unit: 'дней кода',
      tips: [
        'Реши одну задачу на алгоритмы — без подсказок первые 20 минут.',
        'Напиши маленькую функцию и покрой её тестом.',
        'Прочитай чужой код в open source и разберись в одном файле.',
        'Сделай один коммит в свой учебный проект.',
        'Изучи одну новую возможность языка и примени её.',
        'Отрефактори кусок старого кода — сделай его понятнее.',
        'Объясни вслух (или в заметке) тему, которую изучаешь.'
      ]
    },
    {
      id: 'reading', label: 'Чтение',
      keys: ['книг', 'чита', 'чтени', 'литератур'],
      unit: 'дней чтения',
      tips: [
        'Прочитай 20 страниц до того, как откроешь соцсети.',
        'Выпиши одну мысль из книги, которая зацепила.',
        'Читай 15 минут перед сном вместо телефона.',
        'Расскажи кому-нибудь о книге, которую читаешь.',
        'Выбери следующую книгу заранее — чтобы не было паузы.',
        'Сделай короткий конспект прочитанной главы.',
        'Носи книгу с собой — читай в очередях и дороге.'
      ]
    },
    {
      id: 'money', label: 'Финансы',
      keys: ['деньг', 'накоп', 'финанс', 'бизнес', 'доход', 'заработ', 'бюджет', 'инвест', 'сбереж', 'подушк'],
      unit: 'дней дисциплины',
      tips: [
        'Запиши все траты за сегодня — до рубля.',
        'Отложи фиксированную сумму сразу, а не «что останется».',
        'Отмени одну ненужную подписку.',
        'Проведи день без спонтанных покупок.',
        'Посчитай, сколько осталось до цели, и разбей на месяцы.',
        'Изучи один финансовый инструмент 20 минут.',
        'Подумай, какой навык может увеличить твой доход, и сделай первый шаг.'
      ]
    },
    {
      id: 'general', label: 'Цель',
      keys: [],
      unit: 'шагов',
      tips: [
        'Сделай одно маленькое действие к цели — прямо сейчас, за 5 минут.',
        'Запиши, что мешало вчера, и убери одно препятствие.',
        'Разбей цель на 3 ближайших шага и сделай первый.',
        'Выдели 25 минут без телефона только для цели.',
        'Расскажи кому-нибудь о своей цели — так проще не сдаться.',
        'Отметь, что уже получилось. Прогресс важнее идеала.',
        'Спланируй завтрашний шаг к цели сегодня вечером.'
      ]
    }
  ];

  var QUOTES = [
    ['Путь в тысячу ли начинается с первого шага.', 'Лао-цзы'],
    ['Мы есть то, что мы постоянно делаем.', 'Аристотель'],
    ['Не бойся медленного движения, бойся остановки.', 'Китайская пословица'],
    ['Лучшее время посадить дерево было 20 лет назад. Следующее лучшее — сейчас.', 'Пословица'],
    ['Успех — это сумма небольших усилий, повторяемых изо дня в день.', 'Роберт Кольер'],
    ['Дисциплина — мост между целями и достижениями.', 'Джим Рон'],
    ['Делай что можешь, с тем что имеешь, там где ты есть.', 'Теодор Рузвельт'],
    ['Тот, кто хочет, ищет возможности. Кто не хочет — ищет причины.', 'Сократ'],
    ['Мотивация заставляет начать. Привычка — продолжать.', 'Джим Рюн'],
    ['Сложнее всего начать действовать, всё остальное зависит только от упорства.', 'Амелия Эрхарт'],
    ['Кто не делает ошибок, тот не делает ничего.', 'Пословица'],
    ['Терпение и труд всё перетрут.', 'Русская пословица'],
    ['Маленькие шаги каждый день дают большие результаты.', 'Неизвестный автор'],
    ['Будущее зависит от того, что ты делаешь сегодня.', 'Махатма Ганди'],
    ['Не ждите. Время никогда не будет подходящим.', 'Наполеон Хилл'],
    ['Глаза боятся, а руки делают.', 'Русская пословица'],
    ['Неважно, как медленно ты идёшь, пока ты не останавливаешься.', 'Конфуций'],
    ['Действие — основополагающий ключ к любому успеху.', 'Пабло Пикассо']
  ];

  var WMO = {
    0: ['Ясно', '☀️'], 1: ['Преимущественно ясно', '🌤️'], 2: ['Переменная облачность', '⛅'], 3: ['Пасмурно', '☁️'],
    45: ['Туман', '🌫️'], 48: ['Изморозь', '🌫️'],
    51: ['Лёгкая морось', '🌦️'], 53: ['Морось', '🌦️'], 55: ['Сильная морось', '🌧️'],
    56: ['Ледяная морось', '🌧️'], 57: ['Ледяная морось', '🌧️'],
    61: ['Небольшой дождь', '🌦️'], 63: ['Дождь', '🌧️'], 65: ['Ливень', '🌧️'],
    66: ['Ледяной дождь', '🌧️'], 67: ['Ледяной дождь', '🌧️'],
    71: ['Небольшой снег', '🌨️'], 73: ['Снег', '🌨️'], 75: ['Сильный снег', '❄️'], 77: ['Снежная крупа', '🌨️'],
    80: ['Ливневый дождь', '🌦️'], 81: ['Ливни', '🌧️'], 82: ['Сильные ливни', '⛈️'],
    85: ['Снегопад', '🌨️'], 86: ['Сильный снегопад', '❄️'],
    95: ['Гроза', '⛈️'], 96: ['Гроза с градом', '⛈️'], 99: ['Гроза с градом', '⛈️']
  };

  // ---------- Чистые функции (тестируются в node) ----------
  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function utf8ToBytes(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    return Buffer.from(s, 'utf8');
  }
  function bytesToUtf8(b) {
    if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(b);
    return Buffer.from(b).toString('utf8');
  }

  function b64urlEncode(str) {
    var bytes = utf8ToBytes(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytesToUtf8(bytes);
  }

  function sanitizeProfile(p) {
    if (!p || typeof p !== 'object') return null;
    var name = typeof p.n === 'string' ? p.n.trim().slice(0, 40) : '';
    var goal = typeof p.g === 'string' ? p.g.trim().slice(0, 80) : '';
    var color = typeof p.c === 'string' && /^#[0-9a-f]{6}$/i.test(p.c) ? p.c.toLowerCase() : COLORS[0].hex;
    if (!name || !goal) return null;
    return { v: 1, n: name, g: goal, c: color };
  }

  function encodeProfile(p) {
    var s = sanitizeProfile(p);
    return s ? b64urlEncode(JSON.stringify(s)) : '';
  }
  function decodeProfile(code) {
    try { return sanitizeProfile(JSON.parse(b64urlDecode(code))); } catch (e) { return null; }
  }

  function profileId(p) { return hash(p.n.toLowerCase() + '|' + p.g.toLowerCase()).toString(36); }

  function categoryFor(goal) {
    var g = String(goal).toLowerCase();
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      for (var k = 0; k < c.keys.length; k++) {
        var key = c.keys[k];
        // короткие латинские ключи (js, it) — только как отдельное слово
        if (/^[a-z]{1,3}$/.test(key)) {
          if (new RegExp('(^|[^a-zа-яё])' + key + '([^a-zа-яё]|$)').test(g)) return c;
        } else if (g.indexOf(key) !== -1) return c;
      }
    }
    return CATEGORIES[CATEGORIES.length - 1];
  }

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000) / 86400000);
  }
  function isoDay(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function partOfDay(h) {
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'day';
    if (h >= 18 && h < 23) return 'evening';
    return 'night';
  }
  var GREETINGS = { morning: 'Доброе утро', day: 'Добрый день', evening: 'Добрый вечер', night: 'Доброй ночи' };

  /* Правила: порядок модулей зависит от времени суток и состояния прогресса. */
  function moduleOrder(h, opts) {
    opts = opts || {};
    var order;
    switch (partOfDay(h)) {
      case 'morning': order = ['focus', 'progress', 'clock', 'weather', 'quote']; break;
      case 'day': order = ['progress', 'focus', 'weather', 'clock', 'quote']; break;
      case 'evening': order = ['progress', 'quote', 'focus', 'clock', 'weather']; break;
      default: order = ['quote', 'progress', 'clock', 'focus', 'weather'];
    }
    // Если шаг на сегодня уже сделан — фокус уходит ниже, на первый план прогресс.
    if (opts.doneToday) {
      order = order.filter(function (m) { return m !== 'focus'; });
      order.splice(Math.min(3, order.length), 0, 'focus');
      order = order.filter(function (m) { return m !== 'progress'; });
      order.unshift('progress');
    }
    if (opts.weatherOff) order = order.filter(function (m) { return m !== 'weather'; });
    return ['greeting'].concat(order);
  }

  function themeFor(pref, h) {
    if (pref === 'light' || pref === 'dark') return pref;
    return h >= 7 && h < 19 ? 'light' : 'dark';
  }

  function inkFor(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    function lin(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.45 ? '#111111' : '#ffffff';
  }

  function streak(days, today) {
    var set = {}; (days || []).forEach(function (d) { set[d] = true; });
    var n = 0, d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (!set[isoDay(d)]) d.setDate(d.getDate() - 1); // серия не прерывается, пока сегодня не закончилось
    while (set[isoDay(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  var MM = {
    COLORS: COLORS, CATEGORIES: CATEGORIES, QUOTES: QUOTES,
    hash: hash, b64urlEncode: b64urlEncode, b64urlDecode: b64urlDecode,
    sanitizeProfile: sanitizeProfile, encodeProfile: encodeProfile, decodeProfile: decodeProfile,
    profileId: profileId, categoryFor: categoryFor, dayOfYear: dayOfYear, isoDay: isoDay,
    partOfDay: partOfDay, moduleOrder: moduleOrder, themeFor: themeFor, inkFor: inkFor,
    streak: streak, plural: plural
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = MM;
  if (typeof document === 'undefined') return;

  // ---------- Браузер ----------
  var LS = {
    get: function (k, def) { try { var v = localStorage.getItem('monomod:' + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem('monomod:' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('monomod:' + k); } catch (e) {} }
  };

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var state = {
    profile: null,     // текущий отображаемый профиль
    shared: false,     // открыт по чужой ссылке
    step: 0,
    draft: { n: '', g: '', c: COLORS[0].hex },
    weather: null,
    weatherStatus: 'idle'
  };

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // ----- Тема и акцент -----
  function applyTheme() {
    var pref = LS.get('theme', 'auto');
    var theme = themeFor(pref, new Date().getHours());
    document.documentElement.setAttribute('data-theme', theme);
    $('themeLabel').textContent = pref === 'auto' ? 'Авто' : (pref === 'light' ? 'Светлая' : 'Тёмная');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f5f2' : '#0e0e0e');
  }
  function applyAccent(hex) {
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-ink', inkFor(hex));
  }
  $('themeToggle').addEventListener('click', function () {
    var next = { auto: 'light', light: 'dark', dark: 'auto' }[LS.get('theme', 'auto')] || 'auto';
    LS.set('theme', next);
    applyTheme();
    toast('Тема: ' + $('themeLabel').textContent.toLowerCase());
  });

  // ----- Прогресс -----
  function progressKey(p) { return 'progress:' + profileId(p); }
  function getProgress(p) {
    var pr = LS.get(progressKey(p), null);
    if (!pr || typeof pr !== 'object') pr = { count: 0, target: 30, days: [] };
    if (!Array.isArray(pr.days)) pr.days = [];
    pr.count = Math.max(0, parseInt(pr.count, 10) || 0);
    pr.target = Math.max(1, parseInt(pr.target, 10) || 30);
    return pr;
  }
  function saveProgress(p, pr) { LS.set(progressKey(p), pr); }
  function toggleToday(p) {
    var pr = getProgress(p), today = isoDay(new Date()), i = pr.days.indexOf(today);
    if (i === -1) { pr.days.push(today); pr.count++; toast('Шаг засчитан. Так держать!'); }
    else { pr.days.splice(i, 1); pr.count = Math.max(0, pr.count - 1); }
    pr.days = pr.days.slice(-400);
    saveProgress(p, pr);
    renderDashboard();
  }

  // ----- Онбординг -----
  function buildOnboardingStatic() {
    var sw = $('swatches');
    COLORS.forEach(function (c) {
      var b = el('button', 'swatch');
      b.type = 'button';
      b.style.background = c.hex;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', c.name);
      b.title = c.name;
      b.dataset.hex = c.hex;
      b.addEventListener('click', function () { setDraftColor(c.hex); });
      sw.appendChild(b);
    });
    $('obColor').addEventListener('input', function (e) { setDraftColor(e.target.value); });
    var chips = $('goalChips');
    GOAL_EXAMPLES.forEach(function (g) {
      var b = el('button', '', g);
      b.type = 'button';
      b.addEventListener('click', function () { $('obGoal').value = g; $('obGoal').focus(); });
      chips.appendChild(b);
    });
    $('obForm').addEventListener('submit', function (e) { e.preventDefault(); nextStep(); });
    $('obBack').addEventListener('click', function () { if (state.step > 0) showStep(state.step - 1); });
  }

  function setDraftColor(hex) {
    state.draft.c = hex.toLowerCase();
    applyAccent(state.draft.c);
    $('obColor').value = state.draft.c;
    Array.prototype.forEach.call(document.querySelectorAll('.swatch'), function (b) {
      b.setAttribute('aria-checked', b.dataset.hex === state.draft.c ? 'true' : 'false');
    });
  }

  function showStep(n) {
    state.step = n;
    Array.prototype.forEach.call(document.querySelectorAll('.step'), function (s) {
      s.classList.toggle('hidden', Number(s.dataset.step) !== n);
    });
    $('obBack').classList.toggle('hidden', n === 0);
    $('obNext').textContent = n === 2 ? 'Собрать мой MONOMOD' : 'Дальше →';
    $('obError').textContent = '';
    var input = n === 0 ? $('obName') : n === 1 ? $('obGoal') : null;
    if (input) setTimeout(function () { input.focus(); }, 30);
  }

  function nextStep() {
    if (state.step === 0) {
      var n = $('obName').value.trim();
      if (!n) { $('obError').textContent = 'Напиши, как к тебе обращаться.'; return; }
      state.draft.n = n; showStep(1);
    } else if (state.step === 1) {
      var g = $('obGoal').value.trim();
      if (!g) { $('obError').textContent = 'Цель поможет подобрать фокус дня.'; return; }
      state.draft.g = g; showStep(2);
    } else {
      var p = sanitizeProfile(state.draft);
      if (!p) { showStep(0); return; }
      LS.set('profile', p);
      state.profile = p;
      state.shared = false;
      cleanUrl();
      showDashboard();
      toast('Готово! Это твой MONOMOD.');
    }
  }

  function startOnboarding(prefill) {
    state.draft = prefill ? { n: prefill.n, g: prefill.g, c: prefill.c } : { n: '', g: '', c: COLORS[0].hex };
    $('obName').value = state.draft.n;
    $('obGoal').value = state.draft.g;
    setDraftColor(state.draft.c);
    $('dashboard').classList.add('hidden');
    $('sharedBanner').classList.add('hidden');
    $('editBtn').classList.add('hidden');
    $('onboarding').classList.remove('hidden');
    showStep(0);
  }

  // ----- Модули -----
  var renderers = {
    greeting: function (p, now) {
      var m = el('section', 'mod wide greeting');
      var h = el('h1', 'hello');
      h.appendChild(document.createTextNode(GREETINGS[partOfDay(now.getHours())] + ', '));
      h.appendChild(el('em', '', p.n));
      m.appendChild(h);
      m.appendChild(el('p', 'sub', 'Твоя цель: «' + p.g + '». Сегодня — ещё один шаг к ней.'));
      return m;
    },
    focus: function (p, now) {
      var cat = categoryFor(p.g);
      var tip = cat.tips[(dayOfYear(now) + hash(p.n)) % cat.tips.length];
      var m = el('section', 'mod focus');
      m.appendChild(el('h2', '', 'Фокус дня'));
      m.appendChild(el('span', 'tag', cat.label));
      m.appendChild(el('p', 'big', tip));
      var pr = getProgress(p), done = pr.days.indexOf(isoDay(now)) !== -1;
      var lab = el('label', 'check');
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = done;
      cb.addEventListener('change', function () { toggleToday(p); });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(done ? 'Сделано сегодня ✓' : 'Отметить: сделано сегодня'));
      m.appendChild(lab);
      return m;
    },
    progress: function (p, now) {
      var cat = categoryFor(p.g), pr = getProgress(p);
      var pct = Math.min(100, Math.round(pr.count / pr.target * 100));
      var m = el('section', 'mod progress');
      m.appendChild(el('h2', '', 'Прогресс к цели'));
      m.appendChild(el('p', 'big', pr.count + ' из ' + pr.target + ' ' + cat.unit));
      var bar = el('div', 'progress-bar'), fill = el('div');
      fill.style.width = pct + '%';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.appendChild(fill); m.appendChild(bar);
      var s = streak(pr.days, now);
      m.appendChild(el('p', 'sub', pct + '% · серия: ' + s + ' ' + plural(s, 'день', 'дня', 'дней') + (pct >= 100 ? ' · цель достигнута 🎉' : '')));
      var row = el('div', 'row'); row.style.marginTop = '14px';
      var plus = el('button', 'small', '+1'); plus.type = 'button';
      plus.addEventListener('click', function () { var x = getProgress(p); x.count++; saveProgress(p, x); renderDashboard(); });
      var minus = el('button', 'small ghost', '−1'); minus.type = 'button';
      minus.addEventListener('click', function () { var x = getProgress(p); x.count = Math.max(0, x.count - 1); saveProgress(p, x); renderDashboard(); });
      var tgt = el('button', 'small ghost', 'Цель: ' + pr.target); tgt.type = 'button';
      tgt.addEventListener('click', function () {
        var v = prompt('Сколько ' + cat.unit + ' нужно до цели?', String(pr.target));
        var n = parseInt(v, 10);
        if (n > 0 && n < 100000) { var x = getProgress(p); x.target = n; saveProgress(p, x); renderDashboard(); }
      });
      row.appendChild(plus); row.appendChild(minus); row.appendChild(tgt);
      m.appendChild(row);
      return m;
    },
    clock: function (p, now) {
      var m = el('section', 'mod clock');
      m.appendChild(el('h2', '', 'Сейчас'));
      var t = el('p', 'time'); t.id = 'clockTime';
      var d = el('p', 'sub'); d.id = 'clockDate';
      m.appendChild(t); m.appendChild(d);
      updateClock(t, d);
      return m;
    },
    quote: function (p, now) {
      var q = QUOTES[(dayOfYear(now) + hash(p.g)) % QUOTES.length];
      var m = el('section', 'mod quote');
      m.appendChild(el('h2', '', 'Мысль дня'));
      m.appendChild(el('blockquote', '', q[0]));
      m.appendChild(el('p', 'sub', '— ' + q[1]));
      return m;
    },
    weather: function () {
      var m = el('section', 'mod weather');
      m.appendChild(el('h2', '', 'Погода рядом'));
      if (state.weatherStatus === 'ok' && state.weather) {
        var w = state.weather, info = WMO[w.code] || ['—', '🌡️'];
        m.appendChild(el('p', 'big', info[1] + ' ' + Math.round(w.temp) + '°'));
        m.appendChild(el('p', 'sub', info[0] + ' · ветер ' + Math.round(w.wind) + ' км/ч'));
      } else if (state.weatherStatus === 'loading') {
        m.appendChild(el('p', 'sub', 'Определяю погоду…'));
      } else if (state.weatherStatus === 'error') {
        m.appendChild(el('p', 'sub', 'Не удалось загрузить погоду. Попробуй позже.'));
        m.appendChild(weatherButtons(true));
      } else {
        m.appendChild(el('p', 'sub', 'Покажу погоду там, где ты сейчас. Нужен доступ к геолокации — координаты уходят только в Open-Meteo.'));
        m.appendChild(weatherButtons(false));
      }
      return m;
    }
  };

  function weatherButtons(retry) {
    var row = el('div', 'row'); row.style.marginTop = '14px';
    var yes = el('button', 'small', retry ? 'Повторить' : 'Показать погоду'); yes.type = 'button';
    yes.addEventListener('click', function () { LS.set('weather', 'on'); loadWeather(); });
    var no = el('button', 'small ghost', 'Скрыть'); no.type = 'button';
    no.addEventListener('click', function () { LS.set('weather', 'off'); renderDashboard(); });
    row.appendChild(yes); row.appendChild(no);
    return row;
  }

  function loadWeather() {
    if (!('geolocation' in navigator)) { LS.set('weather', 'off'); renderDashboard(); return; }
    state.weatherStatus = 'loading'; renderDashboard();
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(2), lon = pos.coords.longitude.toFixed(2);
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
        '&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (j) {
          state.weather = { temp: j.current.temperature_2m, code: j.current.weather_code, wind: j.current.wind_speed_10m };
          state.weatherStatus = 'ok'; renderDashboard();
        })
        .catch(function () { state.weatherStatus = 'error'; renderDashboard(); });
    }, function () {
      // Пользователь не разрешил геолокацию — тихо убираем модуль.
      LS.set('weather', 'off');
      state.weatherStatus = 'idle';
      toast('Без геолокации — погоду скрыл');
      renderDashboard();
    }, { timeout: 10000, maximumAge: 1800000 });
  }

  function updateClock(t, d) {
    t = t || $('clockTime'); d = d || $('clockDate');
    if (!t || !d) return;
    var now = new Date();
    t.textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    var ds = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    d.textContent = ds.charAt(0).toUpperCase() + ds.slice(1);
  }

  function renderDashboard() {
    var p = state.profile; if (!p) return;
    var now = new Date();
    var pr = getProgress(p);
    var order = moduleOrder(now.getHours(), {
      doneToday: pr.days.indexOf(isoDay(now)) !== -1,
      weatherOff: LS.get('weather', 'ask') === 'off'
    });
    var box = $('modules');
    box.textContent = '';
    var rest = order.slice(1);
    order.forEach(function (name, i) {
      var node = renderers[name](p, now);
      if (i > 0) {
        var idx = i - 1;
        // первые два модуля — крупные, остальные делят ряд
        var tail = rest.length - 2;
        if (idx >= 2) node.classList.add(tail === 3 ? 'third' : tail === 1 ? 'wide' : 'half');
      }
      box.appendChild(node);
    });
  }

  function showDashboard() {
    var p = state.profile;
    applyAccent(p.c);
    document.title = 'MONOMOD · ' + p.n;
    $('onboarding').classList.add('hidden');
    $('dashboard').classList.remove('hidden');
    $('editBtn').classList.remove('hidden');
    $('shareOut').classList.add('hidden');
    if (state.shared) {
      $('sharedText').textContent = 'Ты смотришь версию MONOMOD для «' + p.n + '».';
      $('sharedBanner').classList.remove('hidden');
    } else {
      $('sharedBanner').classList.add('hidden');
    }
    var box = $('modules');
    box.classList.remove('animate'); void box.offsetWidth; box.classList.add('animate');
    setTimeout(function () { box.classList.remove('animate'); }, 700);
    if (LS.get('weather', 'ask') === 'on' && state.weatherStatus === 'idle') loadWeather();
    renderDashboard();
  }

  function shareUrl(p) {
    return location.origin + location.pathname + '?u=' + encodeProfile(p);
  }
  function cleanUrl() {
    if (location.search) history.replaceState(null, '', location.pathname + location.hash);
  }

  $('shareBtn').addEventListener('click', function () {
    var url = shareUrl(state.profile);
    var out = $('shareOut');
    out.textContent = '';
    out.appendChild(document.createTextNode('Твоя личная ссылка: '));
    var a = el('a', '', url); a.href = url; out.appendChild(a);
    out.classList.remove('hidden');
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.share({ title: 'Мой MONOMOD', url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('Ссылка скопирована'); }, function () { toast('Скопируй ссылку ниже'); });
    } else toast('Скопируй ссылку ниже');
  });

  $('resetBtn').addEventListener('click', function () {
    if (!confirm('Сбросить профиль и прогресс на этом устройстве?')) return;
    if (state.profile && !state.shared) LS.del(progressKey(state.profile));
    if (!state.shared) LS.del('profile');
    LS.del('weather');
    state.profile = null; state.shared = false; state.weatherStatus = 'idle'; state.weather = null;
    cleanUrl();
    startOnboarding(null);
  });

  $('editBtn').addEventListener('click', function () { startOnboarding(state.profile); });
  $('adoptBtn').addEventListener('click', function () {
    LS.set('profile', state.profile);
    state.shared = false; cleanUrl(); showDashboard();
    toast('Теперь это твоя версия');
  });
  $('ownBtn').addEventListener('click', function () {
    state.shared = false; cleanUrl();
    var own = sanitizeProfile(LS.get('profile', null));
    if (own) { state.profile = own; showDashboard(); } else startOnboarding(null);
  });

  // ----- Старт -----
  function init() {
    applyTheme();
    buildOnboardingStatic();
    var params = new URLSearchParams(location.search);
    var own = sanitizeProfile(LS.get('profile', null));
    if (params.has('u')) {
      var sp = decodeProfile(params.get('u'));
      if (sp) {
        state.profile = sp;
        state.shared = !own || profileId(own) !== profileId(sp) || own.c !== sp.c;
        if (!state.shared) cleanUrl();
        showDashboard();
        startTicker();
        return;
      }
      toast('Ссылка повреждена — открываю обычную версию');
      cleanUrl();
    }
    if (own) { state.profile = own; showDashboard(); }
    else startOnboarding(null);
    startTicker();
  }

  var lastPart = partOfDay(new Date().getHours());
  function startTicker() {
    setInterval(function () {
      updateClock();
      applyTheme();
      var part = partOfDay(new Date().getHours());
      if (part !== lastPart) { lastPart = part; if (state.profile && !$('dashboard').classList.contains('hidden')) renderDashboard(); }
    }, 15000);
  }

  init();
})();
