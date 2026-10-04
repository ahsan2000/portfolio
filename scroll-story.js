/* Scroll through the infrastructure while the hero stays in normal document flow. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const title = document.querySelector('#hero-title');
  let frame = 0;
  function update() {
    frame = 0;
    const distance = Math.max(root.scrollHeight - innerHeight, 1);
    const progress = Math.max(0, Math.min(scrollY / distance, 1));
    root.style.setProperty('--foreground-drift', `${motion.matches ? 0 : -Math.min(scrollY * .09, innerHeight * .5)}px`);
    const chapter = progress < .31 ? 0 : progress < .59 ? 1 : progress < .87 ? 2 : 3;
    window.dispatchEvent(new CustomEvent('devops-story-progress',{detail:{progress:motion.matches?0:progress,index:chapter}}));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  if(title){
    title.addEventListener('pointermove',event=>{
      if(motion.matches || event.pointerType==='touch')return;
      const r=title.getBoundingClientRect();
      title.style.setProperty('--title-x', `${(event.clientX-r.left)/r.width*8-4}deg`);
      title.style.setProperty('--title-y', `${4-(event.clientY-r.top)/r.height*8}deg`);
    });
    title.addEventListener('pointerleave',()=>{title.style.setProperty('--title-x','0deg');title.style.setProperty('--title-y','0deg');});
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  motion.addEventListener('change',schedule);
  update();
})();
