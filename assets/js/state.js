// 天照界 — state layer. Single LocalStorage document, defensive reads.
// All data stays on this device. Nothing is sent anywhere.

import {
  ELEMENT_ORDER, EVIDENCE_ELEMENT, EVIDENCE_BONUS, REIRYOKU,
  ORACLES, ACTION_SUGGESTIONS, ELEMENT_NUDGES, ELEMENT_STATES,
  SHIKIGAMI_SEED, levelForReiryoku, dayElement,
} from './data.js';

const KEY = 'tenshokai.v1';

function freshState() {
  return {
    createdAt: new Date().toISOString(),
    lastEnteredAt: null,
    soundEnabled: null,          // null = not chosen yet
    reiryoku: 0,
    rituals: {},                 // dateKey -> {entered, oracle, oracleElement, action, completed, closed}
    evidence: [],                // {id, date, type, valueGiven, valueReturned, amount, element, note}
    goma: [],                    // {date, category} — never the text itself
    shikigami: null,             // seeded on first visit to 式神殿
    ledger: {},                  // real numbers, manual entry
    ledgerUpdatedAt: null,
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(freshState(), JSON.parse(raw));
  } catch (_) { /* corrupted or unavailable — start fresh */ }
  return freshState();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
}

export function getState() { return state; }

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayRitual() {
  const k = todayKey();
  if (!state.rituals[k]) state.rituals[k] = {};
  return state.rituals[k];
}

// ── 霊力 / level ─────────────────────────────────────
export function addReiryoku(n) {
  state.reiryoku += n;
  save();
}
export function level() { return levelForReiryoku(state.reiryoku); }

// ── 五行 — computed from last 7 days of activity ─────
export function elementScores() {
  const scores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const cutoff = Date.now() - 7 * 86400000;
  for (const ev of state.evidence) {
    if (new Date(ev.date).getTime() < cutoff) continue;
    const el = ev.element || EVIDENCE_ELEMENT[ev.type];
    if (el && el in scores) scores[el] += 1;
  }
  for (const [k, r] of Object.entries(state.rituals)) {
    if (new Date(k).getTime() < cutoff) continue;
    if (r.completed && r.actionElement && r.actionElement in scores) {
      scores[r.actionElement] += 1;
    }
  }
  return scores;
}

export function elementState(score) {
  if (score <= 0) return ELEMENT_STATES[0];      // 休眠
  if (score === 1) return ELEMENT_STATES[1];     // 目覚め
  if (score === 2) return ELEMENT_STATES[2];     // 巡行
  if (score <= 4) return ELEMENT_STATES[3];      // 活性
  return ELEMENT_STATES[4];                      // 満潮
}

export function quietestElement() {
  const scores = elementScores();
  let min = ELEMENT_ORDER[0];
  for (const el of ELEMENT_ORDER) if (scores[el] < scores[min]) min = el;
  return min;
}

export function elementNudge() {
  const el = quietestElement();
  return elementScores()[el] === 0 ? ELEMENT_NUDGES[el] : null;
}

// ── overload detection — the world never pushes a tired owner ──
// If 3+ of the last 5 ritual days had an action chosen but not completed,
// the oracle switches to release mode (「何を減らせるか」).
export function isOverloaded() {
  const keys = Object.keys(state.rituals).sort().slice(-5);
  let chosen = 0, unfinished = 0;
  for (const k of keys) {
    const r = state.rituals[k];
    if (r.action) { chosen++; if (!r.completed) unfinished++; }
  }
  return chosen >= 3 && unfinished >= 3;
}

// ── 託宣 — deterministic per day, state-aware ────────
export function drawOracle() {
  const r = todayRitual();
  if (r.oracle) return r;
  let pool, el;
  if (isOverloaded()) {
    el = 'release';
    pool = ORACLES.release;
  } else {
    el = quietestElement();
    // The quietest element speaks; ties broken by today's day element.
    const scores = elementScores();
    const day = dayElement(new Date());
    if (scores[el] === scores[day]) el = day;
    pool = ORACLES[el];
  }
  const seed = todayKey().split('-').join('');
  r.oracle = pool[Number(seed) % pool.length];
  r.oracleElement = el;
  save();
  return r;
}

// ── actions ──────────────────────────────────────────
export function actionCandidates() {
  const seed = Number(todayKey().split('-').join(''));
  const out = [];
  for (const el of ELEMENT_ORDER) {
    const pool = ACTION_SUGGESTIONS[el];
    out.push({ element: el, text: pool[seed % pool.length] });
  }
  // Recommend the quietest element's action (or 土 when overloaded — rest first).
  const rec = isOverloaded() ? 'earth' : quietestElement();
  return { candidates: out, recommended: rec };
}

export function chooseAction(text, element) {
  const r = todayRitual();
  r.action = text;
  r.actionElement = element;
  r.completed = false;
  save();
}

export function completeAction() {
  const r = todayRitual();
  if (r.action && !r.completed) {
    r.completed = true;
    r.completedAt = new Date().toISOString();
    addReiryoku(REIRYOKU.actionComplete);
  }
  save();
}

export function markEntered() {
  const r = todayRitual();
  if (!r.entered) {
    r.entered = true;
    addReiryoku(REIRYOKU.morningRitual);
  }
  state.lastEnteredAt = new Date().toISOString();
  save();
}

// ── evidence ─────────────────────────────────────────
export function addEvidence(ev) {
  const entry = {
    id: 'ev' + Date.now(),
    date: new Date().toISOString(),
    type: ev.type,
    valueGiven: ev.valueGiven || '',
    valueReturned: ev.valueReturned || '',
    amount: ev.amount || 0,
    element: EVIDENCE_ELEMENT[ev.type] || 'metal',
    note: ev.note || '',
  };
  state.evidence.push(entry);
  addReiryoku(REIRYOKU.evidenceLogged + (EVIDENCE_BONUS[ev.type] || 0));
  save();
  return entry;
}

// ── goma — category + timestamp only, never the words ──
export function logGoma(category) {
  state.goma.push({ date: new Date().toISOString(), category });
  save();
}

// ── shikigami ────────────────────────────────────────
export function shikigami() {
  if (!state.shikigami) {
    state.shikigami = SHIKIGAMI_SEED.map((s, i) => ({
      id: 'sk' + i, ...s, lastTask: '', hoursSaved: 0, valueCreated: '',
    }));
    save();
  }
  return state.shikigami;
}
export function updateShikigami(id, patch) {
  const s = shikigami().find((x) => x.id === id);
  if (s) { Object.assign(s, patch); save(); }
}

// ── ledger ───────────────────────────────────────────
export function setLedger(values) {
  state.ledger = { ...state.ledger, ...values };
  state.ledgerUpdatedAt = new Date().toISOString();
  save();
}

// ── sound preference ─────────────────────────────────
export function setSound(enabled) { state.soundEnabled = enabled; save(); }
