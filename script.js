/* ── Custom cursor ──────────────────────────────────────── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, .series-link, .contact-cta-link').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
});

/* ── Nav hide/show on scroll ────────────────────────────── */
const nav = document.querySelector('.nav');
let lastY = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > lastY && y > 80) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastY = y;
}, { passive: true });

/* ── Scroll reveal (about + contact-cta) ───────────────── */
const revealTargets = document.querySelectorAll('.about-content, .contact-cta-content');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealTargets.forEach((el) => observer.observe(el));
