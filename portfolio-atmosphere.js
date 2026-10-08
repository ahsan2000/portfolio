/* Opening transition and a quiet drift of DevOps marks through the world. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.querySelector('#portfolio-loader');
  if (loader) {
    const bar = loader.querySelector('i'), count = loader.querySelector('b');
    const started = performance.now();
    const duration = motion.matches ? 0 : 650;
    let finished = false, frame = 0;
    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      bar.style.transform = 'scaleX(1)';
      count.textContent = '100%';
      loader.classList.add('is-complete');
      setTimeout(() => loader.remove(), motion.matches ? 0 : 250);
    }
    function tick(now) {
      const progress = duration ? Math.min(1, (now - started) / duration) : 1;
      count.textContent = `${Math.floor(progress * 100)}%`;
      bar.style.transform = `scaleX(${progress})`;
      if (progress >= 1) finish();
      else frame = requestAnimationFrame(tick);
    }
    // This intro never waits for images or optional graphics to download.
    frame = requestAnimationFrame(tick);
    setTimeout(finish, 1000);
    window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
  }
  const field=document.querySelector('.tool-drift');
  if(!field || motion.matches || matchMedia('(max-width: 760px), (pointer: coarse)').matches || navigator.connection?.saveData)return;
  const tools=['kubernetes','docker','terraform','ansible','grafana','githubactions'];
  tools.forEach((tool,i)=>{
    for(let n=0;n<2;n++){
      const drift=document.createElement('span'),logo=document.createElement('img');
      drift.className='drifting-tool';drift.style.setProperty('--tool-left',`${8+(i*17+n*11)%85}%`);
      drift.style.setProperty('--tool-duration',`${30+i*3+n*7}s`);drift.style.setProperty('--tool-delay',`${-i*5-n*17}s`);
      drift.style.setProperty('--tool-size',`${22+(i*7+n*13)%26}px`);
      drift.style.setProperty('--tool-swing',`${(i%2?1:-1)*(26+i*6)}px`);
      logo.src=`assets/tools/${tool}.svg`;logo.alt='';logo.width=48;logo.height=48;
      logo.addEventListener('error',()=>drift.remove(),{once:true});
      drift.append(logo);field.append(drift);
    }
  });
  document.querySelector('#scene-toggle')?.addEventListener('click',e=>{const button=e.currentTarget;queueMicrotask(()=>field.classList.toggle('is-paused',button.getAttribute('aria-pressed')==='true'));});
  document.addEventListener('visibilitychange',()=>field.classList.toggle('is-hidden',document.hidden));
})();
