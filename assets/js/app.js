// 天照界 — application layer. Views, rituals, transitions.

import {
  ELEMENTS, ELEMENT_ORDER, ELEMENT_NUDGES, DECLARATIONS,
  EVIDENCE_TYPES, EVIDENCE_ELEMENT, GOMA_CATEGORIES,
  LEVEL_STATES, LEDGER_FIELDS, dayElement,
  CLOSING_MORNING, CLOSING_NIGHT,
} from './data.js';
import * as S from './state.js';
import { drawSigil, drawMandala } from './mandala.js';
import { ringBell, fireCrackle, startDrone, stopDrone, droneActive } from './audio.js';

const $ = (id) => document.getElementById(id);

// ── view switching — places, not pages ───────────────
const VIEWS = ['gate', 'honden', 'gogyo', 'goma', 'shikigami', 'kudoku', 'genjitsu'];
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
    `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 — 本日の気は「${el.name}」`;
  drawSigil($('gate-sigil'), { lit: 0 });

  let lit = false;
  const light = () => {
    if (lit) return;
    lit = true;
    drawSigil($('gate-sigil'), { lit: 1 });
    $('gate-sigil').classList.add('sigil-lit');
    $('btn-enter').disabled = false;
  };

  $('btn-bell').addEventListener('click', () => {
    ringBell();
    if (S.getState().soundEnabled === null) S.setSound(true);
    light();
  });
  $('gate-sound-note').addEventListener('click', () => {
    if (S.getState().soundEnabled === null) S.setSound(false);
    light();
  });
  $('btn-enter').addEventListener('click', () => {
    S.markEntered();
    document.body.classList.add('entered');
    show('honden');
  });
}

// ── 本殿 ─────────────────────────────────────────────
function renderHonden() {
  const lvl = S.level();
  $('hall-level').textContent = `世界位階 ${lvl} — 霊力 ${S.getState().reiryoku}`;
  drawMandala($('mandala'), { level: lvl, reiryoku: S.getState().reiryoku });
  $('mandala-state').textContent = LEVEL_STATES[Math.min(lvl, LEVEL_STATES.length) - 1];

  const dayN = Math.floor(Date.now() / 86400000);
  $('declaration').textContent = DECLARATIONS[dayN % DECLARATIONS.length];

  renderOracle();
  renderActionZone();
  renderGogyoMini();
}

function renderOracle() {
  const r = S.todayRitual();
  if (r.oracle) {
    $('btn-oracle').hidden = true;
    const q = $('oracle-text');
    q.hidden = false;
    q.textContent = r.oracle;
  } else {
    $('btn-oracle').hidden = false;
    $('oracle-text').hidden = true;
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
    done.textContent = '果たされた。世界に霊力が満ちる（+3）';
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
    const next = $('goma-next');
    next.replaceChildren();
    const label = document.createElement('p');
    label.className = 'block-label';
    label.textContent = '手放した後の行動をひとつ';
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
    p.textContent = 'まだ証拠はない。世界は、最初の一筆を待っている。';
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
    gain.textContent = ELEMENTS[el].name + '気がひとつ満ちた';
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
  save.textContent = '帳を更新する';
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
      ? '絶えぬ金脈が結界維持費を上回っている。世界は自らを保っている。'
      : `守護される月数 — およそ ${(cash / burn).toFixed(1)} ヶ月`;
    summary.appendChild(runway);
  }
  if (S.getState().ledgerUpdatedAt) {
    const upd = document.createElement('p');
    upd.className = 'ledger-updated';
    upd.textContent = '最終記帳 ' + S.getState().ledgerUpdatedAt.slice(0, 10);
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
  gogyo: renderGogyo,
  shikigami: renderShikigami,
  kudoku: renderKudoku,
  genjitsu: renderLedger,
};

// ── boot ─────────────────────────────────────────────
initGate();
initGoma();
initKudoku();
