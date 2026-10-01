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


}

const robotStage = document.querySelector('.robot-stage');
if (robotStage && !reducedMotion) {
  const eyes = robotStage.querySelectorAll('.robot-pupil');
  let eyeFrame = 0;
  let pointer = null;

  const pointEyes = () => {
    const art = robotStage.querySelector('.robot-art');
    const rect = art.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width * .33;
    const eyeCenterY = rect.top + rect.height * .235;
    const dx = pointer ? pointer.x - eyeCenterX : 0;
    const dy = pointer ? pointer.y - eyeCenterY : 0;
    const distance = Math.hypot(dx, dy) || 1;
    const range = Math.min(rect.width * .012, 6);
    const strength = Math.min(distance / 110, 1);
    const x = dx / distance * range * strength;
    const y = dy / distance * range * strength;
    eyes.forEach((eye) => {
      eye.style.setProperty('--eye-x', `${x.toFixed(1)}px`);
      eye.style.setProperty('--eye-y', `${y.toFixed(1)}px`);
    });
    eyeFrame = 0;
  };

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!eyeFrame) eyeFrame = requestAnimationFrame(pointEyes);
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    pointer = null;
    if (!eyeFrame) eyeFrame = requestAnimationFrame(pointEyes);
  });
}

const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const updateBackToTop = () => {
    const visible = window.scrollY > 500;
    backToTop.classList.toggle('is-visible', visible);
    backToTop.tabIndex = visible ? 0 : -1;
    backToTop.setAttribute('aria-hidden', String(!visible));
  };
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();
}
