/* ============================================================
   感情調整の傾向 (Emotion) — test config. Registers with the shared
   engine in assets/lab.js. Load after lab.js + lab-share.js and
   before this page's own inline <script>.

   Self-authored 12-item self-report — NOT a reproduction or
   paraphrase of any published scale. Two 6-item tendency scales:
   「捉え直し」(reappraisal-flavored: changing how you look at a
   situation) and 「抑え込み」(suppression-flavored: not showing what
   you feel), scored 6-30 each from 5-point items, presented
   interleaved. Purely descriptive — no clinical framing, no claim
   that either tendency is "better".

   Share/tier: since the headline is two numbers (not one), the
   tier uses a derived difference: diff = suppression - reappraisal
   (range -24..+24), tierValue = clamp(24 + diff, 0, 48) so it stays
   within Lab.tier.forValue's ascending-threshold convention. The
   live page passes this same clamped tierValue as the share URL's
   ?v= (never the raw signed diff — the shared tier-page script
   clamps ?v= to >= 0, which would silently corrupt a negative
   value).
   ============================================================ */
(function () {
  if (!window.Lab) return;

  Lab.registerTest({
    id: 'emotion',
    name: '感情調整の傾向',
    path: 'emotion',
    unit: '',
    headlineLabel: '傾向',
    thresholds: [8, 14, 20, 28, 34, 40, Infinity],
    labels: [
      '捉え直し寄り（強）', '捉え直し寄り', 'やや捉え直し寄り', 'ほぼ同じ',
      'やや抑え込み寄り', '抑え込み寄り', '抑え込み寄り（強）'
    ],
    referenceGrade: 'D',
    referenceNote: '「捉え直し（認知的再評価）」と「抑え込み（表出抑制）」という2つの方略は、感情経験や対人関係、幸福感との関連が研究で示されています（根拠A、Gross & John 2003）。本サイトの設問は独自作成で標準化されていないため、結果は傾向の参考にとどまります（根拠D）。良い/悪いではありません。',
    sources: [
      { text: 'Gross JJ, John OP (2003). Individual Differences in Two Emotion Regulation Processes: Implications for Affect, Relationships, and Well-Being. Journal of Personality and Social Psychology 85(2):348-362.', url: 'https://doi.org/10.1037/0022-3514.85.2.348' }
    ],
    shareLead: '感情調整の傾向',
    // Test-specific extras, read back as Lab.tests.emotion.<field>.
    // 12 statements, interleaved 捉え直し/抑え込み (6 each), each
    // answered 1 (まったく当てはまらない) - 5 (とても当てはまる).
    scalePoints: [
      { n: 1, label: 'まったく\n当てはまらない' },
      { n: 2, label: 'あまり\n当てはまらない' },
      { n: 3, label: 'どちらとも\nいえない' },
      { n: 4, label: 'やや\n当てはまる' },
      { n: 5, label: 'とても\n当てはまる' }
    ],
    items: [
      { text: '嫌なことがあった時、別の見方ができないか考える。', scale: 'reappraisal' },
      { text: '嫌な気持ちになっても、それを顔に出さないようにしている。', scale: 'suppression' },
      { text: '気持ちが落ち着かない時は、状況を違う角度から見直すようにしている。', scale: 'reappraisal' },
      { text: 'イライラしていても、周りには気づかれないよう振る舞う。', scale: 'suppression' },
      { text: '腹が立つ出来事があっても、あとで「意味があったかもしれない」と捉え直すことがある。', scale: 'reappraisal' },
      { text: '感情が動いた時、それを表に出すのを我慢することが多い。', scale: 'suppression' },
      { text: 'うまくいかなかった時、自分に「今回はこう考えてみよう」と言い聞かせる。', scale: 'reappraisal' },
      { text: '悲しい気持ちを、あまり人に見せないようにしている。', scale: 'suppression' },
      { text: '不安な気持ちになった時、その状況の良い面を探そうとする。', scale: 'reappraisal' },
      { text: '強く感じたことがあっても、態度には出さないよう心がけている。', scale: 'suppression' },
      { text: '落ち込んだ出来事のあと、時間が経つと見方が変わることが多い。', scale: 'reappraisal' },
      { text: '気持ちが高ぶった時、それを抑えて平静を装うことがある。', scale: 'suppression' }
    ]
  });
})();
