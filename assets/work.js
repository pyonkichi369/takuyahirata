/* HIRATA CREATIVE homepage — header scroll shadow + mobile nav toggle.
   v2: the IntersectionObserver scroll-reveal system was removed (it made
   every section opacity:0 until scrolled into view, with a 2.5s JS
   fallback timer — verified via WebKit screenshot to produce a real
   ~2.5s blank-page window on load, 2026-10-07). The page now uses a
   pure-CSS load-time fade (@keyframes in work.css), so content is never
   dependent on this script to become visible. */
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
})();
