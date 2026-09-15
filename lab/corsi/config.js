/* ============================================================
   空間の記憶 (Corsi block-tapping, forward) — test config.
   Registers with the shared engine in assets/lab.js. Load after
   lab.js + lab-share.js and before this page's own inline <script>.

   Thresholds: grade-D — no sourced span norms are confirmed for
   this site yet, so no numeric claim ("adults typically span
   5–7") is made in the page copy itself; that sentence is left for
   a later, sourced pass. Labels are purely descriptive span bands
   (the label IS the range), never an evaluative claim. Span is
   higher-is-better; the value passed to Lab.tier.forValue is
   9 − span so tiers stay lower-is-better, matching every other
   test's convention.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'corsi',
    name: '空間の記憶',
    path: 'corsi',
    unit: '',
    headlineLabel: 'スパン',
    thresholds: [1, 2, 3, 4, 5, 6, Infinity],
    labels: [
      'スパン 8以上', 'スパン 7', 'スパン 6', 'スパン 5',
      'スパン 4', 'スパン 3', 'スパン 2以下'
    ],
    // Test-specific extras, read back as Lab.tests.corsi.<field>.
    startLength: 2,
    maxLength: 9,
    litMs: 700,
    gapMs: 300,
    referenceGrade: 'D',
    referenceNote: 'この課題（コルシ・ブロックタッピング）には標準化研究（Kessels et al., 2000）がありますが、本サイトの簡易版と比べられる検証済みの数値は確認できていません（根拠D）。結果は自分の中での比較（前回との差）としてご覧ください。',
    sources: [
      { text: 'Kessels RPC, van Zandvoort MJE, Postma A, Kappelle LJ, de Haan EHF (2000). The Corsi Block-Tapping Task: Standardization and Normative Data. Applied Neuropsychology 7(4):252-258.', url: 'https://doi.org/10.1207/S15324826AN0704_8' }
    ],
    shareLead: '空間の記憶'
  });
})();
