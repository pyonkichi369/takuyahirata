# 間の庭 (Ma no Niwa) Architecture — formerly 天照界 MY WORLD

Brand site + personal daily-practice garden replacing the takuyahirata.com top page.
A "personal world-creation OS": the ideal world is defined first, then
grown through daily rituals and real-world evidence.

Spec origin: operator-provided MY WORLD specification (2026-08-26).
Personalization axis: 解放 — returning time, margin, and agency to the owner.

2026-08-27 rebrand (operator directive "too religious; make it 和 + a brand
site"): all religious framing removed. 天照界→間の庭 (the garden of 間),
入界門→brand hero (no entry barrier), 本殿→きょうの間, 願殿→ねがい (tanzaku),
護摩壇→たき火, 式神殿→からくり, 功徳帳→みのり帳, 授与所→みせ, 現世の帳→帳場,
呪→合言葉, 霊力→歩み. Visuals: pentagram/mandala → ensō (円相, the owner's own
art motif) + traditional patterns (sprouts, rays, petals, seigaiha) + a
vermilion seal (落款) as the brand mark. Palette: warm 墨 / 生成り / 朱.
Voice: じぶん/ぼく (owner's published writing voice), no 我-speak.
View ids, file names, and ALL storage keys are unchanged — data survives.

## System Context

```mermaid
graph TD
    Owner[Owner - single user] -->|morning/evening ritual| Gate[入界門 index.html]
    Gate --> Hall[本殿]
    Hall --> Gogyo[五行の間]
    Hall --> Goma[護摩壇]
    Hall --> Shiki[式神殿]
    Hall --> Kudoku[功徳帳]
    Hall --> Ledger[現世の帳]
    Hall -. links .-> Blog[/blog/ 書庫 - unchanged/]
    Hall -. links .-> Fortune[/fortune/ 占殿 - unchanged/]
    subgraph Device only
        LS[(LocalStorage tenshokai.v1)]
    end
    Hall <--> LS
    Kudoku <--> LS
    Ledger <--> LS
```

## Data Flow (daily loop)

```mermaid
graph LR
    A[Enter gate +1 reiryoku] --> B[Oracle drawn from quietest element / overload detector]
    B --> C[Choose ONE action - 5 candidates, one per element]
    C --> D[Real-world action]
    D --> E[Evidence logged in 功徳帳 +2 and bonuses]
    E --> F[Element scores 7-day window]
    F --> G[Mandala / level growth]
    G --> B
```

## Component Responsibilities

| File | Responsibility |
|---|---|
| `index.html` | SPA shell — all views' markup (gate, hall, wish hall, elements, goma, shikigami, merit ledger, offering hall, real ledger), meta, JSON-LD |
| `assets/js/unki.js` | Owner's daily fortune: sexagenary day cycle (two published anchors verified), stem-element relation to the owner's day stem (derived constant only — no raw birth data), 5 day-qualities with no negative grade |
| `assets/tenshokai.css` | Design system: 墨/生成り/朱 palette, seal-stamp primary buttons, flame/burn animation, view fades |
| `assets/js/data.js` | Content layer: oracles, declarations, element map, shikigami seeds, growth constants |
| `assets/js/state.js` | State layer: LocalStorage store, element scoring, oracle selection, overload detection, reiryoku/level |
| `assets/js/mandala.js` | Procedural SVG: ensō brand mark + level-grown garden (sprouts, rays, petals, seigaiha waves) |
| `assets/js/audio.js` | WebAudio synthesis: bell, fire crackle, drone — no audio files, never autoplays |
| `assets/js/app.js` | Application layer: view switching, ritual flows, forms, goma burn sequence |

## External Communication Guarantees

- Zero backend, zero API calls, zero analytics on the world page.
- Only external request: Google Fonts (Shippori Mincho B1).
- All personal data (actions, evidence, ledger numbers) lives ONLY in the
  visitor's own LocalStorage — never transmitted, never shared between devices.
- Goma (released thoughts): the text itself is NEVER stored — only
  timestamp + category.
- `/blog/` and `/fortune/` are untouched legacy sections; previous top page
  preserved at `legacy/index-v1-shisoka.html`.

## Design Constraints (owner-specific)

- ADHD-aware: exactly one action per day, candidates pre-decided with a
  recommended pick, morning ritual reachable in under 30 seconds.
- Depression-aware: no streaks, no punishment for missed days; rest (土)
  counts as a world-protecting action.
- Overload detection: 3+ unfinished chosen actions in the last 5 ritual days
  switches the oracle to release mode ("what can be reduced"), and the
  recommended action becomes rest.
- No scarcity language anywhere in the primary screens; real numbers shown
  plainly (never beautified) only in 現世の帳.
- Internal system names are never exposed; shikigami carry poetic public-safe
  names the owner can rename.

## 願殿 — Manifestation as a Loop (not magic)

The wish hall implements attraction as a verifiable loop: wish written in
already-unfolding phrasing → daily mantra repetition (呪, chanted in the
main hall) → one small action → evidence in the merit ledger → fulfillment
(成就) recorded as evidence. Design rules:

- Max 3 active wishes (focus over accumulation); each wish carries a
  first-step small enough for a low-energy day.
- Subconscious rewrite = goma ritual extension: the old belief burns
  (never stored), the replacement belief is inscribed as a mantra and
  resurfaces every morning. This is cognitive reframing in the world's
  grammar, not therapy.
- Explicit boundary line in the wish hall: deep wounds belong with
  professionals ("専門家という同行者も、世界の外にいる").
- Nothing is guaranteed anywhere in the copy; the world credits actions
  and evidence, never promises outcomes.
