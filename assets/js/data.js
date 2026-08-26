// 天照界 — content layer.
// All world text lives here. The world's axis: 解放 —
// 「じぶんの人生を、じぶんに返す」. Every oracle either returns
// something to its owner (time, margin, agency) or asks for one
// small act of creation. Never scarcity, never punishment.

export const WORLD_NAME = '天照界';

export const GATE_LINES = [
  '此処は、我が意思の及ぶ世界。',
  '我が生む価値は巡り、姿を変えて我へ還る。',
];

export const CREED =
  '我が価値は世を巡り、縁となり、富となり、我がもとへ還る。' +
  '我は欠乏を追わず、創造によって満ちる世界を築く。';

// 今日の宣言 — rotates daily. Spec voice + 解放 axis.
export const DECLARATIONS = [
  '本日、我は追わず。価値を生み、道を開き、還るべきものを迎える。',
  '本日、我は背負わず。手放すことで、世界に余白を作る。',
  '本日、我は比べず。じぶんの時間を、じぶんのために使う。',
  '本日、我は急がず。ひとつの行いを、確かに刻む。',
  '本日、我は奪わせず。心の主導権は、我がもとにある。',
  '本日、我は仕組みに任せ、我は創ることに還る。',
  '本日、我は小さく試す。学びはすべて、世界の資産となる。',
];

// ── 五行 ──────────────────────────────────────────────
// Mapped to the owner's real five domains.
export const ELEMENTS = {
  wood:  { key: 'wood',  name: '木', color: 'var(--el-wood)',  domain: '創造 — 作品・プロダクト・新しい試み' },
  fire:  { key: 'fire',  name: '火', color: 'var(--el-fire)',  domain: '発信 — 言葉・映像・世界に示すこと' },
  earth: { key: 'earth', name: '土', color: 'var(--el-earth)', domain: '基盤 — 心身・暮らし・大切な人' },
  metal: { key: 'metal', name: '金', color: 'var(--el-metal)', domain: '循環 — 収益・契約・還る対価' },
  water: { key: 'water', name: '水', color: 'var(--el-water)', domain: '知恵 — AI・自動化・仕組み' },
};
export const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

export const ELEMENT_STATES = ['休眠', '目覚め', '巡行', '活性', '満潮'];

// Gentle nudge when an element is quiet — always an invitation, never a warning.
export const ELEMENT_NUDGES = {
  wood:  '木気が静まっています。今日は小さな創造をひとつ加えましょう。',
  fire:  '火気が静まっています。作ったものを、ひとつだけ外へ示しましょう。',
  earth: '土気が静まっています。休むこともまた、世界を守る行いです。',
  metal: '金気が静まっています。対価が還る道を、ひとつ整えましょう。',
  water: '水気が静まっています。繰り返しの仕事を、ひとつ仕組みに変えましょう。',
};

// ── 託宣 ──────────────────────────────────────────────
// Selected by element state + recent activity, not pure random.
export const ORACLES = {
  wood: [
    '完成を待つな。小さな芽を、世界へ出せ。',
    '大きく作るな。今日は一枚、一行、一場面でよい。',
    '発想は財である。今日ひとつ、形の欠片にせよ。',
  ],
  fire: [
    '知られぬ価値は、まだ眠っている。今日はひとつだけ外へ示せ。',
    '声を張るな。静かに、確かに、一度だけ灯せ。',
    '示した言葉は消えぬ。世界に残る資産となる。',
  ],
  earth: [
    '止まることもまた、世界を守る行いである。',
    '今日の休息は、明日の創造の土である。',
    '大切な人と食べる一飯は、いかなる富にも勝る。',
  ],
  metal: [
    '富を追うな。今日、対価が戻る道をひとつ整えよ。',
    '小さな入金を軽んじるな。それは還流の証である。',
    '値を下げて縁を買うな。価値には正しい対価を置け。',
  ],
  water: [
    '力で繰り返すな。流れをつくり、一度の仕事を仕組みに変えよ。',
    '式神に任せられる荷を、まだ我が手で運んでいないか。',
    '知恵は溜めるものではなく、流すものである。',
  ],
  // Drawn when the world detects overload (many unfinished days).
  release: [
    '増やすな。今日はひとつ、手放すものを決めよ。',
    '背負いすぎた荷は、世界を暗くする。降ろすこともまた行いである。',
    '問うべきは「どう頑張るか」ではない。「何を減らせるか」である。',
    '動けぬ日は、罪ではない。世界は消えず、待っている。',
  ],
};

// ── 今日の行動 — one per element, small enough for a low-energy day ──
export const ACTION_SUGGESTIONS = {
  wood:  ['作品・プロダクトを15分だけ進める', '新しい発想をひとつ書き残す', '試作をひとつ形にする'],
  fire:  ['ひとつ投稿する（X / note / ブログ）', '作ったものをひとつ公開する', '下書きをひとつ仕上げる'],
  earth: ['散歩か休息を意図して取る', '大切な人に連絡をひとつ', '暮らしをひとつ整える'],
  metal: ['請求・提案・出品をひとつ進める', '収益の数字を30秒だけ見る', '対価が還る導線をひとつ直す'],
  water: ['繰り返し作業をひとつ自動化する', '情報をひとつ整理して仕組みに入れる', '式神（自動化）の様子を見る'],
};

// ── 式神 ──────────────────────────────────────────────
// Public-safe poetic names; real systems stay unnamed here.
// The owner can rename each in 式神殿.
export const SHIKIGAMI_SEED = [
  { name: '千里【探索】', role: '市場・競合・課題の調査', status: '待機' },
  { name: '筆霊【創作】', role: '文章・画像・映像の生成', status: '待機' },
  { name: '金烏【商運】', role: '収益機会と販売導線の発見', status: '待機' },
  { name: '結界【守護】', role: '品質確認・異常検知・数値監視', status: '待機' },
  { name: '帳面【記録】', role: '成果・知識・データの蓄積', status: '待機' },
  { name: '倹【節約】',   role: '固定費・API費・無駄の削減', status: '待機' },
];
export const SHIKIGAMI_STATUSES = ['待機', '稼働', '休眠'];

// ── 功徳帳 ────────────────────────────────────────────
export const EVIDENCE_TYPES = [
  '入金', '新規契約', '継続契約', '販売', '問い合わせ', '感謝',
  '制作物の完成', '自動化', '工数削減', '固定費削減', 'アクセス増加', '新しい縁',
];
// Which element each evidence type feeds.
export const EVIDENCE_ELEMENT = {
  '入金': 'metal', '新規契約': 'metal', '継続契約': 'metal', '販売': 'metal',
  '問い合わせ': 'fire', '感謝': 'earth', '制作物の完成': 'wood',
  '自動化': 'water', '工数削減': 'water', '固定費削減': 'metal',
  'アクセス増加': 'fire', '新しい縁': 'earth',
};

// ── 護摩壇 ────────────────────────────────────────────
export const GOMA_CATEGORIES = ['恐怖', '執着', '思い込み', '比較', 'その他'];
export const GOMA_DONE_LINES = [
  'その思いは、役目を終えました。',
  '空いた場所へ、新しい行動を置いてください。',
];

// ── 成長ロジック ──────────────────────────────────────
export const REIRYOKU = {
  morningRitual: 1,
  actionComplete: 3,
  evidenceLogged: 2,
  automation: 5,
  recurringRevenue: 8,
  assetPublished: 5,
  costReduced: 4,
};
// Evidence types that grant bonus 霊力 beyond the base log reward.
export const EVIDENCE_BONUS = {
  '自動化': REIRYOKU.automation,
  '継続契約': REIRYOKU.recurringRevenue,
  '制作物の完成': REIRYOKU.assetPublished,
  '固定費削減': REIRYOKU.costReduced,
  '工数削減': REIRYOKU.costReduced,
};

export const LEVEL_THRESHOLDS = [0, 10, 30, 60, 100, 160]; // L1..L6, then +80/level
export const LEVEL_STATES = [
  '暗闇に界紋だけが存在する',
  '本殿へ光が差す',
  '五行の間が開く',
  '式神が現れる',
  '曼荼羅が完成し始める',
  '寺院・庭・星空が拡張していく',
];

export function levelForReiryoku(total) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (total >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  if (total >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    level = LEVEL_THRESHOLDS.length +
      Math.floor((total - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) / 80);
  }
  return level;
}

// ── 現世の帳 — real numbers, plain truth, stored only on this device ──
export const LEDGER_FIELDS = [
  { key: 'cash',      label: '現世の蓄え',     real: '手元資金', unit: '円' },
  { key: 'recurring', label: '絶えぬ金脈',     real: '月間継続売上', unit: '円/月' },
  { key: 'incoming',  label: '還流する価値',   real: '今月の入金予定', unit: '円' },
  { key: 'outgoing',  label: '今月の支払い',   real: '今月の支払い予定', unit: '円' },
  { key: 'fixed',     label: '結界維持費',     real: '月間固定費', unit: '円/月' },
  { key: 'hoursSaved',label: '式神が担った時間', real: '自動化で削減した時間', unit: '時間/月' },
  { key: 'assets',    label: '世界に残る資産', real: 'デジタル資産数', unit: '個' },
];

// ── 暦 — day element by simple five-day cycle ─────────
export function dayElement(date) {
  const days = Math.floor(date.getTime() / 86400000);
  return ELEMENT_ORDER[((days % 5) + 5) % 5];
}

export const CLOSING_MORNING = '儀式は終わりました。世界を動かすのは、この後の一歩です。';
export const CLOSING_NIGHT =
  '本日の行いは、世界へ刻まれました。眠りの間も、積み上げた仕組みと縁は働き続けます。';

export const DISCLAIMER =
  '本サービスは陰陽道・仏教・密教の世界観に着想を得た創作体験です。' +
  '特定の宗教団体・宗派とは関係ありません。効果・効能を保証するものではありません。';
