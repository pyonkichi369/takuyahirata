// 間の庭 — daily fortune engine (the owner's own trade: 占い, not religion).
// Deterministic sexagenary (干支) day calculation, anchored and verified
// against two published calendar anchors (1900-01-01 = 甲戌, 2000-01-07 = 甲子).
// The owner's chart is stored only as a derived constant (day stem index),
// never as raw birth data.

import { ELEMENTS } from './data.js';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STEM_ELEMENT = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];

// Owner's day stem 辛 (yin metal), derived once from the owner's day pillar.
const OWNER_STEM = 7;
const OWNER_ELEMENT = STEM_ELEMENT[OWNER_STEM];

// 相生 (generation) and 相剋 (control) cycles.
const GENERATES = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
const OVERCOMES = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };

function jdn(y, m, d) {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
    - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function dayKanshi(date = new Date()) {
  const n = jdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const i = (((n + 49) % 60) + 60) % 60;
  return { index: i, stem: i % 10, branch: i % 12, label: STEMS[i % 10] + BRANCHES[i % 12] };
}

// Five day-qualities. No 凶 — a hard day is a day to guard, not a curse.
const READINGS = {
  filled: {
    grade: '満ちる日',
    line: '流れが味方してくれる日。新しいことを始めるのに向いている。',
    bonus: 1,
  },
  steady: {
    grade: '整う日',
    line: 'いつもと同じ質の気。続けてきたことを、淡々と積むのに向く。',
    bonus: 0,
  },
  giving: {
    grade: 'ひらく日',
    line: '気が外へ流れ出る日。作ったものを、外に見せるのに向いている。',
    bonus: 0,
  },
  forging: {
    grade: '攻める日',
    line: '攻めが決まりやすい日。商談・提案・値決めに向いている。',
    bonus: 0,
  },
  guarding: {
    grade: '整えの日',
    line: '無理に動かないほうがいい日。休息と手入れが、いちばんの一手。',
    bonus: 0,
  },
};

// Relation of today's stem element to the owner's element.
export function todayUnki(date = new Date()) {
  const k = dayKanshi(date);
  const dayEl = STEM_ELEMENT[k.stem];
  let kind;
  if (dayEl === OWNER_ELEMENT) kind = 'steady';
  else if (GENERATES[dayEl] === OWNER_ELEMENT) kind = 'filled';    // day feeds me
  else if (GENERATES[OWNER_ELEMENT] === dayEl) kind = 'giving';    // I feed the day
  else if (OVERCOMES[OWNER_ELEMENT] === dayEl) kind = 'forging';   // I control the day
  else kind = 'guarding';                                          // the day controls me

  const r = READINGS[kind];
  // The element worth acting on today: what the day itself carries.
  const luckyEl = kind === 'guarding'
    ? GENERATES[dayEl] === OWNER_ELEMENT ? dayEl : 'earth'         // guard days: ground yourself
    : dayEl;
  return {
    kanshi: k.label,
    kind,
    grade: r.grade,
    line: r.line,
    bonus: r.bonus,
    luckyElement: luckyEl,
    luckyName: ELEMENTS[luckyEl].name,
  };
}
