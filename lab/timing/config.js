/* ============================================================
   時間の感覚 (time production) — test config. Registers with the
   shared engine in assets/lab.js. Load after lab.js + lab-share.js
   and before this page's own inline <script>.

   Thresholds: grade-D — no sourced norm table exists for a 3-trial
   10-second production task; the copy notes the general idea
   (arousal/attention can shift an internal sense of time) without
   citing a specific source yet.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'timing',
    name: '時間の感覚',
    path: 'timing',
    unit: '%',
    headlineLabel: '平均のズレ（実際の10秒との差）',
    thresholds: [2, 5, 8, 12, 18, 25, Infinity],
    labels: ['ズレ 3%未満', 'ズレ 3〜5%', 'ズレ 5〜8%', 'ズレ 8〜12%', 'ズレ 12〜18%', 'ズレ 18〜25%', 'ズレ 25%以上'],
    // Test-specific extras, read back as Lab.tests.timing.<field>.
    targetMs: 10000,
    trialCount: 3,
    referenceGrade: 'C',
    referenceNote: '30秒を目標にした時間生成のオンライン大規模実験（N=995）では、平均で目標より15%長め、ばらつき（SD）は44%と報告されています（参考値・根拠C、個人差が非常に大きい）。本サイトは10秒課題なので数値の直接比較はできません。時間の感じ方は注意の向け方に左右されやすいことが古典的レビューで示されています（根拠A）。',
    sources: [
      { text: 'Block RA, Zakay D (1997). Prospective and retrospective duration judgments: A meta-analytic review. Psychonomic Bulletin & Review 4(2):184-197.', url: 'https://doi.org/10.3758/BF03209393' },
      { text: 'Pednekar A, Garrido A, Khaluf Y, Simoens P (2024). Predicting change in time production - A machine learning approach to time perception. arXiv:2412.12781 [cs.HC].', url: 'https://arxiv.org/abs/2412.12781' }
    ],
    shareLead: '時間の感覚チェック'
  });
})();
