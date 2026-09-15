/* ============================================================
   記憶の作業台 (visual 2-back) — test config. Registers with the
   shared engine in assets/lab.js. Load after lab.js + lab-share.js
   and before this page's own inline <script>.

   Thresholds: grade-D — no sourced accuracy norms exist for this
   brief 40-trial visual 2-back. Labels are purely descriptive
   accuracy bands (the label IS the range), never an evaluative
   claim. Accuracy is higher-is-better; the value passed to
   Lab.tier.forValue is 100 − 正答率 so tiers stay lower-is-better,
   matching every other test's convention.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'nback',
    name: '記憶の作業台',
    path: 'nback',
    unit: '%',
    headlineLabel: '正答率',
    thresholds: [5, 10, 15, 22, 30, 40, Infinity],
    labels: [
      '正答率 95%以上', '正答率 90〜94%', '正答率 85〜89%', '正答率 78〜84%',
      '正答率 70〜77%', '正答率 60〜69%', '正答率 60%未満'
    ],
    // Test-specific extras, read back as Lab.tests.nback.<field>.
    practiceN: 12,
    practiceTargets: 4,
    scoredN: 40,
    scoredTargets: 12,
    stimulusMs: 500,
    blankMs: 2000,
    referenceGrade: 'C',
    referenceNote: '2-back課題の正答率は健常成人でおよそ80%前後という報告があります（参考値・根拠C、単一研究の対照群）。ただしn-back課題は「ワーキングメモリスパン」を測る標準検査との相関が弱く、同一視できないことが知られています（根拠A）。数字は「この課題への慣れ」も含みます。',
    sources: [
      { text: 'Miller KM, Price CC, Okun MS, Montijo H, Bowers D (2009). Is the N-Back Task a Valid Neuropsychological Measure for Assessing Working Memory? Archives of Clinical Neuropsychology.', url: 'https://doi.org/10.1093/arclin/acp063' },
      { text: 'Jaeggi SM, Buschkuehl M, Perrig WJ, Meier B (2010). The concurrent validity of the N-back task as a working memory measure. Memory 18(4):394-412.', url: 'https://doi.org/10.1080/09658211003702171' },
      { text: 'Redick TS, Lindsey DZ (2013). Complex span and n-back measures of working memory: a meta-analysis. Psychonomic Bulletin & Review 20(6):1102-1113.', url: 'https://doi.org/10.3758/s13423-013-0453-9' }
    ],
    shareLead: '記憶の作業台'
  });
})();
