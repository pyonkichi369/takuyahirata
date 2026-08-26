// 間の庭 — application layer. Views, daily flow, transitions.

import {
  ELEMENTS, ELEMENT_ORDER, ELEMENT_NUDGES, DECLARATIONS,
  EVIDENCE_TYPES, EVIDENCE_ELEMENT, GOMA_CATEGORIES,
  LEVEL_STATES, LEDGER_FIELDS, dayElement, localDayNumber,
  CLOSING_MORNING, CLOSING_NIGHT,
} from './data.js';
import * as S from './state.js';
import { todayUnki } from './unki.js';
import { drawSigil, drawMandala } from './mandala.js';
import { ringBell, fireCrackle, startDrone, stopDrone, droneActive } from './audio.js';

const $ = (id) => document.getElementById(id);

// ── view switching — places, not pages ───────────────
const VIEWS = ['gate', 'honden', 'ganden', 'gogyo', 'goma', 'shikigami', 'kudoku', 'juyosho', 'genjitsu'];
let current = 'gate';

function show(view) {
  for (const v of VIEWS) {
    const node = $('view-' + v);
    if (v === view) {
      node.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => node.classList.add('is-active')));
    } else {
      node.classList.remove('is-active');
      node.hidden = true;
    }
  }
  $('places').hidden = view === 'gate';
  document.querySelectorAll('#places [data-view]').forEach((b) => {
    b.classList.toggle('is-here', b.dataset.view === view);
  });
  current = view;
  const render = RENDERERS[view];
  if (render) render();
  window.scrollTo({ top: 0 });
}

// ── 入界門 ───────────────────────────────────────────
function initGate() {
  const now = new Date();
  const el = ELEMENTS[dayElement(now)];
  $('gate-date').textContent =
    `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 — きょうの気は「${el.name}」`;
  drawSigil($('gate-sigil'), { lit: 0 });

  // The garden has no barrier — the bell is a pleasure, not a lock.
  $('btn-bell').addEventListener('click', () => {
    ringBell();
    if (S.getState().soundEnabled === null) S.setSound(true);
    drawSigil($('gate-sigil'), { lit: 1 });
    $('gate-sigil').classList.add('sigil-lit');
  });
  $('btn-enter').addEventListener('click', () => {
    if (S.getState().soundEnabled === null) S.setSound(false);
    S.markEntered();
    document.body.classList.add('entered');
    show('honden');
  });
}

// ── 本殿 ─────────────────────────────────────────────
function renderHonden() {
  const lvl = S.level();
  $('hall-level').textContent = `庭の育ち ${lvl} — 歩み ${S.getState().reiryoku}`;
  drawMandala($('mandala'), { level: lvl, reiryoku: S.getState().reiryoku });
  $('mandala-state').textContent = LEVEL_STATES[Math.min(lvl, LEVEL_STATES.length) - 1];

  const dayN = localDayNumber();
  $('declaration').textContent = DECLARATIONS[dayN % DECLARATIONS.length];

  renderUnki();
  renderMantraBlock();
  renderOracle();
  renderActionZone();
  renderGogyoMini();
}

function renderMantraBlock() {
  const m = S.todayMantra();
  $('mantra-text').textContent = m ? m.text : '';
  const done = S.todayRitual().chanted;
  $('btn-chant').hidden = false;
  $('btn-chant').disabled = !!done;
  const after = $('mantra-after');
  after.hidden = !done;
  if (done) after.textContent = '口にした言葉は、少しずつじぶんの声になる。';
}
$('btn-chant').addEventListener('click', () => {
  const text = $('mantra-text');
  let count = 0;
  text.classList.add('chanting');
  const pulse = setInterval(() => {
    count++;
    text.classList.remove('chanting');
    void text.offsetWidth; // restart the pulse animation
    text.classList.add('chanting');
    if (count >= 2) {
      clearInterval(pulse);
      setTimeout(() => {
        text.classList.remove('chanting');
        S.chantToday();
        renderHonden();
      }, 900);
    }
  }, 900);
  $('btn-chant').disabled = true;
});

function renderUnki() {
  const u = todayUnki();
  $('unki-kanshi').textContent = u.kanshi;
  $('unki-grade').textContent = u.grade;
  $('unki-line').textContent = u.line;
  $('unki-lucky').textContent =
    `きょうの追い風は「${u.luckyName}」— ${ELEMENTS[u.luckyElement].domain}`;
  renderUnkiEngi();
}

function renderOracle() {
  const r = S.todayRitual();
  const share = $('oracle-share');
  if (r.oracle) {
    $('btn-oracle').hidden = true;
    const q = $('oracle-text');
    q.hidden = false;
    q.textContent = r.oracle;
    share.hidden = false;
    share.href = 'https://x.com/intent/post?text=' +
      encodeURIComponent('きょうの便り —「' + r.oracle + '」\n#間の庭\nhttps://takuyahirata.com');
  } else {
    $('btn-oracle').hidden = false;
    $('oracle-text').hidden = true;
    share.hidden = true;
  }
}
$('btn-oracle').addEventListener('click', () => {
  S.drawOracle();
  renderOracle();
  $('oracle-text').classList.add('reveal');
});

function actionPicker(onPick) {
  const { candidates, recommended } = S.actionCandidates();
  const wrap = document.createElement('div');
  wrap.className = 'action-picker';
  for (const c of candidates) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'action-option' + (c.element === recommended ? ' is-recommended' : '');
    const mark = document.createElement('span');
    mark.className = 'el-mark el-' + c.element;
    mark.textContent = ELEMENTS[c.element].name;
    b.appendChild(mark);
    b.appendChild(document.createTextNode(c.text));
    if (c.element === recommended) {
      const rec = document.createElement('span');
      rec.className = 'rec-mark';
      rec.textContent = '薦';
      b.appendChild(rec);
    }
    b.addEventListener('click', () => onPick(c.text, c.element));
    wrap.appendChild(b);
  }
  return wrap;
}

function renderActionZone() {
  const zone = $('action-zone');
  zone.replaceChildren();
  const r = S.todayRitual();

  if (!r.action) {
    zone.appendChild(actionPicker((text, el) => { S.chooseAction(text, el); renderHonden(); }));
    return;
  }
  const card = document.createElement('div');
  card.className = 'action-card' + (r.completed ? ' is-done' : '');
  const mark = document.createElement('span');
  mark.className = 'el-mark el-' + (r.actionElement || 'earth');
  mark.textContent = ELEMENTS[r.actionElement || 'earth'].name;
  const text = document.createElement('p');
  text.textContent = r.action;
  card.appendChild(mark);
  card.appendChild(text);
  if (r.completed) {
    const done = document.createElement('p');
    done.className = 'action-done-line';
    done.textContent = r.unkiBonus
      ? `できた。満ちる日のぶん、歩みが少し多く積もる（+${3 + r.unkiBonus}）`
      : 'できた。庭に歩みが積もる（+3）';
    card.appendChild(done);
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-fuda';
    btn.textContent = '行いを果たした';
    btn.addEventListener('click', () => { S.completeAction(); renderHonden(); });
    card.appendChild(btn);
  }
  zone.appendChild(card);
}

function renderGogyoMini() {
  const scores = S.elementScores();
  const wrap = $('gogyo-mini');
  wrap.replaceChildren();
  for (const key of ELEMENT_ORDER) {
    const cell = document.createElement('div');
    cell.className = 'gogyo-cell';
    const mark = document.createElement('span');
    mark.className = 'el-mark el-' + key;
    mark.textContent = ELEMENTS[key].name;
    const st = document.createElement('span');
    st.className = 'gogyo-state';
    st.textContent = S.elementState(scores[key]);
    cell.appendChild(mark);
    cell.appendChild(st);
    wrap.appendChild(cell);
  }
  $('gogyo-nudge').textContent = S.elementNudge() || '';
}

$('btn-close-world').addEventListener('click', () => {
  const r = S.todayRitual();
  r.closed = true;
  S.save();
  const line = $('close-line');
  line.hidden = false;
  const hasEvidenceToday = S.getState().evidence.some(
    (e) => e.date.slice(0, 10) === S.todayKey());
  line.textContent = (r.completed || hasEvidenceToday) ? CLOSING_NIGHT : CLOSING_MORNING;
});

// ── 願殿 ─────────────────────────────────────────────
let wishElement = 'fire';

function renderGanden() {
  renderWishes();
  renderWishForm();
  renderMantraBoard();
}

function renderWishes() {
  const list = $('wish-list');
  list.replaceChildren();
  const all = S.wishes();
  const active = all.filter((w) => !w.fulfilled);
  const fulfilled = all.filter((w) => w.fulfilled);

  if (!all.length) {
    const p = document.createElement('p');
    p.className = 'empty-line';
    p.textContent = 'まだ短冊はありません。最初のひとつを。';
    list.appendChild(p);
  }

  for (const w of active) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    const head = document.createElement('div');
    head.className = 'wish-head';
    const mark = document.createElement('span');
    mark.className = 'el-mark el-' + w.element;
    mark.textContent = ELEMENTS[w.element].name;
    const days = Math.max(0, Math.floor((Date.now() - new Date(w.vowedAt).getTime()) / 86400000));
    const meta = document.createElement('span');
    meta.className = 'wish-meta';
    meta.textContent = days === 0 ? 'きょう掛けた' : `掛けて${days}日`;
    head.appendChild(mark);
    head.appendChild(meta);
    card.appendChild(head);
    const text = document.createElement('p');
    text.className = 'wish-text';
    text.textContent = w.text;
    card.appendChild(text);
    if (w.firstStep) {
      const step = document.createElement('p');
      step.className = 'wish-step';
      step.textContent = '一歩: ' + w.firstStep;
      card.appendChild(step);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-fuda btn-fulfill';
    btn.textContent = '叶った';
    btn.addEventListener('click', () => {
      S.fulfillWish(w.id);
      renderGanden();
    });
    card.appendChild(btn);
    list.appendChild(card);
  }

  if (fulfilled.length) {
    const label = document.createElement('p');
    label.className = 'block-label wish-done-label';
    label.textContent = `叶ったねがい — ${fulfilled.length}`;
    list.appendChild(label);
    for (const w of fulfilled.slice().reverse()) {
      const row = document.createElement('p');
      row.className = 'wish-fulfilled';
      row.textContent = `${(w.fulfilledAt || '').slice(0, 10)} — ${w.text}`;
      list.appendChild(row);
    }
  }
}

function renderWishForm() {
  const form = $('wish-form');
  const limitReached = S.activeWishes().length >= 3;
  $('wish-limit').hidden = !limitReached;
  form.querySelectorAll('textarea, input, button').forEach((n) => { n.disabled = limitReached; });
  if (limitReached) return;
  $('btn-vow').disabled = $('wish-text').value.trim().length === 0;

  const elWrap = $('wish-el');
  if (!elWrap.childElementCount) {
    for (const key of ELEMENT_ORDER) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'el-mark el-' + key + (key === wishElement ? ' is-on' : '');
      b.textContent = ELEMENTS[key].name;
      b.title = ELEMENTS[key].domain;
      b.addEventListener('click', () => {
        wishElement = key;
        elWrap.querySelectorAll('button').forEach((x) =>
          x.classList.toggle('is-on', x.textContent === ELEMENTS[key].name));
      });
      elWrap.appendChild(b);
    }
  }
}

$('wish-text').addEventListener('input', () => {
  $('btn-vow').disabled = $('wish-text').value.trim().length === 0;
});
$('wish-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const added = S.addWish({
    text: $('wish-text').value.trim(),
    firstStep: $('wish-step').value.trim(),
    element: wishElement,
  });
  if (added) {
    $('wish-text').value = '';
    $('wish-step').value = '';
    renderGanden();
  }
});

function renderMantraBoard() {
  const list = $('mantra-list');
  list.replaceChildren();
  const today = S.todayMantra();
  for (const m of S.mantras()) {
    const row = document.createElement('div');
    row.className = 'mantra-row' + (today && m.id === today.id ? ' is-today' : '');
    const text = document.createElement('p');
    text.textContent = m.text;
    row.appendChild(text);
    const meta = document.createElement('span');
    meta.className = 'mantra-meta';
    meta.textContent = m.chants ? `唱和 ${m.chants}` : '';
    row.appendChild(meta);
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'mantra-del';
    del.textContent = '了';
    del.title = 'この言葉は役目を終えた（帳から外す）';
    del.addEventListener('click', () => { S.removeMantra(m.id); renderGanden(); });
    row.appendChild(del);
    list.appendChild(row);
  }
}

$('mantra-input').addEventListener('input', () => {
  $('btn-mantra-add').disabled = $('mantra-input').value.trim().length === 0;
});
$('btn-mantra-add').addEventListener('click', () => {
  if (S.addMantra($('mantra-input').value, 'direct')) {
    $('mantra-input').value = '';
    $('btn-mantra-add').disabled = true;
    renderMantraBoard();
  }
});

// ── 五行の間 ─────────────────────────────────────────
function renderGogyo() {
  const scores = S.elementScores();
  const wrap = $('gogyo-full');
  wrap.replaceChildren();
  for (const key of ELEMENT_ORDER) {
    const e = ELEMENTS[key];
    const row = document.createElement('div');
    row.className = 'gogyo-row';
    const head = document.createElement('div');
    head.className = 'gogyo-row-head';
    const mark = document.createElement('span');
    mark.className = 'el-mark el-lg el-' + key;
    mark.textContent = e.name;
    const name = document.createElement('div');
    const domain = document.createElement('p');
    domain.className = 'gogyo-domain';
    domain.textContent = e.domain;
    const st = document.createElement('p');
    st.className = 'gogyo-state';
    st.textContent = S.elementState(scores[key]);
    name.appendChild(st);
    name.appendChild(domain);
    head.appendChild(mark);
    head.appendChild(name);
    const bar = document.createElement('div');
    bar.className = 'gogyo-bar';
    const fill = document.createElement('span');
    fill.className = 'gogyo-fill el-bg-' + key;
    fill.style.width = Math.min(100, scores[key] * 20) + '%';
    bar.appendChild(fill);
    row.appendChild(head);
    row.appendChild(bar);
    if (scores[key] === 0) {
      const nudge = document.createElement('p');
      nudge.className = 'gogyo-nudge';
      nudge.textContent = ELEMENT_NUDGES[key];
      row.appendChild(nudge);
    }
    wrap.appendChild(row);
  }
}

// ── 護摩壇 ───────────────────────────────────────────
let gomaCategory = 'その他';
function initGoma() {
  const cats = $('goma-cats');
  for (const c of GOMA_CATEGORIES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.className = c === gomaCategory ? 'is-on' : '';
    b.addEventListener('click', () => {
      gomaCategory = c;
      cats.querySelectorAll('button').forEach((x) => x.classList.toggle('is-on', x.textContent === c));
    });
    cats.appendChild(b);
  }
  $('goma-input').addEventListener('input', () => {
    $('btn-goma').disabled = $('goma-input').value.trim().length === 0;
  });
  $('btn-goma').addEventListener('click', burnGoma);

  // 書き換えの儀 — the replacement belief becomes a mantra
  $('goma-rewrite-input').addEventListener('input', () => {
    $('btn-goma-rewrite').disabled = $('goma-rewrite-input').value.trim().length === 0;
  });
  $('btn-goma-rewrite').addEventListener('click', () => {
    if (S.addMantra($('goma-rewrite-input').value, 'goma')) {
      $('goma-rewrite-input').value = '';
      $('btn-goma-rewrite').disabled = true;
      $('goma-rewrite-done').hidden = false;
    }
  });
}

function burnGoma() {
  const text = $('goma-input').value.trim();
  if (!text) return;
  $('goma-fuda').textContent = text;
  $('goma-form').hidden = true;
  const fire = $('goma-fire');
  fire.hidden = false;
  requestAnimationFrame(() => fire.classList.add('burning'));
  if (S.getState().soundEnabled) fireCrackle();
  S.logGoma(gomaCategory);
  setTimeout(() => {
    fire.hidden = true;
    fire.classList.remove('burning');
    const after = $('goma-after');
    after.hidden = false;
    $('goma-rewrite-input').value = '';
    $('btn-goma-rewrite').disabled = true;
    $('goma-rewrite-done').hidden = true;
    const next = $('goma-next');
    next.replaceChildren();
    const label = document.createElement('p');
    label.className = 'block-label';
    label.textContent = '手放したあとの一歩をひとつ';
    next.appendChild(label);
    next.appendChild(actionPicker((t, el) => {
      const r = S.todayRitual();
      if (!r.action) S.chooseAction(t, el);
      after.hidden = true;
      $('goma-form').hidden = false;
      $('goma-input').value = '';
      $('btn-goma').disabled = true;
      show('honden');
    }));
  }, 3000);
}

// ── 式神殿 ───────────────────────────────────────────
function renderShikigami() {
  const list = $('shikigami-list');
  list.replaceChildren();
  for (const s of S.shikigami()) {
    const card = document.createElement('div');
    card.className = 'shiki-card';
    const field = (label, key, type = 'text') => {
      const l = document.createElement('label');
      l.textContent = label;
      const i = document.createElement('input');
      i.type = type;
      i.value = s[key] ?? '';
      if (type === 'number') i.min = '0';
      i.addEventListener('change', () => {
        S.updateShikigami(s.id, { [key]: type === 'number' ? Number(i.value) || 0 : i.value });
      });
      l.appendChild(i);
      return l;
    };
    const head = document.createElement('div');
    head.className = 'shiki-head';
    const nameInput = document.createElement('input');
    nameInput.className = 'shiki-name';
    nameInput.value = s.name;
    nameInput.addEventListener('change', () => S.updateShikigami(s.id, { name: nameInput.value }));
    const statusSel = document.createElement('select');
    for (const st of ['待機', '稼働', '休眠']) {
      const o = document.createElement('option');
      o.value = st; o.textContent = st; o.selected = s.status === st;
      statusSel.appendChild(o);
    }
    statusSel.addEventListener('change', () => S.updateShikigami(s.id, { status: statusSel.value }));
    head.appendChild(nameInput);
    head.appendChild(statusSel);
    card.appendChild(head);
    const role = document.createElement('p');
    role.className = 'shiki-role';
    role.textContent = s.role;
    card.appendChild(role);
    card.appendChild(field('最後に担った仕事', 'lastTask'));
    card.appendChild(field('担った時間（時間）', 'hoursSaved', 'number'));
    card.appendChild(field('生み出した価値', 'valueCreated'));
    list.appendChild(card);
  }
}

// ── 功徳帳 ───────────────────────────────────────────
function initKudoku() {
  const sel = $('ev-type');
  for (const t of EVIDENCE_TYPES) {
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    sel.appendChild(o);
  }
  $('kudoku-form').addEventListener('submit', (e) => {
    e.preventDefault();
    S.addEvidence({
      type: sel.value,
      valueGiven: $('ev-given').value.trim(),
      valueReturned: $('ev-returned').value.trim(),
      amount: Number($('ev-amount').value) || 0,
      note: $('ev-note').value.trim(),
    });
    $('kudoku-form').reset();
    renderKudoku();
  });
}

function renderKudoku() {
  const list = $('kudoku-list');
  list.replaceChildren();
  const entries = [...S.getState().evidence].reverse().slice(0, 60);
  if (!entries.length) {
    const p = document.createElement('p');
    p.className = 'empty-line';
    p.textContent = 'まだ記録はありません。最初のひとつを。';
    list.appendChild(p);
    return;
  }
  for (const ev of entries) {
    const card = document.createElement('div');
    card.className = 'kudoku-card';
    const head = document.createElement('div');
    head.className = 'kudoku-head';
    const type = document.createElement('span');
    type.className = 'kudoku-type';
    type.textContent = ev.type;
    const date = document.createElement('span');
    date.className = 'kudoku-date';
    date.textContent = ev.date.slice(0, 10);
    head.appendChild(type);
    head.appendChild(date);
    card.appendChild(head);
    const line = (label, value) => {
      if (!value) return;
      const p = document.createElement('p');
      const b = document.createElement('span');
      b.className = 'kudoku-label';
      b.textContent = label;
      p.appendChild(b);
      p.appendChild(document.createTextNode(value));
      card.appendChild(p);
    };
    line('与えた価値', ev.valueGiven);
    line('還ったもの', ev.valueReturned);
    if (ev.amount > 0) line('金額', ev.amount.toLocaleString('ja-JP') + ' 円');
    line('気づき', ev.note);
    const el = ev.element || EVIDENCE_ELEMENT[ev.type] || 'metal';
    const gain = document.createElement('p');
    gain.className = 'kudoku-gain el-text-' + el;
    gain.textContent = ELEMENTS[el].name + 'のめぐりが、ひとつ増えた';
    card.appendChild(gain);
    list.appendChild(card);
  }
}

// ── 現世の帳 ─────────────────────────────────────────
function renderLedger() {
  const wrap = $('ledger');
  wrap.replaceChildren();
  const ledger = S.getState().ledger;
  const form = document.createElement('div');
  form.className = 'ledger-grid';
  const inputs = {};
  for (const f of LEDGER_FIELDS) {
    const cell = document.createElement('label');
    cell.className = 'ledger-cell';
    const name = document.createElement('span');
    name.className = 'ledger-name';
    name.textContent = f.label;
    const real = document.createElement('span');
    real.className = 'ledger-real';
    real.textContent = f.real + '（' + f.unit + '）';
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.value = ledger[f.key] ?? '';
    input.placeholder = '—';
    inputs[f.key] = input;
    cell.appendChild(name);
    cell.appendChild(real);
    cell.appendChild(input);
    form.appendChild(cell);
  }
  wrap.appendChild(form);

  const save = document.createElement('button');
  save.className = 'btn-fuda';
  save.type = 'button';
  save.textContent = '帳面をつける';
  save.addEventListener('click', () => {
    const values = {};
    for (const [k, i] of Object.entries(inputs)) {
      if (i.value !== '') values[k] = Number(i.value);
    }
    S.setLedger(values);
    renderLedger();
  });
  wrap.appendChild(save);

  const cash = Number(ledger.cash) || 0;
  const fixed = Number(ledger.fixed) || 0;
  const recurring = Number(ledger.recurring) || 0;
  const burn = fixed - recurring;
  const summary = document.createElement('div');
  summary.className = 'ledger-summary';
  const runway = document.createElement('p');
  if (fixed > 0 || recurring > 0) {
    runway.textContent = burn <= 0
      ? 'つづく売上が固定費を上回っている。この庭は、自分の足で立っている。'
      : `このままなら、あと ${(cash / burn).toFixed(1)} ヶ月は立っていられる。`;
    summary.appendChild(runway);
  }
  if (S.getState().ledgerUpdatedAt) {
    const upd = document.createElement('p');
    upd.className = 'ledger-updated';
    upd.textContent = '前回つけた日 ' + S.getState().ledgerUpdatedAt.slice(0, 10);
    summary.appendChild(upd);
  }
  wrap.appendChild(summary);
}

// ── nav + drone ──────────────────────────────────────
document.querySelectorAll('#places [data-view]').forEach((b) => {
  b.addEventListener('click', () => show(b.dataset.view));
});
$('btn-drone').addEventListener('click', () => {
  if (droneActive()) stopDrone(); else startDrone();
  $('btn-drone').setAttribute('aria-pressed', String(droneActive()));
  $('btn-drone').classList.toggle('is-on', droneActive());
});

const RENDERERS = {
  honden: renderHonden,
  ganden: renderGanden,
  gogyo: renderGogyo,
  shikigami: renderShikigami,
  kudoku: renderKudoku,
  juyosho: renderEngiBoard,
  genjitsu: renderLedger,
};

// ── 縁起物 — affiliate goods, catalog fetched from /blog/products.json ──
import { ENGIMONO_ELEMENT } from './data.js';

let engimonoCache = null;
async function loadEngimono() {
  if (engimonoCache) return engimonoCache;
  try {
    const res = await fetch('/blog/products.json');
    const items = await res.json();
    engimonoCache = items.map((p) => ({
      ...p, element: ENGIMONO_ELEMENT[p.id] || 'earth',
    }));
  } catch (_) {
    engimonoCache = []; // offline or missing catalog — the world stays quiet
  }
  return engimonoCache;
}

function engiCard(p, compact) {
  const a = document.createElement('a');
  a.className = 'engi-card' + (compact ? ' is-compact' : '');
  a.href = p.url;
  a.target = '_blank';
  a.rel = 'sponsored noopener';
  const badge = document.createElement('span');
  badge.className = 'engi-badge';
  badge.textContent = '広告';
  const mark = document.createElement('span');
  mark.className = 'el-mark el-' + p.element;
  mark.textContent = ELEMENTS[p.element].name;
  const body = document.createElement('span');
  body.className = 'engi-body';
  const name = document.createElement('span');
  name.className = 'engi-name';
  name.textContent = p.name;
  const blurb = document.createElement('span');
  blurb.className = 'engi-blurb';
  blurb.textContent = p.blurb;
  body.appendChild(name);
  body.appendChild(blurb);
  a.appendChild(mark);
  a.appendChild(body);
  a.appendChild(badge);
  return a;
}

// One good per day, matched to today's lucky element.
async function renderUnkiEngi() {
  const zone = $('unki-engi');
  const items = await loadEngimono();
  zone.replaceChildren();
  if (!items.length) return;
  const lucky = todayUnki().luckyElement;
  const pool = items.filter((p) => p.element === lucky);
  const list = pool.length ? pool : items;
  const pick = list[localDayNumber() % list.length];
  const label = document.createElement('p');
  label.className = 'engi-day-label';
  label.textContent = 'きょうの縁起物';
  zone.appendChild(label);
  zone.appendChild(engiCard(pick, true));
}

async function renderEngiBoard() {
  const list = $('engi-list');
  const items = await loadEngimono();
  list.replaceChildren();
  for (const key of ELEMENT_ORDER) {
    const group = items.filter((p) => p.element === key);
    if (!group.length) continue;
    for (const p of group) list.appendChild(engiCard(p, false));
  }
}

// ── 授与所 — a preparing item wakes up once data-href holds a real URL ──
function initJuyosho() {
  document.querySelectorAll('.juyo-item.is-preparing').forEach((item) => {
    const href = (item.dataset.href || '').trim();
    if (!href) return;
    const a = document.createElement('a');
    a.className = 'juyo-item';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    while (item.firstChild) a.appendChild(item.firstChild);
    a.querySelector('.juyo-cta').textContent = '授与を受ける';
    item.replaceWith(a);
  });
}

// ── boot ─────────────────────────────────────────────
initGate();
initGoma();
initKudoku();
initJuyosho();
