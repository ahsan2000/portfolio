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
    if (playing && visible && !document.hidden) {
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
    if (!motion.matches) {
      // Restart the stagger even when the current layer is selected again.
      void panels[active].offsetWidth;
      panels[active].classList.add('stack-enter');
    }
    explorer.querySelector('.stack-current').textContent = String(active + 1).padStart(2, '0');
    explorer.style.setProperty('--stack-progress', `${(active + 1) / tabs.length * 100}%`);
    const tab = tabs[active];
    const strip = tab.parentElement;
    strip.scrollTo({ left: tab.offsetLeft - strip.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2, behavior: motion.matches ? 'instant' : 'smooth' });
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
