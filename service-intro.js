/* Stage the card before first paint, then reveal it when the loader clears. */
(() => {
  const root = document.documentElement;
  const card = document.querySelector('.hero-service-card');
  const reveal = () => root.classList.remove('service-intro-pending');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverDesktop = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  // Desktop uses a hover reveal; touch screens retain the opening animation.
  if (hoverDesktop.matches) { reveal(); return; }
  if (!card || reduced.matches || !card.animate) { reveal(); return; }
  const heading = card.querySelector('h2');
  const firstLine = heading.querySelector('.service-title-first');
  const details = [...card.querySelectorAll('.service-title-second, li, a')];
  let played = false;
  function open() {
    if (played) return;
    played = true;
    const fullHeight = card.getBoundingClientRect().height;
    const startHeight = heading.offsetTop + firstLine.offsetHeight + 32;
    const initialClip = `inset(0 0 ${Math.max(0, fullHeight - startHeight)}px 0 round 18px)`;
    // Install the starting keyframes before exposing the card. Clip instead of
    // animating height so the surrounding layout stays stable while it opens.
    const entrance = card.animate([
      { opacity: 0, transform: 'translateY(24px)', clipPath: initialClip, offset: 0 },
      { opacity: 1, transform: 'translateY(0)', clipPath: initialClip, offset: .3 },
      { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0 0 round 18px)', offset: 1 }
    ], { duration: 1400, fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)' });
    firstLine.animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 450, delay: 150, fill: 'backwards' });
    details.forEach((item, index) => item.animate([
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 450, delay: 600 + index * 140, fill: 'backwards', easing: 'ease-out' }));
    card.classList.add('service-opening');
    reveal();
    entrance.finished.then(() => {
      entrance.cancel();
      card.classList.remove('service-opening');
    }).catch(() => { reveal(); card.classList.remove('service-opening'); });
  }
  window.addEventListener('portfolio-ready', open, { once: true });
  window.addEventListener('pageshow', () => {
    if (!document.querySelector('#portfolio-loader')) open();
  });
  // Covers a loader or script failure without leaving the card hidden.
  setTimeout(open, 2000);
})();
