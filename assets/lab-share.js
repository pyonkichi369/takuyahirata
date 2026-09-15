/* ============================================================
   脳の実験室 — Share card rendering + share/copy/X-intent.
   Depends on window.Lab (assets/lab.js) — load lab.js first.
   ============================================================ */
(function (global) {
  'use strict';

  if (!global.Lab) return;

  var CARD_W = 1200, CARD_H = 630;

  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return v && v.trim() ? v.trim() : fallback;
    } catch (e) { return fallback; }
  }

  // Direction A "Paper & Instrument" tokens (assets/brain.css), with
  // hardcoded fallbacks so the card still renders correctly if this
  // ever loads before brain.css (or against a stale kokoro.css).
  function palette() {
    return {
      bg: cssVar('--bg', '#FBF9F3'),
      bgBand: cssVar('--color-ivory-warm', '#F3EEE1'),
      ink: cssVar('--ink', '#17140F'),
      inkSoft: cssVar('--ink-soft', '#544D42'),
      inkFaint: cssVar('--ink-faint', '#8A8172'),
      accent: cssVar('--accent', '#1E4FD8'),
      accentInk: cssVar('--accent-ink', '#0B2E8F'),
      accentSoft: cssVar('--accent-soft', '#E7EDFB')
    };
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var chars = String(text).split('');
    var line = '';
    var lines = [];
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = chars[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * lineHeight); });
    return lines.length;
  }

  // opts: { testLabel, headline, headlineUnit, tierLabel, dateStr, url }
  function buildResultCardCanvas(opts) {
    var canvas = document.createElement('canvas');
    canvas.width = CARD_W; canvas.height = CARD_H;
    var ctx = canvas.getContext('2d');
    var c = palette();

    // Background — paper
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = c.bgBand;
    ctx.fillRect(0, CARD_H - 90, CARD_W, 90);

    // Kicker: site name (mono, accent-ink — matches the mockup's
    // screen-index / step-num small mono accent labels)
    ctx.fillStyle = c.accentInk;
    ctx.font = '600 24px "IBM Plex Mono", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(global.Lab.SITE_NAME.toUpperCase(), 64, 96);

    // Test label
    ctx.fillStyle = c.ink;
    ctx.font = '700 40px "Shippori Mincho", serif';
    ctx.fillText(opts.testLabel, 64, 168);

    // Headline number — mono, tabular, ink (the raw measured fact;
    // blue is reserved for the delta/tier judgment below, per the
    // Paper & Instrument result-screen mockup)
    ctx.fillStyle = c.ink;
    ctx.font = '600 148px "IBM Plex Mono", monospace';
    ctx.fillText(String(opts.headline), 64, 360);
    var headlineWidth = ctx.measureText(String(opts.headline)).width;
    ctx.font = '500 40px "IBM Plex Mono", monospace';
    ctx.fillStyle = c.inkSoft;
    ctx.fillText(opts.headlineUnit || '', 64 + headlineWidth + 14, 360);

    // Tier / delta pill — the one place blue accent appears
    ctx.font = '700 34px "Shippori Mincho", serif';
    var tierText = opts.tierLabel || '';
    var tierWidth = ctx.measureText(tierText).width;
    var pillPadX = 26, pillH = 62;
    ctx.fillStyle = c.accentSoft;
    roundRect(ctx, 64, 410, tierWidth + pillPadX * 2, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = c.accentInk;
    ctx.fillText(tierText, 64 + pillPadX, 410 + pillH / 2 + 12);

    // Disclaimer
    ctx.fillStyle = c.inkFaint;
    ctx.font = '400 20px "Zen Kaku Gothic New", sans-serif';
    wrapText(ctx, '娯楽・自己観察のためのもので、医学的・心理学的な評価ではありません。', 64, 512, CARD_W - 128, 28);

    // Footer: date + url
    ctx.fillStyle = c.ink;
    ctx.font = '500 22px "IBM Plex Mono", monospace';
    ctx.fillText(opts.dateStr || '', 64, CARD_H - 34);
    ctx.textAlign = 'right';
    ctx.fillText(opts.url || '', CARD_W - 64, CARD_H - 34);
    ctx.textAlign = 'left';

    return canvas;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
    });
  }

  // Tries the Web Share API with a file attachment; falls back to
  // a plain "save image" download link the caller can insert.
  function present(opts) {
    return canvasToBlob(opts.canvas).then(function (blob) {
      var filename = (opts.filenameBase || 'result') + '.png';
      var file = null;
      try { file = new File([blob], filename, { type: 'image/png' }); } catch (e) { file = null; }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: opts.title || global.Lab.SITE_NAME,
          text: opts.text || '',
          url: opts.url || undefined
        }).then(function () { return { method: 'share' }; }).catch(function () {
          return { method: 'download', url: URL.createObjectURL(blob), filename: filename };
        });
      }
      return Promise.resolve({ method: 'download', url: URL.createObjectURL(blob), filename: filename });
    });
  }

  function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url).then(function () { return true; }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  function xIntentUrl(text, url) {
    var params = new URLSearchParams({ text: text, url: url });
    return 'https://x.com/intent/post?' + params.toString();
  }

  global.Lab.share = {
    buildResultCardCanvas: buildResultCardCanvas,
    present: present,
    copyLink: copyLink,
    xIntentUrl: xIntentUrl
  };
})(window);
