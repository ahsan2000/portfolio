(() => {
  const explorer = document.querySelector('.stack-explorer');
  if (!explorer) return;
  const tabs = [...explorer.querySelectorAll('.stack-tab')];
  const panels = [...explorer.querySelectorAll('.stack-panel')];
  const play = explorer.querySelector('.stack-play');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer = null;
  let playing = !motion.matches;
  let visible = !('IntersectionObserver' in window);
  const stopTimer = () => { window.clearInterval(timer); timer = null; };
  const updateControl = () => {
    play.textContent = playing ? 'Pause tour' : 'Play tour';
    play.setAttribute('aria-pressed', String(playing));
  };
  const schedule = () => {
    stopTimer();
    if (playing && visible && !document.hidden && !document.documentElement.classList.contains('motion-off')) {
      timer = window.setInterval(() => select(active + 1), 6500);
    }
  };
  const pause = () => { playing = false; stopTimer(); updateControl(); };
  function select(index, focus = false) {
    active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
      panels[i].hidden = i !== active;
      panels[i].classList.remove('stack-enter');
    });
    if (!motion.matches && !document.documentElement.classList.contains('motion-off')) {
      // Restart the stagger even when the current layer is selected again.
      void panels[active].offsetWidth;
      panels[active].classList.add('stack-enter');
    }
    explorer.querySelector('.stack-current').textContent = String(active + 1).padStart(2, '0');
    explorer.style.setProperty('--stack-progress', `${(active + 1) / tabs.length * 100}%`);
    const tab = tabs[active];
    const strip = tab.parentElement;
    strip.scrollTo({ left: tab.offsetLeft - strip.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2, behavior: motion.matches || document.documentElement.classList.contains('motion-off') ? 'instant' : 'smooth' });
    if (focus) tab.focus({ preventScroll: true });
  }
  const navigate = index => { select(index); schedule(); };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => navigate(i));
    tab.addEventListener('keydown', event => {
      const index = event.key === 'ArrowRight' ? active + 1 : event.key === 'ArrowLeft' ? active - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (index === null) return;
      event.preventDefault(); pause(); select(index, true);
    });
  });
  explorer.querySelector('.stack-prev').addEventListener('click', () => navigate(active - 1));
  explorer.querySelector('.stack-next').addEventListener('click', () => navigate(active + 1));
  play.addEventListener('click', () => {
    playing = !playing;
    updateControl(); schedule();
  });
  // Keep keyboard users' selected content in place until they resume the tour.
  explorer.addEventListener('focusin', event => {
    if (event.target !== play && event.target.matches(':focus-visible')) pause();
  });
  // Native vertical scrolling stays available; only deliberate horizontal gestures switch layers.
  let swipe = null;
  explorer.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary || !event.target.closest('.stack-panel') || event.target.closest('a,button,input,select,textarea')) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    explorer.setPointerCapture(event.pointerId);
    stopTimer();
  }, { passive: true });
  explorer.addEventListener('pointerup', event => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    const deliberate = Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.4 && performance.now() - swipe.time < 1200;
    swipe = null;
    if (deliberate) { pause(); select(active + (dx < 0 ? 1 : -1)); }
    else schedule();
  }, { passive: true });
  explorer.addEventListener('pointercancel', () => { swipe = null; schedule(); }, { passive: true });
  window.addEventListener('portfolio-motion-change', schedule);
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: 0.15 }).observe(explorer);
  }
  motion.addEventListener('change', () => { playing = !motion.matches; updateControl(); schedule(); });
  panels.forEach(panel => panel.querySelectorAll('.stack-tools li').forEach((tool, i) => tool.style.setProperty('--tool-order', i)));
  updateControl();
  select(0);
  schedule();
})();
