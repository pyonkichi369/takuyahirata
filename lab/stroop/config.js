/* ============================================================
   注意の切り替え (Stroop) — test config. Registers with the shared
   engine in assets/lab.js. Load after lab.js + lab-share.js and
   before this page's own inline <script>.

   Thresholds: grade-D — no sourced ms norms exist for this brief
   32-trial task. Labels are purely descriptive ms bands (the label
   IS the range), never an evaluative claim.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'stroop',
    name: '注意の切り替え',
    path: 'stroop',
    unit: 'ms',
    headlineLabel: '干渉（不一致−一致の反応時間差）',
    thresholds: [39, 69, 99, 139, 189, 249, Infinity],
    labels: [
      '差 40 ms未満', '差 40〜69 ms', '差 70〜99 ms', '差 100〜139 ms',
      '差 140〜189 ms', '差 190〜249 ms', '差 250 ms以上'
    ],
    // Test-specific extra, read back as Lab.tests.stroop.timeoutMs.
    timeoutMs: 1500,
    referenceGrade: 'D',
    referenceNote: 'このテストは簡易版で、公表された基準値は確認できていません（根拠D）。結果は自分の中での比較（一致条件と不一致条件の差、前回との差）としてご覧ください。',
    sources: [
      { text: 'Scarpina F, Tagini S (2017). The Stroop Color and Word Test. Frontiers in Psychology 8:557.', url: 'https://doi.org/10.3389/fpsyg.2017.00557' }
    ],
    shareLead: '注意の切り替え'
  });
})();
