#!/usr/bin/env python3
"""Generate static tier-result pages and OG share images for 脳の実験室
(the /lab/ brain experience lab on this site).

Reads one JSON file per test from tools/tests/*.json — add a new test
by dropping in tools/tests/<id>.json (see field list below) and
re-running this script. No other change to this file is needed.

Produces, for every tools/tests/<id>.json present:
  lab/<id>/r/1.html .. 7.html
  assets/og/lab-<id>-1.png .. lab-<id>-7.png

tools/tests/<id>.json fields:
  id, name, path            — test identity (id/path usually equal)
  kicker                    — tier-page eyebrow, e.g. "RESULT / 結果の目安"
  headline_template         — tier-page <title>/<h1>, {name} and {label}
                               substituted, e.g. "{name}の結果：{label}"
  value_label               — what the number measures, e.g. "反応時間の中央値";
                               substituted into bands[].explanation as {value_label}
  unit                      — e.g. "ms"
  reference_grade           — "A".."D", drives the grade-badge letter/color
  reference_note            — shown next to the grade badge, verbatim
  sources                   — [{text, url}] citation list
  og_tag                    — pill text template. Contains "{tier}" and
                               optionally "{label}" => rendered as a
                               graded accent pill ("目安 N / 7・label") on
                               both the tier page and the OG image. No
                               "{tier}" => a plain, ungraded disclaimer
                               pill (e.g. "簡易版（基準値未確認）"), OG-image
                               only — the tier page falls back to the
                               band's own label with no pill prefix.
  back_link_text            — tier-page header back-link, e.g. "← テストへ"
  related_links             — [{text, href}] extra CTA links (optional)
  og_desc                   — meta/OGP description
  bands                     — exactly 7 {label, explanation} objects,
                               ascending index 0 (best/tier 1)..6 (tier 7)

Requires Pillow. Use the conda base python3 (has Pillow >=10 built for
arm64). The macOS system python3's Pillow is x86-only and will fail
with an architecture error on Apple Silicon — do not use it:

    python3 tools/build_lab_results.py
"""
import glob
import json
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OG_DIR = os.path.join(ROOT, "assets", "og")
TESTS_DIR = os.path.join(ROOT, "tools", "tests")
SITE_NAME = "脳の実験室"
BASE_URL = "https://takuyahirata.com"

# Site palette — Direction A "Paper & Instrument" (assets/brain.css
# :root tokens). Blue accent is reserved for measured/evaluative
# elements (graded tier pill) — never decoration. MUTED uses
# brain.css's AA-safe --text-muted (darker than the raw --ink-faint)
# so small copy stays readable. Shared across every test — not
# per-test JSON, since the palette is a site-wide design decision.
BG = "#FBF9F3"
BG_BAND = "#F3EEE1"
INK = "#17140F"
MUTED = "#6E6455"
ACCENT_INK = "#0B2E8F"
ACCENT_SOFT = "#E7EDFB"

FONT_DIR = "/System/Library/Fonts"
FONT_BOLD = os.path.join(FONT_DIR, "ヒラギノ角ゴシック W7.ttc")
FONT_REGULAR = os.path.join(FONT_DIR, "ヒラギノ角ゴシック W3.ttc")
# Google's Shippori Mincho / Zen Kaku Gothic New / IBM Plex Mono (the
# live brain.css webfonts) aren't installed locally, and OG headline
# text here is always Japanese (tier labels / ms-range bands), which
# a Latin-only mono face like Menlo can't render — so this script
# keeps the Hiragino Gothic substitution used throughout, just
# recolored to the Direction A palette above.


def load_tests():
    tests = {}
    for path in sorted(glob.glob(os.path.join(TESTS_DIR, "*.json"))):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        if len(data.get("bands", [])) != 7:
            raise ValueError(path + ": bands must have exactly 7 entries")
        tests[data["id"]] = data
    return tests


def load_font(path, size):
    return ImageFont.truetype(path, size, index=0)


def wrap_lines(draw, text, font, max_width):
    lines, line = [], ""
    for ch in text:
        trial = line + ch
        if draw.textlength(trial, font=font) > max_width and line:
            lines.append(line)
            line = ch
        else:
            line = trial
    if line:
        lines.append(line)
    return lines


def fit_font(draw, text, font_path, max_width, start_size, min_size=40, step=4):
    """Largest bold font at or under start_size that keeps text within max_width."""
    size = start_size
    while size > min_size:
        f = load_font(font_path, size)
        if draw.textlength(text, font=f) <= max_width:
            return f
        size -= step
    return load_font(font_path, min_size)


def render_sources_html(sources):
    items = []
    for s in sources:
        text, url = s["text"], s.get("url")
        if url:
            link_text = "doi" if "doi.org" in url else "出典を見る"
            items.append('<li>' + text + ' <a href="' + url + '" rel="nofollow noopener" target="_blank">' + link_text + "</a></li>")
        else:
            items.append("<li>" + text + "</li>")
    return "\n          ".join(items)


def render_related_links_html(related_links):
    return "\n          ".join(
        '<a class="btn-ghost" href="' + l["href"] + '">' + l["text"] + "</a>"
        for l in (related_links or [])
    )


def is_graded(test):
    """A test is "graded" (sourced tier, accent pill) when og_tag has a
    {tier} slot to fill; otherwise it's a plain descriptive band."""
    tag = test.get("og_tag") or ""
    return "{tier}" in tag


def build_og_image(test, tier, out_path):
    band = test["bands"][tier - 1]
    label = band["label"]
    w, h = 1200, 630
    max_text_w = w - 128
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, h - 90, w, h], fill=BG_BAND)

    f_kicker = load_font(FONT_BOLD, 24)
    f_test = load_font(FONT_BOLD, 40)
    f_body = load_font(FONT_REGULAR, 22)
    f_footer = load_font(FONT_REGULAR, 22)

    draw.text((64, 70), SITE_NAME.upper(), font=f_kicker, fill=ACCENT_INK)
    draw.text((64, 118), test["name"], font=f_test, fill=INK)
    draw.text((64, 240), "結果の目安", font=f_body, fill=MUTED)

    if is_graded(test):
        # Sourced tier — headline is the short evaluative label, with
        # an accent-soft/accent-ink pill underneath (mirrors the
        # Direction A mockup's tier-badge). fit_font auto-shrinks for
        # long labels.
        f_headline = fit_font(draw, label, FONT_BOLD, max_text_w, 130)
        draw.text((64, 280), label, font=f_headline, fill=INK)

        pill_text = test["og_tag"].replace("{tier}", str(tier)).replace("{label}", label)
        f_tier = load_font(FONT_BOLD, 34)
        tw = draw.textlength(pill_text, font=f_tier)
        pad_x, pill_h, pill_y = 26, 62, 440
        draw.rounded_rectangle([64, pill_y, 64 + tw + pad_x * 2, pill_y + pill_h], radius=pill_h // 2, fill=ACCENT_SOFT)
        draw.text((64 + pad_x, pill_y + 14), pill_text, font=f_tier, fill=ACCENT_INK)
    else:
        # No sourced norm — headline is just the descriptive band; the
        # pill (if any) is a plain "no norm" note in the paper tint,
        # never the accent-colored graded pill above.
        f_headline = fit_font(draw, label, FONT_BOLD, max_text_w, 100)
        draw.text((64, 300), label, font=f_headline, fill=INK)

        tag_text = test.get("og_tag")
        if tag_text:
            f_tag = load_font(FONT_BOLD, 26)
            tw = draw.textlength(tag_text, font=f_tag)
            pad_x, pill_h, pill_y = 22, 50, 440
            draw.rounded_rectangle([64, pill_y, 64 + tw + pad_x * 2, pill_y + pill_h], radius=pill_h // 2, fill=BG_BAND)
            draw.text((64 + pad_x, pill_y + 11), tag_text, font=f_tag, fill=MUTED)

    disclaimer = "娯楽・自己観察のためのもので、医学的・心理学的な評価ではありません。"
    y = 528
    for line in wrap_lines(draw, disclaimer, f_body, max_text_w):
        draw.text((64, y), line, font=f_body, fill=MUTED)
        y += 30

    draw.text((64, h - 58), "takuyahirata.com/lab/" + test["path"] + "/", font=f_footer, fill=INK)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")


def build_tier_page(test, tier):
    band = test["bands"][tier - 1]
    label = band["label"]
    page_url = BASE_URL + "/lab/" + test["path"] + "/r/" + str(tier) + ".html"
    og_image = BASE_URL + "/assets/og/lab-" + test["id"] + "-" + str(tier) + ".png"
    test_url = "/lab/" + test["path"] + "/"
    og_title = test["headline_template"].replace("{name}", test["name"]).replace("{label}", label)
    explanation = band["explanation"].replace("{value_label}", test["value_label"])

    if is_graded(test):
        # "目安 N / 7・label" — sourced, but "目安" (guideline) avoids the
        # grade-implying framing an equal-interval interpolation
        # doesn't earn.
        tier_pill_text = "目安 " + str(tier) + " / 7・" + label
    else:
        tier_pill_text = label

    grade = test["reference_grade"]
    reference_block = (
        '<p class="lab-reference-note">\n'
        '          <span class="grade-badge grade-' + grade + '"><span class="g">' + grade + '</span>参考値</span>\n'
        "          " + test["reference_note"] + "\n"
        "        </p>"
    )
    # No-op when a test has no citations (e.g. self-authored items
    # like matrix) — mirrors Lab.sources.render()'s empty-hide in
    # assets/lab.js, so the static tier page and the live result page
    # agree: never an empty "出典" heading.
    if test["sources"]:
        sources_block = (
            '<div class="lab-sources">\n'
            '          <p class="lab-sources-title">出典</p>\n'
            "          <ul>\n          " + render_sources_html(test["sources"]) + "\n          </ul>\n"
            "        </div>"
        )
    else:
        sources_block = ""
    related_links_html = render_related_links_html(test.get("related_links"))
    if related_links_html:
        related_links_html = "\n          " + related_links_html

    html = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="__OG_DESC__">
  <meta name="theme-color" content="#FBF8F2">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="__PAGE_URL__">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>__OG_TITLE__ | __SITE_NAME__</title>

  <meta property="og:title" content="__OG_TITLE__">
  <meta property="og:description" content="__OG_DESC__">
  <meta property="og:url" content="__PAGE_URL__">
  <meta property="og:type" content="website">
  <meta property="og:image" content="__OG_IMAGE__">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="__SITE_NAME__">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="__OG_TITLE__">
  <meta name="twitter:description" content="__OG_DESC__">
  <meta name="twitter:image" content="__OG_IMAGE__">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/brain.css?v=3">
  <link rel="stylesheet" href="/assets/lab.css?v=2">
</head>
<body>
  <header class="site-header page-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="脳の実験室 ホーム">
        <svg class="brand-mark" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4C10 5 5 11 5 19c7 0 13-4 15-15Z"/><path d="M5 19C8 14 12 10 17 8"/></svg>
        <span class="brand-text"><span class="brand-name">脳の実験室</span><span class="brand-tag">測って、読んで、試して、また測る</span></span>
      </a>
      <a class="page-back" href="__TEST_URL__">__BACK_LINK_TEXT__</a>
    </div>
  </header>

  <main>
    <div class="container wrap-narrow page-hero lab-hero--tight">
      <p class="page-eyebrow lab-kicker">__KICKER__</p>
      <h1 class="page-title">__OG_TITLE__</h1>
    </div>

    <div class="container wrap-narrow section lab-section--tight">
      <div class="tier-page-card">
        <p class="lab-tier-pill">__TIER_PILL_TEXT__</p>
        <p class="tier-page-value" id="tierValue" hidden></p>
        <p>__EXPLANATION__</p>
        __REFERENCE_BLOCK__
        __SOURCES_BLOCK__
        <p class="lab-result-note">この結果は、その時々の状態によって変わります。同じ人でも、時間帯や睡眠、疲労で数値は上下します。娯楽・自己観察のためのもので、医学的・心理学的な評価ではありません。</p>
        <div class="lab-start-row">
          <a class="btn-primary" href="__TEST_URL__">自分も測る
            <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </a>
          <a class="btn-ghost" href="/lab/">実験室へ戻る</a>__RELATED_LINKS__
        </div>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-bottom">
      <span>© 2026 脳の実験室 / 平田拓也</span>
      <span><a href="/">ホーム</a> ・ <a href="/methodology.html">編集方針</a> ・ <a href="/disclosure.html">広告開示</a></span>
    </div>
  </footer>

  <script>
  (function () {
    // Render the sharer's exact value from ?v=, if it parses as a
    // sane finite number. Otherwise leave the generic tier text as-is.
    var params = new URLSearchParams(location.search);
    var raw = params.get('v');
    var num = raw == null ? NaN : Number(raw);
    if (isFinite(num) && !isNaN(num)) {
      num = Math.max(0, Math.min(5000, Math.round(num)));
      var el = document.getElementById('tierValue');
      el.textContent = num + '__UNIT__（__VALUE_LABEL__）';
      el.hidden = false;
    }
  })();
  </script>
</body>
</html>
"""
    html = html.replace("__OG_DESC__", test["og_desc"])
    html = html.replace("__PAGE_URL__", page_url)
    html = html.replace("__OG_IMAGE__", og_image)
    html = html.replace("__OG_TITLE__", og_title)
    html = html.replace("__SITE_NAME__", SITE_NAME)
    html = html.replace("__TEST_URL__", test_url)
    html = html.replace("__BACK_LINK_TEXT__", test["back_link_text"])
    html = html.replace("__KICKER__", test["kicker"])
    html = html.replace("__TIER_PILL_TEXT__", tier_pill_text)
    html = html.replace("__EXPLANATION__", explanation)
    html = html.replace("__REFERENCE_BLOCK__", reference_block)
    html = html.replace("__SOURCES_BLOCK__", sources_block)
    html = html.replace("__RELATED_LINKS__", related_links_html)
    html = html.replace("__UNIT__", test["unit"])
    html = html.replace("__VALUE_LABEL__", test["value_label"])

    out_path = os.path.join(ROOT, "lab", test["path"], "r", str(tier) + ".html")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)


def main():
    os.makedirs(OG_DIR, exist_ok=True)
    tests = load_tests()
    for test_id, test in tests.items():
        for tier in range(1, 8):
            build_tier_page(test, tier)
            og_path = os.path.join(OG_DIR, "lab-" + test_id + "-" + str(tier) + ".png")
            build_og_image(test, tier, og_path)
            print("built " + test_id + " tier " + str(tier))


if __name__ == "__main__":
    main()
