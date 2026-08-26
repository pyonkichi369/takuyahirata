// 間の庭 — content layer.
// A brand site and a daily practice in one: the garden of "間".
// Voice: the owner's own — じぶん / ぼく, plain and warm, never sermon-like.
// Axis: 解放 — returning time, margin, and agency to yourself.
// Storage keys are unchanged from the previous version — data survives.

export const WORLD_NAME = '間の庭';

export const CREED =
  '価値は巡って、縁になって、じぶんのところへ還ってくる。' +
  '足りないものを追いかけるより、つくることで満ちていく。';

// きょうのことば — rotates daily.
export const DECLARATIONS = [
  'きょうは、追わない。つくって、ひらいて、還ってくるものを迎える。',
  'きょうは、背負わない。手放して、余白をつくる。',
  'きょうは、くらべない。じぶんの時間を、じぶんのために使う。',
  'きょうは、急がない。ひとつのことを、確かにやる。',
  '主導権は、じぶんの手の中にある。',
  '仕組みに任せて、つくることに戻る。',
  '小さく試す。学びはぜんぶ、資産になる。',
];

// ── 五行 — the five currents of the garden ───────────
// Fortune-culture framing (the owner's own trade), not religion.
export const ELEMENTS = {
  wood:  { key: 'wood',  name: '木', color: 'var(--el-wood)',  domain: 'つくる — 作品・プロダクト・新しい試み' },
  fire:  { key: 'fire',  name: '火', color: 'var(--el-fire)',  domain: 'ひらく — 言葉・映像・外に見せること' },
  earth: { key: 'earth', name: '土', color: 'var(--el-earth)', domain: 'ととのえる — 心身・暮らし・大切な人' },
  metal: { key: 'metal', name: '金', color: 'var(--el-metal)', domain: 'めぐる — 収益・契約・還ってくる対価' },
  water: { key: 'water', name: '水', color: 'var(--el-water)', domain: 'しくむ — AI・自動化・知恵' },
};
export const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

export const ELEMENT_STATES = ['ひと休み', '芽吹き', 'めぐり', 'さかり', '満ち'];

// Gentle nudge when a current is quiet — an invitation, never a warning.
export const ELEMENT_NUDGES = {
  wood:  '「つくる」が静かです。きょうは小さくひとつ、作ってみませんか。',
  fire:  '「ひらく」が静かです。作ったものを、ひとつだけ外に見せてみませんか。',
  earth: '「ととのえる」が静かです。休むのも、庭の手入れのうちです。',
  metal: '「めぐる」が静かです。対価が還ってくる道を、ひとつ整えてみませんか。',
  water: '「しくむ」が静かです。繰り返しの作業を、ひとつ仕組みにしてみませんか。',
};

// ── きょうの便り — a short letter from the garden ─────
export const ORACLES = {
  wood: [
    '完成を待たなくていい。小さな芽のまま、外に出してみよう。',
    '大きく作らなくていい。きょうは一枚、一行、一場面で十分。',
    '思いつきは財産。きょうひとつ、かたちの欠片にしておこう。',
  ],
  fire: [
    'まだ知られていない価値が、手元に眠っている。きょうはひとつだけ、外に見せてみよう。',
    '大きな声はいらない。静かに、確かに、一度だけ灯せばいい。',
    '出した言葉は消えない。ぜんぶ、残っていく資産になる。',
  ],
  earth: [
    '止まるのも、庭を守る手入れのひとつ。',
    'きょうの休みは、あしたつくるための土になる。',
    '大切な人とのご飯は、どんな売上にも負けない。',
  ],
  metal: [
    'お金を追いかけなくていい。きょうは、対価が還ってくる道をひとつ整えよう。',
    '小さな入金を軽く見ない。それは巡りはじめた証拠。',
    '値下げで縁を買わない。価値には、ちゃんとした対価を。',
  ],
  water: [
    '力ずくで繰り返さない。流れを作って、一度の仕事を仕組みに変えよう。',
    'からくりに任せられる荷物を、まだじぶんで運んでいないだろうか。',
    '知恵はためこむものじゃなく、流すもの。',
  ],
  // Drawn when the garden notices overload.
  release: [
    '増やさなくていい。きょうは、手放すものをひとつ決めよう。',
    '背負いすぎた荷物は、庭を暗くする。降ろすのも立派な手入れ。',
    '問いは「どう頑張るか」じゃなくて「何を減らせるか」。',
    '動けない日は、罪じゃない。庭は消えずに、待っている。',
  ],
};

// ── きょうの一歩 — one per current, small enough for a low day ──
export const ACTION_SUGGESTIONS = {
  wood:  ['作品・プロダクトを15分だけ進める', '思いつきをひとつ書き残す', '試作をひとつかたちにする'],
  fire:  ['ひとつ投稿する（X / note / ブログ）', '作ったものをひとつ公開する', '下書きをひとつ仕上げる'],
  earth: ['散歩か休憩を、ちゃんと取る', '大切な人にひとこと連絡する', '暮らしをひとつ整える'],
  metal: ['請求・提案・出品をひとつ進める', '収益の数字を30秒だけ見る', '対価が還る導線をひとつ直す'],
  water: ['繰り返し作業をひとつ自動化する', '情報をひとつ整理して仕組みに入れる', 'からくりの様子を見る'],
};

// ── からくり — the automations working in the garden ──
// Public-safe names; the owner can rename each.
export const SHIKIGAMI_SEED = [
  { name: '千里【しらべ】', role: '市場・競合・課題の調査', status: '待機' },
  { name: '筆【つくり】',   role: '文章・画像・映像の生成', status: '待機' },
  { name: '金烏【あきない】', role: '収益機会と販売導線の発見', status: '待機' },
  { name: '結【まもり】',   role: '品質確認・異常検知・数値の見張り', status: '待機' },
  { name: '帳【しるし】',   role: '成果・知識・データの記録', status: '待機' },
  { name: '倹【つづまやか】', role: '固定費・API費・むだの削減', status: '待機' },
];
export const SHIKIGAMI_STATUSES = ['待機', '稼働', '休眠'];

// ── みのり帳 ──────────────────────────────────────────
export const EVIDENCE_TYPES = [
  '入金', '新規契約', '継続契約', '販売', '問い合わせ', '感謝',
  '制作物の完成', '自動化', '工数削減', '固定費削減', 'アクセス増加', '新しい縁', '成就',
];
// Which current each evidence type feeds.
export const EVIDENCE_ELEMENT = {
  '入金': 'metal', '新規契約': 'metal', '継続契約': 'metal', '販売': 'metal',
  '問い合わせ': 'fire', '感謝': 'earth', '制作物の完成': 'wood',
  '自動化': 'water', '工数削減': 'water', '固定費削減': 'metal',
  'アクセス増加': 'fire', '新しい縁': 'earth', '成就': 'fire',
};

// ── ねがい — wishes on tanzaku, written as already unfolding ──
export const MAX_ACTIVE_WISHES = 3;
export const WISH_GUIDE =
  '「〜したい」ではなく、もう始まっているものとして書く。' +
  '例: 「価値と対価が巡りはじめている」「作品が外に届きはじめている」';
export const WISH_LIMIT_LINE = 'ねがいは三つまで。ひとつ叶えてから、次を書く。';
export const FULFILL_REIRYOKU = 8;

// ── 合言葉 — words that replace old beliefs ──────────
export const MANTRA_SEED = [
  '価値は巡って、じぶんのところへ還ってくる。',
  'じぶんの人生の主導権は、じぶんにある。',
];
export const CHANT_LINE = '口にした言葉は、少しずつじぶんの声になる。';

// ── 縁起物 — affiliate goods from outside the garden ──
// Catalog source of truth: /blog/products.json (A8 programs, written
// disclosure-compliant). This map only projects each product onto the
// five currents. A8 Link Manager converts the plain advertiser URLs to
// affiliate links at runtime (and reverts them if a program ends).
// Placement rule: 縁起物 appear ONLY in きょうの運気 and みせ — never in
// たき火 or ねがい (no ads where fears are released or wishes are made).
export const ENGIMONO_ELEMENT = {
  'awarefy-mental-care': 'earth',
  'hikiutsu-egao': 'earth',
  'kimochi-counseling': 'earth',
  'atgp-jobtore-utsu': 'earth',
  'totonoe-light': 'earth',
  'kitano-daichi-yumeshizuku': 'earth',
  'highfive-creative-career': 'wood',
  'consul-databank-freelance': 'metal',
  'potepan-freelance-engineer': 'metal',
  'shikaku-square': 'metal',
  'fastcampus-learning': 'water',
  'estore-sns-school': 'fire',
  'verni-phone-fortune': 'water',
};
export const ENGIMONO_NOTE =
  '縁起物はよそのお店の品（広告）です。縁が結ばれると、この庭に糧が入ります。';

// ── たき火 ────────────────────────────────────────────
export const GOMA_CATEGORIES = ['恐れ', 'こだわり', '思い込み', 'くらべ癖', 'その他'];

// ── 庭の育ち ──────────────────────────────────────────
export const REIRYOKU = {
  morningRitual: 1,
  actionComplete: 3,
  evidenceLogged: 2,
  automation: 5,
  recurringRevenue: 8,
  assetPublished: 5,
  costReduced: 4,
};
export const EVIDENCE_BONUS = {
  '自動化': REIRYOKU.automation,
  '継続契約': REIRYOKU.recurringRevenue,
  '制作物の完成': REIRYOKU.assetPublished,
  '固定費削減': REIRYOKU.costReduced,
  '工数削減': REIRYOKU.costReduced,
};

export const LEVEL_THRESHOLDS = [0, 10, 30, 60, 100, 160]; // L1..L6, then +80/level
export const LEVEL_STATES = [
  '静かな更地に、円相だけがある',
  '芽吹きはじめる',
  '若葉が茂りだす',
  '花がひらきはじめる',
  '実りはじめる',
  '庭が、森になっていく',
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

// ── 帳場 — real numbers, plain truth, this device only ──
export const LEDGER_FIELDS = [
  { key: 'cash',      label: 'いまの蓄え',       real: '手元資金', unit: '円' },
  { key: 'recurring', label: 'つづく売上',       real: '月間継続売上', unit: '円/月' },
  { key: 'incoming',  label: '入ってくる予定',   real: '今月の入金予定', unit: '円' },
  { key: 'outgoing',  label: '出ていく予定',     real: '今月の支払い予定', unit: '円' },
  { key: 'fixed',     label: '毎月の固定費',     real: '月間固定費', unit: '円/月' },
  { key: 'hoursSaved',label: 'からくりが担った時間', real: '自動化で削減した時間', unit: '時間/月' },
  { key: 'assets',    label: '残っていく資産',   real: 'デジタル資産数', unit: '個' },
];

// ── 暦 — day current by simple five-day cycle ─────────
// Day numbers use LOCAL midnight, so the garden turns over at 0:00 JST,
// not 9:00 (the UTC boundary).
export function localDayNumber(date = new Date()) {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}
export function dayElement(date) {
  return ELEMENT_ORDER[((localDayNumber(date) % 5) + 5) % 5];
}

export const CLOSING_MORNING = 'きょうの手入れはここまで。庭を動かすのは、このあとの一歩。';
export const CLOSING_NIGHT =
  'きょうの分は、庭に刻まれた。眠っているあいだも、積み上げた仕組みと縁は働いてくれる。';

export const DISCLAIMER =
  'このサイトは、陰陽五行や暦の考え方に着想を得た創作です。' +
  '特定の宗教団体・宗派とは関係なく、効果を保証するものでもありません。';
