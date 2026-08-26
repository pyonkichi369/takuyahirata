// 間の庭 — procedural garden art.
// The brand mark is an 円相 (ensō): a brush circle left open, the owner's
// own motif. The garden view grows around it with traditional Japanese
// patterns (和文様) — sprouts, hemp-leaf rays, petals, seigaiha waves —
// as the owner's real actions accumulate. Nothing religious: a garden.

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// An ensō: one almost-closed brush arc (~325°) with round caps, plus a
// faint inner echo over the SAME angular range so it reads as brushwork.
function enso(g, cx, cy, r, { width = 7, opacity = 1, color = 'var(--brush)' } = {}) {
  const gapCenter = -Math.PI / 3;          // opening at the upper right
  const gapHalf = (17 * Math.PI) / 180;    // ~34° opening
  const start = gapCenter + gapHalf;       // brush touches down here...
  const end = gapCenter - gapHalf + 2 * Math.PI; // ...and lifts here
  const arc = (radius, w, o) => {
    const x0 = cx + radius * Math.cos(start), y0 = cy + radius * Math.sin(start);
    const x1 = cx + radius * Math.cos(end), y1 = cy + radius * Math.sin(end);
    g.appendChild(el('path', {
      d: `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${radius} ${radius} 0 1 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      fill: 'none', stroke: color, 'stroke-width': w,
      'stroke-linecap': 'round', opacity: o,
    }));
  };
  arc(r, width, opacity);
  arc(r - width * 0.55, Math.max(1, width * 0.22), opacity * 0.4);
}

// ── brand mark — ensō with the red seal dot ──────────
export function drawSigil(svg, { lit = 0 } = {}) {
  svg.replaceChildren();
  const C = 100;
  const g = el('g', {});
  enso(g, C, C, 62, { width: 8, opacity: 0.55 + lit * 0.45 });
  // 落款 — a small vermilion seal resting inside the circle
  g.appendChild(el('rect', {
    x: C - 9, y: C + 20, width: 18, height: 18, rx: 2.5,
    fill: 'var(--shu)', opacity: 0.75 + lit * 0.25,
  }));
  svg.appendChild(g);
}

// ── the garden — grows with level and 歩み ────────────
export function drawMandala(svg, { level = 1, reiryoku = 0 } = {}) {
  svg.replaceChildren();
  const C = 160;
  const tone = Math.min(1, 0.4 + level * 0.09);
  const root = el('g', { fill: 'none', 'stroke-linecap': 'round' });

  // L2+ 芽吹き — small sprout strokes scattered on the ground ring
  if (level >= 2) {
    const sprouts = Math.min(18, 4 + (level - 2) * 3);
    for (let i = 0; i < sprouts; i++) {
      const a = (i * 2 * Math.PI) / sprouts + 0.35;
      const r = 108 + (i % 3) * 9;
      const x = C + r * Math.cos(a), y = C + r * Math.sin(a);
      root.appendChild(el('path', {
        d: `M ${x} ${y + 5} q 1.5 -6 0 -10 M ${x} ${y - 2} q 4 -3 6 -7 M ${x} ${y - 2} q -4 -3 -6 -7`,
        stroke: 'var(--el-wood)', 'stroke-width': 1.6, opacity: 0.5 * tone,
      }));
    }
  }

  // L3+ 麻の葉の気配 — radial hemp-leaf rays
  if (level >= 3) {
    const rays = 12 + Math.min(12, (level - 3) * 4);
    for (let i = 0; i < rays; i++) {
      const a = (i * 2 * Math.PI) / rays;
      const x1 = C + 74 * Math.cos(a), y1 = C + 74 * Math.sin(a);
      const x2 = C + 92 * Math.cos(a), y2 = C + 92 * Math.sin(a);
      root.appendChild(el('line', {
        x1, y1, x2, y2,
        stroke: 'var(--brush)', 'stroke-width': 0.8, opacity: 0.3 * tone,
      }));
    }
  }

  // L4+ 花 — a ring of petals
  if (level >= 4) {
    const petals = Math.min(20, 8 + (level - 4) * 4);
    for (let i = 0; i < petals; i++) {
      const a = (i * 2 * Math.PI) / petals - Math.PI / 2;
      const r1 = 96, r2 = 126;
      const x1 = C + r1 * Math.cos(a), y1 = C + r1 * Math.sin(a);
      const x2 = C + r2 * Math.cos(a), y2 = C + r2 * Math.sin(a);
      const spread = Math.PI / petals;
      const cxA = C + 112 * Math.cos(a - spread), cyA = C + 112 * Math.sin(a - spread);
      const cxB = C + 112 * Math.cos(a + spread), cyB = C + 112 * Math.sin(a + spread);
      root.appendChild(el('path', {
        d: `M ${x1} ${y1} Q ${cxA} ${cyA} ${x2} ${y2} Q ${cxB} ${cyB} ${x1} ${y1}`,
        stroke: 'var(--shu)', 'stroke-width': 0.7, opacity: 0.34 * tone,
      }));
    }
  }

  // L5+ 青海波 — quiet waves beneath everything (実り)
  if (level >= 5) {
    const rows = Math.min(3, level - 4);
    for (let row = 0; row < rows; row++) {
      const baseR = 136 + row * 8;
      for (let i = 0; i < 9; i++) {
        const a = (i * 2 * Math.PI) / 9 + row * 0.25;
        const x = C + baseR * Math.cos(a), y = C + baseR * Math.sin(a);
        root.appendChild(el('path', {
          d: `M ${x - 8} ${y} a 8 8 0 0 1 16 0 M ${x - 4.5} ${y} a 4.5 4.5 0 0 1 9 0`,
          stroke: 'var(--el-water)', 'stroke-width': 0.9, opacity: 0.3 * tone,
        }));
      }
    }
  }

  // the ensō itself — always present, steadier as the garden grows
  enso(root, C, C, 64, { width: 7, opacity: Math.min(1, 0.5 + level * 0.09) });

  // 落款 — the red seal, warming with 歩み
  const seal = Math.min(1, 0.55 + reiryoku / 300);
  root.appendChild(el('rect', {
    x: C - 8, y: C + 24, width: 16, height: 16, rx: 2.5,
    fill: 'var(--shu)', opacity: seal, stroke: 'none',
  }));

  svg.appendChild(root);
}
