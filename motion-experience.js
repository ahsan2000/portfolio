/* Shared navigation and an endless command ribbon; no wheel interception. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.createElement('dialog');
  dialog.className = 'portfolio-menu';
  dialog.id = 'portfolio-menu';
  dialog.setAttribute('aria-label', 'Explore the portfolio');
  dialog.innerHTML = `<div class="menu-top"><span>AHSAN NAWAZ / CLOUD & DEVOPS</span><button type="button" class="menu-close" autofocus>Close <span aria-hidden="true">×</span></button></div><div class="menu-layout"><nav aria-label="Portfolio chapters">${[['#top','Home'],['#work','Production work'],['#capabilities','What I offer'],['#engineering','Tech stack'],['#contact','Let’s talk']].map(([href,label],i)=>`<a href="${href}" style="--menu-order:${i}"><span>${label}</span></a>`).join('')}</nav><div class="menu-aside"><img src="assets/portfolio-logo.svg" width="96" height="96" alt=""><p>From code<br>to production.</p><span>Based in Pakistan.<br>Available worldwide.</span></div></div>`;
  document.body.append(dialog);
  let opener;
  const close = () => { dialog.close(); document.body.classList.remove('menu-is-open'); document.querySelectorAll('.menu-toggle').forEach(b=>b.setAttribute('aria-expanded','false')); opener?.focus({preventScroll:true}); };
  document.querySelectorAll('.site-header,.mobile-header-row').forEach(header=>{
    const button = document.createElement('button');
    button.type='button'; button.className='menu-toggle';button.setAttribute('aria-controls',dialog.id);button.setAttribute('aria-expanded','false');
    button.innerHTML='Menu <span aria-hidden="true"><i></i><i></i></span>';
    button.addEventListener('click',()=>{opener=button;dialog.showModal();document.body.classList.add('menu-is-open');button.setAttribute('aria-expanded','true');});
    (header.querySelector('.theme-nav') || header).append(button);
  });
  dialog.querySelector('.menu-close').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  // Run before the scene router's click listener, without consuming its event.
  window.addEventListener('click',e=>{if(dialog.open&&e.target.closest('.portfolio-menu a'))close();},true);
  const emblem=document.querySelector('.scene-emblem');
  if(!emblem)return;
  const ribbon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  ribbon.setAttribute('viewBox','0 0 600 600');
  ribbon.setAttribute('preserveAspectRatio','xMidYMid meet');ribbon.setAttribute('aria-hidden','true');ribbon.classList.add('command-snake');
  const commands='$ git push  ·  $ terraform apply  ·  $ kubectl rollout status  ·  $ helm upgrade  ·  $ docker build  ·  ';
  ribbon.innerHTML=`<defs><path id="command-orbit" d="M400 82 C790 82 844 578 500 708 C150 840 -150 334 160 144 C225 104 310 82 400 82Z"/></defs><use href="#command-orbit" class="snake-guide"/>${[0,1].map(i=>`<text textLength="2100" lengthAdjust="spacing"><textPath href="#command-orbit" startOffset="${i*100}%">${commands.repeat(2)}</textPath></text>`).join('')}`;
  const snakeLayer=document.createElement('div');snakeLayer.className='traveling-snake';snakeLayer.setAttribute('aria-hidden','true');snakeLayer.append(ribbon);emblem.querySelector('.infra-orbit').append(snakeLayer);
  const path=ribbon.querySelector('#command-orbit');
  // Four matched cubic segments keep the loop closed throughout the morph.
  const circle=[300,-30,482,-30,630,118,630,300,630,482,482,630,300,630,118,630,-30,482,-30,300,-30,118,118,-30,300,-30];
  const winding=[-1800,-600,-1000,-200,-300,900,300,350,900,-200,1400,1000,2100,550,3000,1800,-2800,1800,-2300,800,-2600,100,-2300,-900,-1800,-600];
  // Numerical curve length avoids synchronous SVG geometry/layout reads.
  function curveLength(points){
    let length=0,x=points[0],y=points[1];
    for(let start=2;start<points.length;start+=6){
      const x0=points[start-2],y0=points[start-1];
      for(let step=1;step<=20;step++){
        const t=step/20,u=1-t;
        const nx=u*u*u*x0+3*u*u*t*points[start]+3*u*t*t*points[start+2]+t*t*t*points[start+4];
        const ny=u*u*u*y0+3*u*u*t*points[start+1]+3*u*t*t*points[start+3]+t*t*t*points[start+5];
        length+=Math.hypot(nx-x,ny-y);x=nx;y=ny;
      }
    }return length;
  }
  let cameraScroll=scrollY;
  window.addEventListener('portfolio-camera-frame',event=>{cameraScroll=event.detail.y;});
  window.addEventListener('scroll',()=>{if(!document.documentElement.classList.contains('scene-scroll'))cameraScroll=scrollY;},{passive:true});
  let previousScroll=-1,previousBlend=-1,lastDraw=0;
  const orbitLength=curveLength(circle);
  ribbon.querySelectorAll('text').forEach(text=>text.setAttribute('textLength',String(orbitLength)));
  const texts=[...ribbon.querySelectorAll('textPath')];
  let frame=0,last=0,position=0;
  function paint(time){
    frame=0;if(motion.matches||document.hidden)return;
    if(time-lastDraw<16){frame=requestAnimationFrame(paint);return;}lastDraw=time;
    if(last)position=(position+Math.min(time-last,80)*.0015)%100;
    last=time;
    const scroll=cameraScroll*.008;
    if(cameraScroll!==previousScroll){
      previousScroll=cameraScroll;
      const progress=Math.min(1,cameraScroll/Math.max(1,innerHeight*1.4));
      const blend=progress*progress*(3-2*progress);
      if(Math.abs(blend-previousBlend)>.008||blend===0&&previousBlend!==0||blend===1&&previousBlend!==1){
      previousBlend=blend;
      const points=circle.map((v,i)=>v+(winding[i]-v)*blend);
      path.setAttribute('d',`M${points.slice(0,2).join(' ')} ${[2,8,14,20].map(start=>`C${points.slice(start,start+6).join(' ')}`).join(' ')} Z`);
      const length=curveLength(points);
      ribbon.querySelectorAll('text').forEach(text=>text.setAttribute('textLength',String(length)));
      const repetitions=Math.max(2,Math.round(length/(commands.length*10)));
      texts.forEach(text=>{if(text.dataset.repetitions!==String(repetitions)){text.textContent=commands.repeat(repetitions);text.dataset.repetitions=String(repetitions);}});
      }
      snakeLayer.style.transform=`translate3d(${blend*Math.sin(cameraScroll/innerHeight*.8)*12}%,${blend*Math.sin(cameraScroll/innerHeight*.5)*10}%,0)`;
    }
    texts.forEach((text,i)=>text.setAttribute('startOffset',`${i*100-(position+scroll)%100}%`));
    frame=requestAnimationFrame(paint);
  }
  function sync(){cancelAnimationFrame(frame);last=0;lastDraw=0;if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(paint);}
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);sync();
})();
