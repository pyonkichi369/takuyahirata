/* work.html — header scroll shadow, mobile nav toggle, scroll reveal.
   Scoped to .wk; independent of script.js (Brain Lab's custom-cursor script,
   which this page does not use). */
(() => {
  const root = document.querySelector('.wk');
  const header = document.getElementById('wk-header');
  const burger = document.getElementById('wk-burger');

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = root.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  root.querySelectorAll('.wk-mobile-nav a').forEach((a) => {
    a.addEventListener('click', () => {
      root.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
})();
