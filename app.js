/* MONOMOD · канон v12.0 — статический сайт без сборки */
(function () {
  'use strict';

  // ---------- Данные канона ----------
  const LAYERS = [
    { id: 'all', name: 'Все' },
    { id: 'core', name: 'CORE' },
    { id: 'full', name: '𝕄_full' },
    { id: 'plus', name: '𝕄+' },
    { id: 'pp', name: '𝕄++' },
    { id: 'mods', name: 'Моды' },
    { id: 'ux', name: 'UX' },
    { id: 'infra', name: 'Инфраструктура' },
    { id: 'app', name: 'Приложения' }
  ];

  const SPECS = [
    ['01', '01-core.md', 'M# — ядро MONOMOD', 'core'],
    ['02', '02-k.md', 'K — базовая константа', 'core'],
    ['03', '03-p1-p10.md', 'p1..p10 — 10 параметров', 'core'],
    ['04', '04-110.347.md', '110.347 — баланс-константа', 'core'],
    ['05', '05-lambda6.md', 'Λ6 — логическая граница', 'core'],
    ['06', '06-gamma6.md', 'Γ6 — генеративная граница', 'core'],
    ['07', '07-alpha6.md', 'Α6 — аналитическая граница', 'core'],
    ['08', '08-git-ops.md', 'GIT-операции', 'full'],
    ['09', '09-vozvrat.md', 'ВОЗВРАТ', 'full'],
    ['10', '10-argmax-s.md', 'argmax S', 'plus'],
    ['11', '11-compose.md', 'Композиция (D2)', 'plus'],
    ['12', '12-hierarchy.md', 'Иерархия (D1)', 'plus'],
    ['13', '13-formula.md', 'Формула (D3)', 'pp'],
    ['14', '14-borders.md', '3 границы', 'pp'],
    ['15', '15-roles.md', '3 роли', 'pp'],
    ['16', '16-balance.md', 'Правило 2 людей', 'pp'],
    ['17', '17-mod-m1.md', 'M1 Сборка', 'mods'],
    ['18', '18-mod-m2.md', 'M2 Возврат', 'mods'],
    ['19', '19-mod-m3.md', 'M3 Оптимизация', 'mods'],
    ['20', '20-mod-m4.md', 'M4 Стабилизация', 'mods'],
    ['21', '21-mod-m5.md', 'M5 Фиксация', 'mods'],
    ['22', '22-scenarios-s1-s9.md', 'Сценарии S1–S9', 'ux'],
    ['23', '23-scenarios-x1-x4.md', 'Сценарии X1–X4', 'ux'],
    ['24', '24-68.md', 'Элемент 68', 'core'],
    ['25', '25-194.md', 'Элемент 194', 'core'],
    ['26', '26-m-hash.md', 'M# — хеш-идентификатор ядра', 'core'],
    ['27', '27-log-access.md', 'Журнал входов/выходов', 'infra'],
    ['28', '28-log-control.md', 'Журнал подписей держателей', 'infra'],
    ['29', '29-log-release.md', 'Журнал релизов v1.0–v12.0', 'infra'],
    ['30', '30-registry.md', 'Реестр 32 файлов', 'infra'],
    ['31', '31-onepage.md', 'Канон ONE PAGE', 'infra'],
    ['32', '32-versions.md', 'Карта 12 версий', 'infra'],
    ['+', 'graph.md', 'Граф зависимостей (приложение)', 'app']
  ].map(([num, file, title, layer]) => ({ num, file, title, layer }));
  const BY_FILE = Object.fromEntries(SPECS.map(s => [s.file, s]));
  const BY_NUM = Object.fromEntries(SPECS.map(s => [s.num, s]));

  // Граф зависимостей — ровно как в разделе 2 канона
  const G_ROWS = [
    [{ id: 'n31', label: '31-onepage', sub: 'канон', files: ['31'] }],
    [{ id: 'n13', label: '13-formula', files: ['13'] }, { id: 'n14', label: '14-borders', files: ['14'] }, { id: 'n15', label: '15-roles', files: ['15'] }],
    [{ id: 'n01', label: '01-core', files: ['01'] }],
    [{ id: 'n02', label: '02-k', files: ['02'] }, { id: 'n05', label: '05-Λ6', files: ['05'] }, { id: 'n24', label: '24-68', files: ['24'] }],
    [{ id: 'n03', label: '03-p1..10', files: ['03'] }, { id: 'n06', label: '06-Γ6', files: ['06'] }, { id: 'n25', label: '25-194', files: ['25'] }],
    [{ id: 'n04', label: '04-110.347', files: ['04'] }],
    [{ id: 'n10', label: '10-argmax', files: ['10'] }, { id: 'n11', label: '11-compose', files: ['11'] }, { id: 'n12', label: '12-hier', files: ['12'] }],
    [{ id: 'nM', label: '17..21 mod-m1..m5', sub: 'M1–M5', files: ['17', '18', '19', '20', '21'], wide: true }],
    [{ id: 'nS', label: '22..23 scenarios', sub: 'S1–S9 · X1–X4', files: ['22', '23'], wide: true }],
    [{ id: 'n32', label: '32-versions', files: ['32'], wide: true }]
  ];
  const G_EDGES = [
    ['n31', 'n13'], ['n31', 'n14'], ['n31', 'n15'],
    ['n13', 'n01'], ['n14', 'n01'], ['n15', 'n01'],
    ['n01', 'n02'], ['n01', 'n05'], ['n01', 'n24'],
    ['n02', 'n03'], ['n05', 'n06'], ['n24', 'n25'],
    ['n03', 'n04'], ['n06', 'n04'], ['n25', 'n04'],
    ['n04', 'n10'], ['n04', 'n11'], ['n04', 'n12'],
    ['n10', 'nM'], ['n11', 'nM'], ['n12', 'nM'],
    ['nM', 'nS'], ['nS', 'n32']
  ];
  const OFF_GRAPH = ['07', '08', '09', '16', '26', '27', '28', '29', '30'];
  const G_NODES = Object.fromEntries(G_ROWS.flat().map(n => [n.id, n]));

  // ---------- Утилиты ----------
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  // ---------- Мини-рендер Markdown ----------
  function inline(s) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      if (/^[\w.\-]+\.md$/.test(u)) return '<a data-spec="' + u + '">' + t + '</a>';
      if (/^https?:\/\//.test(u)) return '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>';
      return t;
    });
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + esc(codes[+i]) + '</code>');
  }
  const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  function md(src) {
    const L = src.replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    const isSpecial = l => /^(```|#{1,6}\s|>|\s*[-*]\s+|\s*\d+\.\s+|\|)/.test(l);
    while (i < L.length) {
      const l = L[i];
      if (/^```/.test(l)) {
        const buf = []; i++;
        while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
        i++;
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
      } else if (/^#{1,6}\s/.test(l)) {
        const m = l.match(/^(#{1,6})\s+(.*)$/);
        out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>');
        i++;
      } else if (/^\|/.test(l) && L[i + 1] && /^\|[\s\-:|]+\|\s*$/.test(L[i + 1])) {
        const head = cells(l); i += 2;
        const rows = [];
        while (i < L.length && /^\|/.test(L[i])) rows.push(cells(L[i++]));
        out.push('<div class="table-wrap"><table><thead><tr>' + head.map(h => '<th>' + inline(h) + '</th>').join('') +
          '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>');
      } else if (/^>/.test(l)) {
        const buf = [];
        while (i < L.length && /^>/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, ''));
        out.push('<blockquote>' + md(buf.join('\n')) + '</blockquote>');
      } else if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
        const ordered = /^\s*\d+\./.test(l);
        const buf = [];
        while (i < L.length && /^\s*([-*]|\d+\.)\s+/.test(L[i])) buf.push(L[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        const tag = ordered ? 'ol' : 'ul';
        out.push('<' + tag + '>' + buf.map(b => '<li>' + inline(b) + '</li>').join('') + '</' + tag + '>');
      } else if (!l.trim()) {
        i++;
      } else {
        const buf = [];
        while (i < L.length && L[i].trim() && !isSpecial(L[i])) buf.push(L[i++]);
        out.push('<p>' + inline(buf.join(' ')) + '</p>');
      }
    }
    return out.join('\n');
  }

  // ---------- Загрузка спек ----------
  const cache = new Map();
  function loadSpec(file) {
    if (!cache.has(file)) {
      cache.set(file, fetch('specs/' + encodeURIComponent(file), { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).catch(e => { cache.delete(file); throw e; }));
    }
    return cache.get(file);
  }
  function renderSpecInto(el, file) {
    el.innerHTML = '<p class="muted">Загрузка ' + esc(file) + '…</p>';
    return loadSpec(file).then(txt => {
      el.innerHTML = '<div class="md">' + md(txt) +
        '<p class="md-meta">Источник: <a href="specs/' + esc(file) + '" target="_blank" rel="noopener">specs/' + esc(file) + '</a></p></div>';
    }).catch(err => {
      el.innerHTML = '<p class="err">Не удалось загрузить specs/' + esc(file) + ' (' + esc(err.message) + ').</p>';
    });
  }

  // ---------- Тема ----------
  const THEMES = ['auto', 'dark', 'light'];
  const THEME_LABEL = { auto: 'Авто', dark: 'Тёмная', light: 'Светлая' };
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  let themeMode = store.get('monomod.theme') || 'auto';
  function applyTheme() {
    const t = themeMode === 'auto' ? (mq && mq.matches ? 'light' : 'dark') : themeMode;
    document.documentElement.setAttribute('data-theme', t);
    $('#themeLabel').textContent = THEME_LABEL[themeMode];
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f6f5f2' : '#0e0e0e');
  }
  $('#themeToggle').addEventListener('click', () => {
    themeMode = THEMES[(THEMES.indexOf(themeMode) + 1) % THEMES.length];
    store.set('monomod.theme', themeMode);
    applyTheme();
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);
  applyTheme();

  // ---------- Браузер файлов ----------
  let curLayer = 'all';
  let curFile = null;
  function renderTabs() {
    $('#layerTabs').innerHTML = LAYERS.map(l => {
      const n = l.id === 'all' ? 32 : SPECS.filter(s => s.layer === l.id).length;
      return '<button type="button" role="tab" data-layer="' + l.id + '" aria-selected="' + (l.id === curLayer) + '">' +
        esc(l.name) + '<span class="n">' + n + '</span></button>';
    }).join('');
  }
  function renderList() {
    const list = curLayer === 'all' ? SPECS.filter(s => s.layer !== 'app') : SPECS.filter(s => s.layer === curLayer);
    let html = '';
    if (curLayer === 'all') {
      LAYERS.filter(l => l.id !== 'all' && l.id !== 'app').forEach(l => {
        html += '<li class="layer-h">' + esc(l.name) + '</li>';
        list.filter(s => s.layer === l.id).forEach(s => { html += item(s); });
      });
    } else list.forEach(s => { html += item(s); });
    $('#fileList').innerHTML = html;
    function item(s) {
      return '<li><button type="button" data-file="' + s.file + '"' + (s.file === curFile ? ' class="active"' : '') + '>' +
        '<span class="num">' + s.num + '</span><span><span class="ttl">' + esc(s.title) + '</span><span class="fname">' + esc(s.file) + '</span></span></button></li>';
    }
  }
  function openFile(file, opts = {}) {
    const s = BY_FILE[file];
    if (!s) return;
    curFile = file;
    if (curLayer !== 'all' && curLayer !== s.layer) curLayer = s.layer;
    if (s.layer === 'app') curLayer = 'app';
    renderTabs(); renderList();
    renderSpecInto($('#viewer'), file);
    if (!opts.noHash && history.replaceState) history.replaceState(null, '', '#spec=' + encodeURIComponent(file));
    if (opts.scroll) $('#files').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('#layerTabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-layer]');
    if (!b) return;
    curLayer = b.dataset.layer;
    renderTabs(); renderList();
    const list = SPECS.filter(s => curLayer === 'all' ? s.layer !== 'app' : s.layer === curLayer);
    if (!curFile || !list.some(s => s.file === curFile)) openFile(list[0].file);
  });
  $('#fileList').addEventListener('click', e => {
    const b = e.target.closest('button[data-file]');
    if (b) openFile(b.dataset.file);
  });

  // ---------- Граф ----------
  const children = {};
  G_EDGES.forEach(([a, b]) => { (children[a] = children[a] || []).push(b); });
  function descendants(id) {
    const seen = new Set(); const st = [id];
    while (st.length) { const x = st.pop(); (children[x] || []).forEach(c => { if (!seen.has(c)) { seen.add(c); st.push(c); } }); }
    return seen;
  }
  function renderGraph() {
    $('#graphRows').innerHTML = G_ROWS.map(row => '<div class="g-row">' + row.map(n =>
      '<button type="button" class="g-node' + (n.wide ? ' wide' : '') + '" data-node="' + n.id + '" title="' +
      esc(n.files.map(f => BY_NUM[f].file).join(', ')) + '">' + esc(n.label) +
      (n.sub ? '<small>' + esc(n.sub) + '</small>' : '') + '</button>').join('') + '</div>').join('');
    $('#offGraph').innerHTML = OFF_GRAPH.map(n => '<button type="button" class="chip ghost" data-off="' + n + '">' + esc(BY_NUM[n].file) + '</button>').join('');
    drawEdges();
  }
  function drawEdges(hot) {
    const box = $('#graphBox'); const svg = $('#edges');
    const br = box.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + br.width + ' ' + br.height);
    let p = '<defs>' +
      '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--line);stroke:none"/></marker>' +
      '<marker id="arh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--accent);stroke:none"/></marker></defs>';
    G_EDGES.forEach(([a, b]) => {
      const ea = box.querySelector('[data-node="' + a + '"]'); const eb = box.querySelector('[data-node="' + b + '"]');
      if (!ea || !eb) return;
      const ra = ea.getBoundingClientRect(); const rb = eb.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - br.left, y1 = ra.bottom - br.top;
      const x2 = rb.left + rb.width / 2 - br.left, y2 = rb.top - br.top - 1;
      const my = (y1 + y2) / 2;
      const isHot = hot && hot.has(a) && hot.has(b);
      p += '<path class="' + (isHot ? 'hot' : '') + '" marker-end="url(#' + (isHot ? 'arh' : 'ar') + ')" d="M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + my + ',' + x2 + ' ' + my + ',' + x2 + ' ' + y2 + '"/>';
    });
    svg.innerHTML = p;
  }
  let hotSet = null;
  function ruleFor(nums) {
    if (nums.includes('01')) return 'core';
    if (nums.includes('02') || nums.includes('03')) return 'kp';
    if (nums.some(n => ['05', '06', '07'].includes(n))) return 'borders';
    if (nums.includes('13')) return 'formula';
    return null;
  }
  const IMPACT = {
    core: 'Изменение 01-core → пересчёт всех 32 файлов.',
    kp: 'Изменение K / p1..p10 → триггер 04-110.347 → возможен X4. Нужны подписи обоих держателей.',
    borders: 'Изменение границы → пересборка мод M4 (Стабилизация).',
    formula: 'Изменение формулы → только через D3 с двумя подписями.'
  };
  function selectGraph(nodeId, offNum) {
    const nums = nodeId ? G_NODES[nodeId].files : [offNum];
    document.querySelectorAll('.g-node').forEach(el => el.classList.remove('sel', 'hot'));
    document.querySelectorAll('#offGraph .chip').forEach(el => el.classList.remove('sel-chip'));
    let downstream = new Set();
    const rule = ruleFor(nums);
    if (nodeId) {
      downstream = descendants(nodeId);
      if (rule === 'core') Object.keys(G_NODES).forEach(k => downstream.add(k));
      downstream.delete(nodeId);
      hotSet = new Set([nodeId, ...downstream]);
      if (rule === 'core') hotSet = new Set(Object.keys(G_NODES));
      document.querySelector('[data-node="' + nodeId + '"]').classList.add('sel');
      downstream.forEach(d => { const el = document.querySelector('[data-node="' + d + '"]'); if (el) el.classList.add('hot'); });
    } else {
      hotSet = null;
      if (rule === 'borders') { const m = document.querySelector('[data-node="nM"]'); if (m) m.classList.add('hot'); }
    }
    drawEdges(hotSet);
    document.querySelectorAll('#rulesList li').forEach(li => li.classList.toggle('on', li.dataset.rule === rule));

    const panel = $('#graphSpec');
    let head = '';
    if (rule) head += '<p class="impact">' + esc(IMPACT[rule]) + '</p>';
    else if (nodeId && downstream.size) head += '<p class="impact">Ниже по графу зависят узлов: ' + downstream.size + '.</p>';
    if (!nodeId) head += '<p class="muted" style="font-size:.85rem">Этот файл на схеме канона не изображён.</p>';
    if (nums.length > 1) {
      head += '<div class="multi-tabs">' + nums.map((n, i) => '<button type="button" class="small' + (i ? ' ghost' : '') + '" data-gfile="' + BY_NUM[n].file + '">' + n + '</button>').join('') + '</div>';
    }
    panel.innerHTML = head + '<div id="gSpecBody"></div>';
    renderSpecInto($('#gSpecBody'), BY_NUM[nums[0]].file);
    if (window.innerWidth <= 980) $('#graphPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  $('#graphRows').addEventListener('click', e => {
    const b = e.target.closest('[data-node]');
    if (b) selectGraph(b.dataset.node);
  });
  $('#offGraph').addEventListener('click', e => {
    const b = e.target.closest('[data-off]');
    if (b) selectGraph(null, b.dataset.off);
  });
  $('#graphSpec').addEventListener('click', e => {
    const b = e.target.closest('[data-gfile]');
    if (!b) return;
    b.parentElement.querySelectorAll('button').forEach(x => x.classList.add('ghost'));
    b.classList.remove('ghost');
    renderSpecInto($('#gSpecBody'), b.dataset.gfile);
  });
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => drawEdges(hotSet), 80); });
  if (window.ResizeObserver) new ResizeObserver(() => drawEdges(hotSet)).observe($('#graphBox'));

  // Глобальные ссылки на спеки (канон, держатели, ссылки внутри markdown)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-spec]');
    if (!a) return;
    e.preventDefault();
    const inViewer = a.closest('#viewer');
    openFile(a.dataset.spec, { scroll: !inViewer });
  });

  // ---------- Проверка баланса ----------
  const TARGET = 110.347;
  const KEYS = ['K', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
  $('#balInputs').innerHTML = KEYS.map(k =>
    '<label class="' + (k === 'K' ? 'k' : '') + '"><span>' + k + '</span><input inputmode="decimal" data-k="' + k + '" placeholder="' + (k === 'K' ? 'значение K' : '—') + '" aria-label="' + k + '"></label>').join('');
  const inputs = KEYS.map(k => $('#balInputs input[data-k="' + k + '"]'));
  const fmt = x => String(parseFloat(x.toFixed(9)));
  function parse(v) {
    v = v.trim().replace(/\s/g, '').replace(',', '.');
    if (v === '') return { empty: true };
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(v)) return { bad: true };
    return { val: Number(v) };
  }
  function check(fromReturn) {
    let sum = 0, filled = 0, bad = 0;
    const vals = [];
    inputs.forEach(inp => {
      const r = parse(inp.value);
      inp.classList.toggle('bad', !!r.bad);
      if (r.bad) bad++;
      else if (!r.empty) { filled++; sum += r.val; }
      vals.push(inp.value);
    });
    sum = Math.round(sum * 1e9) / 1e9;
    const st = $('#balState'), title = $('#balTitle'), det = $('#balDetail'), ret = $('#balReturn');
    $('#balSum').textContent = filled ? fmt(sum) : '—';
    ret.classList.add('hidden');
    if (bad) {
      st.dataset.state = 'empty';
      title.textContent = 'Есть нечисловые значения';
      det.textContent = 'Исправь поля, подсвеченные красным. Дробная часть — через точку или запятую.';
    } else if (filled < KEYS.length) {
      st.dataset.state = 'empty';
      title.textContent = filled ? 'Заполнено ' + filled + ' из 11' : 'Введите K и p1..p10';
      det.textContent = 'Проверка S3 запускается, когда заданы все 11 значений: K + p1..p10.';
    } else if (Math.abs(sum - TARGET) < 1e-9) {
      st.dataset.state = 'ok';
      title.textContent = 'K + p1..p10 = 110.347 ✓ Баланс замкнут';
      det.innerHTML = fromReturn ? 'ВОЗВРАТ выполнен: восстановлено последнее сбалансированное состояние. Верификация пройдена.' : 'Инвариант соблюдён. Изменение вступит в силу только с подписями обоих держателей (S3, S4, S7).';
      store.set('monomod.balance.last', JSON.stringify(vals));
    } else {
      const d = Math.round((sum - TARGET) * 1e9) / 1e9;
      st.dataset.state = 'x4';
      title.textContent = 'X4 → ВОЗВРАТ';
      det.innerHTML = 'K + p1..p10 = <b>' + esc(fmt(sum)) + '</b> ≠ 110.347 (Δ = ' + (d > 0 ? '+' : '') + esc(fmt(d)) + ')' +
        '<ul><li>оба держателя уведомляются одновременно</li><li>активируется X4</li><li>система блокируется до отката</li><li>далее: ВОЗВРАТ → верификация</li></ul>';
      ret.classList.remove('hidden');
      ret.textContent = store.get('monomod.balance.last') ? 'ВОЗВРАТ к последнему балансу' : 'ВОЗВРАТ (очистить)';
    }
  }
  $('#balInputs').addEventListener('input', () => check(false));
  $('#balClear').addEventListener('click', () => { inputs.forEach(i => { i.value = ''; }); check(false); });
  $('#balReturn').addEventListener('click', () => {
    let last = null;
    try { last = JSON.parse(store.get('monomod.balance.last') || 'null'); } catch (e) { last = null; }
    inputs.forEach((inp, i) => { inp.value = last ? (last[i] || '') : ''; });
    check(!!last);
  });
  check(false);

  // ---------- Навигация ----------
  if (window.IntersectionObserver) {
    const links = Object.fromEntries([...document.querySelectorAll('.nav a')].map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          Object.values(links).forEach(a => a.classList.remove('active'));
          if (links[en.target.id]) links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main > section').forEach(s => io.observe(s));
  }

  // ---------- Старт ----------
  renderTabs();
  renderGraph();
  const m = location.hash.match(/^#spec=(.+)$/);
  const start = m && BY_FILE[decodeURIComponent(m[1])] ? decodeURIComponent(m[1]) : '31-onepage.md';
  openFile(start, { scroll: !!m, noHash: !m });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawEdges(hotSet));
})();
