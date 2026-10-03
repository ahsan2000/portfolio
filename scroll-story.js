/* Foreground scrolls naturally; the persistent world follows at a slower pace. */
(() => {
  const panels = [...document.querySelectorAll('.story-panel')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let frame = 0;
  panels.forEach(panel => {panel.removeAttribute('aria-hidden');panel.inert=false;});
  function update() {
    frame = 0;
    const distance = Math.max(root.scrollHeight - innerHeight, 1);
    const progress = Math.max(0, Math.min(scrollY / distance, 1));
    const drift = motion.matches ? 0 : -Math.min(scrollY * .018, innerHeight * .12);
    const foreground = motion.matches ? 0 : -Math.min(scrollY * .09, innerHeight * .5);
    root.style.setProperty('--world-drift', `${drift.toFixed(2)}px`);
    root.style.setProperty('--foreground-drift', `${foreground.toFixed(2)}px`);
    const index = Math.max(0,panels.findLastIndex(panel => panel.getBoundingClientRect().top < innerHeight*.55));
    window.dispatchEvent(new CustomEvent('devops-story-progress',{detail:{progress:motion.matches?0:progress,index}}));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  motion.addEventListener('change',schedule);
  update();
})();
