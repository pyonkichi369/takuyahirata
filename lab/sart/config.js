/* ============================================================
   集中の持続 (SART) — test config. Registers with the shared engine
   in assets/lab.js. Load after lab.js + lab-share.js and before this
   page's own inline <script>.

   Thresholds: grade-D — this is a simplified 90-trial version of the
   Robertson et al. (1997) SART paradigm. The citation supports the
   task itself (it is used as a "mind wandering" proxy in the
   literature); it does not supply a published norm table for
   commission-error counts, so the bands are plain descriptive
   counts, not an evaluative scale.
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'sart',
    name: '集中の持続',
    path: 'sart',
    unit: '回',
    headlineLabel: 'うっかり押し（3の時に反応してしまった回数）',
    thresholds: [0, 1, 2, 3, 5, 7, Infinity],
    labels: ['うっかり押し 0回', 'うっかり押し 1回', 'うっかり押し 2回', 'うっかり押し 3回', 'うっかり押し 4〜5回', 'うっかり押し 6〜7回', 'うっかり押し 8回以上'],
    // Test-specific extras, read back as Lab.tests.sart.<field>.
    mainTrials: 90,
    noGoCount: 10,
    referenceGrade: 'C',
    referenceNote: '持続的注意課題（SART）では、まれな「押してはいけない」刺激に誤って反応する率は研究間で約30〜50%とばらつきが大きいと報告されています（参考値・根拠C、課題の条件で大きく変わります）。本サイト版は10回中の回数で表示します。医学的な判定には使えません。',
    sources: [
      { text: 'Robertson IH, Manly T, Andrade J, Baddeley BT, Yiend J (1997). ‘Oops!’: performance correlates of everyday attentional failures in traumatic brain injured and normal subjects. Neuropsychologia 35(6):747-758.', url: 'https://doi.org/10.1016/S0028-3932(97)00015-8' },
      { text: 'Wilson KM, Finkbeiner KM, de Joux NR, Russell PN, Helton WS (2016). Go-stimuli proportion influences response strategy in a sustained attention to response task. Experimental Brain Research.', url: 'https://doi.org/10.1007/s00221-016-4701-x' }
    ],
    shareLead: '集中の持続チェック'
  });
})();
