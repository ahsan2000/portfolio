const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll('.section-heading, .project-card, .delivery-card, .architecture-card, .capability-grid > div, .approach li, .contact-grid > a, .cta');
  revealItems.forEach((item) => item.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

if (!reducedMotion) {
  let scrollFrame = 0;
  const updateScrollMotion = () => {
    const page = document.documentElement;
    const maxScroll = Math.max(page.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(window.scrollY / maxScroll, 1);
    page.style.setProperty('--scroll-progress', progress.toFixed(4));
    page.style.setProperty('--ticker-shift', `${Math.min(window.scrollY * 0.14, 260)}px`);
    page.style.setProperty('--scroll-parallax', `${Math.min(window.scrollY * 0.025, 28)}px`);
    scrollFrame = 0;
  };

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollMotion);
  }, { passive: true });
  updateScrollMotion();

  document.querySelectorAll('.motion-stage').forEach((stage) => {
    stage.addEventListener('pointermove', (event) => {
      const bounds = stage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      stage.style.setProperty('--pointer-x', `${x * 7}px`);
      stage.style.setProperty('--pointer-y', `${y * 7}px`);
    });

    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--pointer-x', '0px');
      stage.style.setProperty('--pointer-y', '0px');
    });
  });
}
