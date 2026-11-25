/* Opening transition and a quiet drift of DevOps marks through the world. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.querySelector('#portfolio-loader');
  if (loader) {
    const progress = loader.querySelector('sakuga-progress');
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(failsafe);
      loader.classList.add('is-complete');
      setTimeout(() => { loader.remove(); window.dispatchEvent(new Event('portfolio-ready')); }, motion.matches ? 0 : 250);
    }
    // Recovery only: a missing component or stalled asset must not block the site.
    const failsafe = setTimeout(finish, 12000);
    progress.addEventListener('sakuga:done', finish, { once: true });
    window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
    if (typeof progress.set === 'function') {
      const images = [...document.images].filter(image => image.loading !== 'lazy');
      const tasks = images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }));
      tasks.push(document.fonts ? document.fonts.ready : Promise.resolve());
      let settled = 0;
      progress.set(0, true);
      tasks.forEach(task => Promise.resolve(task).catch(() => {}).then(() => {
        if (!finished) progress.set(++settled / tasks.length, motion.matches);
      }));
    } else {
      finish();
    }
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
