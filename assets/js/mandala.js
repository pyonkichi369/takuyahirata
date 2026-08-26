// 天照界 — procedural sacred geometry.
// The 界紋 (world sigil) and the growing mandala are generated, not drawn
// from religious sources — original symbols per the world's own rule.

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function polygonPoints(cx, cy, r, n, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// ── 界紋 — five-pointed star woven through a double ring ──
export function drawSigil(svg, { lit = 0 } = {}) {
  svg.replaceChildren();
  const C = 100;
  const gold = lit > 0.5 ? 'var(--gold-bright)' : 'var(--gold)';
  const op = 0.25 + lit * 0.75;
  const g = el('g', { fill: 'none', stroke: gold, 'stroke-width': 1.2, opacity: op });

  g.appendChild(el('circle', { cx: C, cy: C, r: 88 }));
  g.appendChild(el('circle', { cx: C, cy: C, r: 80, 'stroke-width': 0.5 }));

  // pentagram — unicursal order 0→2→4→1→3
  const star = polygonPoints(C, C, 74, 5);
  const order = [0, 2, 4, 1, 3, 0];
  const d = order.map((i, k) => (k ? 'L' : 'M') + star[i][0].toFixed(2) + ' ' + star[i][1].toFixed(2)).join(' ');
  g.appendChild(el('path', { d }));

  // inner moon + core
  g.appendChild(el('circle', { cx: C, cy: C, r: 26, 'stroke-width': 0.8 }));
  g.appendChild(el('path', { d: `M ${C - 14} ${C} A 14 14 0 1 0 ${C + 14} ${C} A 18 18 0 1 1 ${C - 14} ${C}`, 'stroke-width': 0.8 }));

  // five outer ticks — the five domains keeping watch
  for (const [x, y] of polygonPoints(C, C, 84, 5)) {
    const dx = x - C, dy = y - C, len = Math.hypot(dx, dy);
    g.appendChild(el('line', {
      x1: x, y1: y,
      x2: C + (dx / len) * 92, y2: C + (dy / len) * 92,
      'stroke-width': 1.5,
    }));
  }
  svg.appendChild(g);
}

// ── mandala — grows with level and 霊力 ──────────────
// level 1: faint ring. Each level adds rings, petals, lattice detail.
export function drawMandala(svg, { level = 1, reiryoku = 0 } = {}) {
  svg.replaceChildren();
  const C = 160;
  const light = Math.min(1, 0.25 + level * 0.12);
  const root = el('g', { fill: 'none', 'stroke-linecap': 'round' });

  const ring = (r, w, o, color = 'var(--gold)') =>
    root.appendChild(el('circle', { cx: C, cy: C, r, stroke: color, 'stroke-width': w, opacity: o }));

  // base rings — always present
  ring(150, 1, 0.35 * light);
  ring(142, 0.5, 0.3 * light);

  // petals: 8 at L2, +4 per level, cap 32
  if (level >= 2) {
    const petals = Math.min(32, 8 + (level - 2) * 4);
    for (let i = 0; i < petals; i++) {
      const a = (i * 2 * Math.PI) / petals - Math.PI / 2;
      const r1 = 96, r2 = 134;
      const x1 = C + r1 * Math.cos(a), y1 = C + r1 * Math.sin(a);
      const x2 = C + r2 * Math.cos(a), y2 = C + r2 * Math.sin(a);
      const spread = Math.PI / petals;
      const cxA = C + 120 * Math.cos(a - spread), cyA = C + 120 * Math.sin(a - spread);
      const cxB = C + 120 * Math.cos(a + spread), cyB = C + 120 * Math.sin(a + spread);
      root.appendChild(el('path', {
        d: `M ${x1} ${y1} Q ${cxA} ${cyA} ${x2} ${y2} Q ${cxB} ${cyB} ${x1} ${y1}`,
        stroke: 'var(--gold)', 'stroke-width': 0.6, opacity: 0.5 * light,
      }));
    }
    ring(96, 0.8, 0.5 * light);
  }

  // five-domain pentagon lattice at L3+
  if (level >= 3) {
    const pts = polygonPoints(C, C, 78, 5);
    const poly = pts.map((p) => p.join(',')).join(' ');
    root.appendChild(el('polygon', { points: poly, stroke: 'var(--gold)', 'stroke-width': 0.7, opacity: 0.55 * light }));
    for (const [x, y] of pts) {
      root.appendChild(el('circle', { cx: x, cy: y, r: 3, stroke: 'var(--gold)', 'stroke-width': 0.7, opacity: 0.6 * light }));
    }
  }

  // inner court at L4+ (式神が現れる)
  if (level >= 4) {
    const pts = polygonPoints(C, C, 52, 5, Math.PI / 2 - Math.PI / 5);
    for (let i = 0; i < 5; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 2) % 5];
      root.appendChild(el('line', { x1, y1, x2, y2, stroke: 'var(--gold)', 'stroke-width': 0.5, opacity: 0.5 * light }));
    }
    ring(52, 0.6, 0.55 * light);
  }

  // completing detail rings at L5+
  if (level >= 5) {
    const extra = Math.min(6, level - 4);
    for (let i = 0; i < extra; i++) ring(60 + i * 6, 0.35, 0.35 * light);
  }

  // 中尊 — the central light. Radius breathes with 霊力.
  const coreR = 12 + Math.min(14, reiryoku / 20);
  root.appendChild(el('circle', {
    cx: C, cy: C, r: coreR + 10, stroke: 'var(--gold)', 'stroke-width': 0.5, opacity: 0.5 * light,
  }));
  root.appendChild(el('circle', {
    cx: C, cy: C, r: coreR, fill: 'url(#coreGlow)', stroke: 'none', opacity: Math.min(1, 0.55 + level * 0.08),
  }));

  // radial defs
  const defs = el('defs', {});
  const grad = el('radialGradient', { id: 'coreGlow' });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': 'var(--gold-bright)' }));
  grad.appendChild(el('stop', { offset: '60%', 'stop-color': 'var(--gold)' }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': 'transparent' }));
  defs.appendChild(grad);
  svg.appendChild(defs);
  svg.appendChild(root);
}
