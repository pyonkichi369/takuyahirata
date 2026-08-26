// 天照界 — sound layer. Everything is synthesized with WebAudio:
// no audio files, no network, nothing autoplays. Bell = inharmonic
// partials with long decay; drone = two detuned low sines.

let ctx = null;
let droneNodes = null;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// 鈴 — temple bell strike.
export function ringBell() {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.5, now);
  master.connect(ac.destination);

  // inharmonic partial set typical of a small rin bell
  const partials = [
    { f: 523, g: 0.9, d: 3.2 },
    { f: 1244, g: 0.5, d: 2.4 },
    { f: 1785, g: 0.28, d: 1.8 },
    { f: 2513, g: 0.16, d: 1.2 },
    { f: 3430, g: 0.08, d: 0.8 },
  ];
  for (const p of partials) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(p.f, now);
    // slight downward drift gives the strike its body
    osc.frequency.exponentialRampToValueAtTime(p.f * 0.995, now + p.d);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(p.g, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.d);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + p.d + 0.1);
  }
}

// short crackle burst for the goma flame
export function fireCrackle() {
  const ac = ensureCtx();
  const now = ac.currentTime;
  const dur = 1.6;
  const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    // sparse impulse noise ≈ crackling
    data[i] = Math.random() < 0.02 ? (Math.random() * 2 - 1) * Math.random() : 0;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2400;
  filter.Q.value = 0.7;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(now);
}

// low drone — the hum of the world. Toggled, very quiet.
export function startDrone() {
  if (droneNodes) return;
  const ac = ensureCtx();
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.045, ac.currentTime + 3);
  gain.connect(ac.destination);
  const oscs = [55, 55.6, 110.3].map((f) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(gain);
    o.start();
    return o;
  });
  droneNodes = { gain, oscs };
}

export function stopDrone() {
  if (!droneNodes) return;
  const ac = ensureCtx();
  droneNodes.gain.gain.linearRampToValueAtTime(0, ac.currentTime + 1.5);
  const nodes = droneNodes;
  droneNodes = null;
  setTimeout(() => nodes.oscs.forEach((o) => { try { o.stop(); } catch (_) {} }), 1800);
}

export function droneActive() { return !!droneNodes; }
