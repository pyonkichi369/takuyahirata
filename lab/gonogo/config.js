/* ============================================================
   衝動の抑え (Go/No-Go) — test config. Registers with the shared
   engine in assets/lab.js. Load after lab.js + lab-share.js and
   before this page's own inline <script>.

   Thresholds: grade-D — no sourced ms/error-rate norms exist for
   this brief 60-trial task. Labels are purely descriptive counts
   (the label IS the range), never an evaluative claim.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'gonogo',
    name: '衝動の抑え',
    path: 'gonogo',
    unit: '回',
    headlineLabel: '抑えの失敗（赤い四角の時に反応してしまった回数）',
    thresholds: [0, 1, 2, 3, 5, 8, Infinity],
    labels: ['抑えの失敗 0回', '抑えの失敗 1回', '抑えの失敗 2回', '抑えの失敗 3回', '抑えの失敗 4〜5回', '抑えの失敗 6〜8回', '抑えの失敗 9回以上'],
    // Test-specific extras, read back as Lab.tests.gonogo.<field>.
    mainTrials: 60,
    noGoCount: 15,
    stimulusMs: 500,
    trialMs: 1200,
    responseWindowMs: 900,
    referenceGrade: 'C',
    referenceNote: 'Go/No-Go課題では、健常成人の反応時間はおおむね300ms台前半、押してはいけない刺激への誤反応率は課題の条件によって4〜12%程度と報告されています（参考値・根拠C、単一研究・条件依存）。本サイト版は15回中の回数で表示します。',
    sources: [
      { text: 'Zhao et al. (2016). Male Smokers\' and Non-Smokers\' Response Inhibition in Go/No-Go Tasks: Effect of Three Task Parameters. PLoS ONE.', url: 'https://doi.org/10.1371/journal.pone.0160595' }
    ],
    shareLead: '衝動の抑えチェック'
  });
})();
