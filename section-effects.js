/* Keep expensive decorative animations active only where they are visible. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const sections = document.querySelectorAll('.live-architecture, .product-feature');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('effects-offscreen', !entry.isIntersecting));
  }, { rootMargin: '100px' });
  sections.forEach(section => {
    section.classList.add('effects-offscreen');
    observer.observe(section);
  });
  window.addEventListener('pagehide', event => { if (!event.persisted) observer.disconnect(); });
})();
