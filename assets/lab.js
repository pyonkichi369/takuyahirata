/* ============================================================
   脳の実験室 — Lab engine (shared)
   Precise timing, trial helpers, localStorage history, tiers,
   per-test config registry. Plain script (no build step). Exposes
   window.Lab. Sharing/canvas card code lives in assets/lab-share.js
   (loaded separately to keep this file under the 400-line limit).

   ---- Adding a new test (builder guide) ----
   1. lab/<id>/index.html — copy lab/pvt/index.html (or stroop's, if
      the response is multiple-choice rather than a single tap) as a
      skeleton. Keep the header/result/share/sources DOM ids; swap
      the stage markup and trial logic for your task.
   2. lab/<id>/config.js — one Lab.registerTest({...}) call (shape
      below), loaded after lab.js + lab-share.js and before the
      page's own inline <script>.
   3. tools/tests/<id>.json — the same data, for static tier-page and
      OG-image generation. Field list: see tools/build_lab_results.py
      header comment.
   4. Run `python3 tools/build_lab_results.py` — regenerates every
      registered test's tier pages + OG PNGs from tools/tests/*.json.

   Lab.registerTest(config) shape:
     { id, name, path, unit, headlineLabel, thresholds[7] (ascending,
       ending Infinity), labels[7], referenceGrade, referenceNote,
       sources: [{text, url}], shareLead }
   Test-specific extras (e.g. PVT's lapseMs, Stroop's timeoutMs) may
   be added freely — registerTest stores whatever you pass; read it
   back as Lab.tests[id].<yourField> in that test's own scripts.

   Helpers a page uses: Lab.now/rand/median/mean (timing + trial
   math), Lab.input.onActivate (tap+key, debounced), Lab.history.*
   (localStorage, try/catch-safe), Lab.tier.forValue(id, value),
   Lab.tests[id] (the registered config — read .referenceNote /
   .sources / .shareLead / .headlineLabel / .name directly),
   Lab.sources.render(ulEl, sources), Lab.format.{delta, date,
   renderDeltaRow}, Lab.share.* (assets/lab-share.js — canvas card +
   Web Share / copy link / X intent).
   ============================================================ */
(function (global) {
  'use strict';

  var SITE_NAME = '脳の実験室';

  // ----------------------------------------------------------
  // Test config registry. Each test's own config.js calls
  // Lab.registerTest() before the page's inline script runs.
  // Tiers are ascending: index 0 = best (tier 1) .. index 6 = tier 7.
  // A value qualifies for the first tier whose threshold it is <=.
  // PVT (grade C) and Stroop (grade D) configs live in
  // lab/pvt/config.js and lab/stroop/config.js — see those files for
  // the sourcing notes behind their thresholds.
  // ----------------------------------------------------------
  var tests = {};

  function registerTest(config) {
    if (!config || !config.id) return;
    tests[config.id] = config;
  }

  // ----------------------------------------------------------
  // Small utils
  // ----------------------------------------------------------
  function now() { return performance.now(); }

  function randBetween(min, max) { return min + Math.random() * (max - min); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function reducedMotion() {
    try {
      return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { return false; }
  }

  function median(nums) {
    if (!nums.length) return null;
    var s = nums.slice().sort(function (a, b) { return a - b; });
    var mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  function mean(nums) {
    if (!nums.length) return null;
    var sum = 0;
    for (var i = 0; i < nums.length; i++) sum += nums[i];
    return sum / nums.length;
  }

  // ----------------------------------------------------------
  // localStorage history — every access wrapped, page works
  // without storage. Entry shape: {ts, score, tier, extra}.
  // ----------------------------------------------------------
  var HISTORY_MAX = 20;

  function storageKey(test) { return 'lab:' + test; }

  function loadHistory(test) {
    try {
      var raw = global.localStorage.getItem(storageKey(test));
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(test, entries) {
    try {
      global.localStorage.setItem(storageKey(test), JSON.stringify(entries.slice(-HISTORY_MAX)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function addHistoryEntry(test, entry) {
    var entries = loadHistory(test);
    var previous = entries.length ? entries[entries.length - 1] : null;
    entries.push(entry);
    saveHistory(test, entries);
    return previous;
  }

  function lastEntryBefore(test) {
    var entries = loadHistory(test);
    return entries.length ? entries[entries.length - 1] : null;
  }

  // ----------------------------------------------------------
  // Tiers — lower score is always "better" for both tests here
  // (faster reaction, smaller interference).
  // ----------------------------------------------------------
  function tierForValue(id, value) {
    var t = tests[id];
    if (!t || value == null || isNaN(value)) return { tier: null, label: '' };
    for (var i = 0; i < t.thresholds.length; i++) {
      if (value <= t.thresholds[i]) {
        return { tier: i + 1, label: t.labels[i] };
      }
    }
    return { tier: t.thresholds.length, label: t.labels[t.labels.length - 1] };
  }

  // ----------------------------------------------------------
  // "前回との差" — lower-is-better delta formatting.
  // ----------------------------------------------------------
  function formatDelta(currentScore, previousEntry) {
    if (!previousEntry || previousEntry.score == null || currentScore == null) return null;
    var diff = Math.round(currentScore - previousEntry.score);
    if (diff === 0) return '前回と同じでした。';
    var better = diff < 0;
    return '前回との差：' + (diff > 0 ? '+' : '') + diff + 'ms（' + (better ? '前回より速い' : '前回より時間がかかった') + '）';
  }

  function formatDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  // ----------------------------------------------------------
  // Delta row — DOM-safe (textContent/createElement only) build of
  // the "前回との差" block, matching the Direction A result-screen
  // delta-row pattern: label / value (accent, styled in lab.css) /
  // detail. measureCount is this test's total saved-entry count
  // (including the just-added one), for "（N回目の測定）".
  // ----------------------------------------------------------
  function renderDeltaRow(containerEl, currentScore, previousEntry, measureCount) {
    if (!containerEl) return;
    while (containerEl.firstChild) containerEl.removeChild(containerEl.firstChild);

    var label = document.createElement('span');
    label.className = 'delta-label';

    if (!previousEntry || previousEntry.score == null || currentScore == null) {
      label.textContent = '今回が初回の記録です';
      containerEl.appendChild(label);
      var firstDetail = document.createElement('span');
      firstDetail.className = 'delta-detail';
      firstDetail.textContent = '次回、前回との差が表示されます。';
      containerEl.appendChild(firstDetail);
      return;
    }

    var diff = Math.round(currentScore - previousEntry.score);
    label.textContent = '前回との差';
    containerEl.appendChild(label);

    var value = document.createElement('span');
    value.className = 'delta-value';
    value.textContent = (diff > 0 ? '+' : diff < 0 ? '' : '±') + diff + 'ms';
    containerEl.appendChild(value);

    var detail = document.createElement('span');
    detail.className = 'delta-detail';
    var countText = measureCount ? '（' + measureCount + '回目の測定）' : '';
    detail.textContent = Math.round(previousEntry.score) + 'ms → ' + Math.round(currentScore) + 'ms' + countText;
    containerEl.appendChild(detail);
  }

  // ----------------------------------------------------------
  // Unified tap/click input — avoids double-firing on touch
  // devices (touchend synthesizes a click), debounces repeats.
  // ----------------------------------------------------------
  function onActivate(el, handler) {
    var lock = false;
    function fire(e) {
      if (lock) return;
      lock = true;
      handler(e);
      setTimeout(function () { lock = false; }, 60);
    }
    el.addEventListener('click', fire);
    el.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        fire(e);
      }
    });
  }

  // ----------------------------------------------------------
  // Citation list rendering — DOM-safe (textContent/createElement
  // only, no innerHTML). sources: [{text, url}].
  // ----------------------------------------------------------
  function renderSources(ulEl, sources) {
    if (!ulEl) return;
    while (ulEl.firstChild) ulEl.removeChild(ulEl.firstChild);
    var list = sources || [];
    // No-op (hide the whole .lab-sources block, heading included) when
    // a test has no citations — e.g. self-authored items like matrix.
    var container = ulEl.closest ? ulEl.closest('.lab-sources') : null;
    if (!list.length) {
      if (container) container.hidden = true;
      return;
    }
    if (container) container.hidden = false;
    list.forEach(function (s) {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(s.text));
      if (s.url) {
        li.appendChild(document.createTextNode(' '));
        var a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'nofollow noopener';
        a.textContent = s.url.indexOf('doi.org') !== -1 ? 'doi' : '出典を見る';
        li.appendChild(a);
      }
      ulEl.appendChild(li);
    });
  }

  global.Lab = {
    SITE_NAME: SITE_NAME,
    tests: tests,
    registerTest: registerTest,
    REFERENCE: tests, // thin alias — same object as Lab.tests, kept for anything still reading it
    now: now,
    rand: { between: randBetween, shuffle: shuffle },
    reducedMotion: reducedMotion,
    median: median,
    mean: mean,
    history: {
      load: loadHistory,
      save: saveHistory,
      add: addHistoryEntry,
      last: lastEntryBefore
    },
    tier: { forValue: tierForValue },
    format: { delta: formatDelta, date: formatDate, renderDeltaRow: renderDeltaRow },
    input: { onActivate: onActivate },
    sources: { render: renderSources }
  };
})(window);
