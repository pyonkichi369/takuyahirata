/* ============================================================
   覚醒度チェック (PVT) — test config. Registers with the shared
   engine in assets/lab.js. Load after lab.js + lab-share.js and
   before this page's own inline <script>.

   Thresholds: grade-C evidence — the two endpoints (~200ms rested
   median, ~500ms lapse cutoff) are sourced; the bands between them
   are an equal-interval interpolation, not a published norm table.
   Confirmed by research agent pass, 2026-09-15.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'pvt',
    name: '覚醒度チェック',
    path: 'pvt',
    unit: 'ms',
    headlineLabel: '反応時間（中央値）',
    thresholds: [219, 249, 279, 319, 379, 499, Infinity],
    labels: [
      'かなり速い', '速い', 'やや速い', '平均的',
      'やや遅い', '遅い', '注意が必要（見逃し基準を超えている）'
    ],
    // Test-specific extra, read back as Lab.tests.pvt.lapseMs.
    lapseMs: 500,
    referenceGrade: 'C',
    referenceNote: '休息十分な成人の反応時間はおよそ200〜300 ms、500 ms以上は「見逃し（ラプス）」と数えるのが研究の慣例です。段階の区切りはこの2点の間を等分した目安で、公表された基準値ではありません（根拠C・簡易版15試行）。医学的な判定には使えません。',
    sources: [
      { text: 'Basner M, Mollicone D, Dinges DF (2011). Validity and sensitivity of a brief psychomotor vigilance test (PVT-B) to total and partial sleep deprivation. Acta Astronautica 69(11-12):949-959.', url: 'https://doi.org/10.1016/j.actaastro.2011.07.015' },
      { text: 'Basner M, Moore TM, Nasrini J, Gur RC, Dinges DF (2020). Response speed measurements on the psychomotor vigilance test: how precise is precise enough? Sleep 44(1):zsaa121.', url: 'https://doi.org/10.1093/sleep/zsaa121' },
      { text: 'Basner M, Dinges DF (2011). Maximizing sensitivity of the psychomotor vigilance test (PVT) to sleep loss. Sleep 34(5):581-591. PMID 21532951', url: 'https://pubmed.ncbi.nlm.nih.gov/21532951/' }
    ],
    shareLead: '覚醒度チェック'
  });
})();
