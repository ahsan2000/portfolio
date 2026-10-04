/* Opening transition and a quiet drift of DevOps marks through the world. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const loader=document.querySelector('#portfolio-loader');
  if(loader){
    const bar=loader.querySelector('i'),count=loader.querySelector('b');
    const started=performance.now();let loaded=document.readyState==='complete',finished=false,raf=0;
    function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);bar.style.transform='scaleX(1)';count.textContent='100%';loader.classList.add('is-complete');setTimeout(()=>loader.remove(),motion.matches?0:800);}
    function tick(now){
      const elapsed=now-started;
      const progress=loaded?Math.min(100,elapsed/(motion.matches?1:950)*100):Math.min(92,elapsed/18);
      count.textContent=`${Math.floor(progress)}%`;bar.style.transform=`scaleX(${progress/100})`;
      if(progress>=100){finish();return;}raf=requestAnimationFrame(tick);
    }
    window.addEventListener('load',()=>{loaded=true;},{once:true});
    window.addEventListener('pageshow',e=>{if(e.persisted)finish();});
    setTimeout(finish,4500);raf=requestAnimationFrame(tick);
  }
  const field=document.querySelector('.tool-drift');
  if(!field)return;
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
