/* Open the service overview after the loading screen, without hiding it if JS fails. */
(() => {
  const card = document.querySelector('.hero-service-card');
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heading = card.querySelector('h2');
  const firstLine = heading.querySelector('.service-title-first');
  const details = [...card.querySelectorAll('.service-title-second, li, a')];
  let played = false;
  function open() {
    if (played || !card.animate) return;
    played = true;
    const fullHeight = card.getBoundingClientRect().height;
    const startHeight = heading.offsetTop + firstLine.offsetHeight + 32;
    card.animate([
      { height: `${startHeight}px`, overflow: 'hidden' },
      { height: `${fullHeight}px`, overflow: 'hidden' }
    ], { duration: 1100, delay: 400, easing: 'cubic-bezier(.22,1,.36,1)' });
    firstLine.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500 });
    details.forEach((item, index) => item.animate([
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 500, delay: 650 + index * 140, fill: 'backwards', easing: 'ease-out' }));
    // The accent rule grows before the card unfolds.
    card.classList.add('service-opening');
    setTimeout(() => card.classList.remove('service-opening'), 1600);
  }
  window.addEventListener('portfolio-ready', open, { once: true });
  // Also handles back/forward navigation and a missing loader.
  window.addEventListener('pageshow', () => {
    if (!document.querySelector('#portfolio-loader')) open();
  });
  setTimeout(open, 2000);
})();
