/* ── Custom cursor ──────────────────────────────────────── */
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, .gallery-item').forEach((el) => {
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

/* ── Scroll reveal (gallery + about) ───────────────────── */
const revealTargets = document.querySelectorAll('.gallery-item, .about-content');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    if (el.classList.contains('gallery-item')) {
      const siblings = Array.from(el.parentElement.children);
      const col = siblings.indexOf(el) % 3;
      el.style.transitionDelay = (col * 80) + 'ms';
    }

    el.classList.add('visible');
    observer.unobserve(el);
  });
}, { threshold: 0.12 });

revealTargets.forEach((el) => observer.observe(el));

/* ── Lightbox ───────────────────────────────────────────── */
const items     = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox  = document.getElementById('lightbox');
const lbImg     = lightbox.querySelector('.lightbox-img');
const lbCaption = lightbox.querySelector('.lightbox-caption');
const closeBtn  = lightbox.querySelector('.lightbox-close');
const prevBtn   = lightbox.querySelector('.lightbox-prev');
const nextBtn   = lightbox.querySelector('.lightbox-next');

let current = 0;

function open(index) {
  current = index;
  const item = items[index];
  lbImg.src = item.querySelector('img').src;
  lbImg.alt = item.querySelector('img').alt;
  lbCaption.textContent = item.querySelector('.gallery-caption').textContent.trim();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function prev() { open((current - 1 + items.length) % items.length); }
function next() { open((current + 1) % items.length); }

items.forEach((item, i) => item.addEventListener('click', () => open(i)));
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prev();
  if (e.key === 'ArrowRight')  next();
});
