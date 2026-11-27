/* Scroll is a continuous camera timeline, with one visible stage and a horizontal work reel. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = matchMedia('(max-width: 900px)');
  const narrowOffers = matchMedia('(max-width: 700px)');
  const originals = [...main.children];
  const stage = document.createElement('div'); stage.className = 'scene-stage';
  const emblem = document.createElement('div'); emblem.className = 'scene-emblem';emblem.setAttribute('aria-hidden','true');
  emblem.innerHTML=`<div class="infra-orbit" aria-hidden="true"><svg viewBox="0 0 600 600" fill="none"><circle cx="300" cy="300" r="218" stroke="currentColor" stroke-dasharray="3 12"/><circle cx="300" cy="300" r="160" stroke="currentColor" opacity=".35"/><path d="M300 82V218M518 300H382M300 518V382M82 300H218" stroke="currentColor"/><path d="M145 145L245 245M455 145L355 245M455 455L355 355M145 455L245 355" stroke="currentColor" opacity=".4"/><rect x="242" y="242" width="116" height="116" rx="28" stroke="currentColor" stroke-width="2"/><path d="M270 303h60m-48-17-16 17 16 17m36-34 16 17-16 17" stroke="currentColor" stroke-width="3"/><circle cx="300" cy="82" r="8" fill="currentColor"/><circle cx="518" cy="300" r="8" fill="currentColor"/><circle cx="300" cy="518" r="8" fill="currentColor"/><circle cx="82" cy="300" r="8" fill="currentColor"/></svg><span class="infra-node node-code"><img src="assets/tools/githubactions.svg" alt="">CI/CD</span><span class="infra-node node-cloud"><img src="assets/tools/terraform.svg" alt="">INFRASTRUCTURE</span><span class="infra-node node-cluster"><img src="assets/tools/kubernetes.svg" alt="">KUBERNETES</span><span class="infra-node node-observe"><img src="assets/tools/grafana.svg" alt="">OBSERVABILITY</span><span class="infra-center">CODE TO CLOUD</span></div>`;
  const definitions=[
    ['opening','Build. Deploy. Keep it running.'],
    ['work','Selected production work'],
    ['products','Built after hours'],
    ['offers','What I can offer'],
    ['services','From code to production'],
    ['engineering','The engineer behind the systems'],
    ['contact','Let’s build something reliable.']
  ];
  const scenes=definitions.map(([key,label])=>{
    const panel=document.createElement('div');panel.className=`scene-panel scene-${key}`;
    const inner=document.createElement('div');inner.className='scene-content';panel.append(inner);stage.append(panel);
    return {key,label,panel,inner,start:0,hold:0,overflow:0,reveals:[]};
  });
  originals.forEach(node=>{
    let index=5;
    if(node.id==='journey'||node.classList.contains('studio-showcase'))index=0;
    else if(node.id==='work')index=1;
    else if(node.id==='side-projects')index=2;
    else if(node.id==='capabilities')index=3;
    else if(node.classList.contains('cinema-services')||['ai-infrastructure','consulting','approach'].includes(node.id))index=4;
    else if(node.id==='contact')index=6;
    if(node.classList.contains('scroll-ticker')){node.hidden=true;index=5;}
    scenes[index].inner.append(node);
  });
  stage.prepend(emblem);main.append(stage);
  const offerGrid=document.querySelector('#capabilities .capability-grid');
  const offerCards=offerGrid?[...offerGrid.children]:[];
  const offerDescriptions=[
    'Production-ready cloud and Kubernetes environments with networking, access controls, and clear documentation.',
    'Automated builds, checks, deployments, and rollback steps for repeatable releases.',
    'Reusable Terraform and Ansible configurations that keep environments consistent and changes reviewable.',
    'Useful dashboards, logs, alerts, and runbooks for troubleshooting production systems.',
    'Complete websites with frontend, backend, and database integration, from idea to deployment.',
    'Kotlin Multiplatform apps with shared logic, backend integration, and release preparation.',
    'Domain configuration, DNS records, and HTTPS certificates across registrars and hosting providers.',
    'Hosting setup, migrations, launch checks, and ongoing maintenance for websites and apps.'
  ];
  const offerIcons=['kubernetes','githubactions','terraform','grafana','nginx','kotlin','nginx','docker'];
  if(offerGrid){
    offerGrid.classList.add('offer-deck');
    offerCards.forEach((card,index)=>{
      card.classList.add('offer-card');
      if(card.querySelector('p'))card.querySelector('p').textContent=offerDescriptions[index]||card.querySelector('p').textContent;
      const image=document.createElement('img');image.className='offer-art';image.alt='';
      image.src=`assets/tools/${offerIcons[index%offerIcons.length]}.svg`;card.append(image);
    });
    const center=document.createElement('div');center.className='offer-center';center.setAttribute('aria-hidden','true');
    center.innerHTML='<div class="offer-center-ring"></div><img src="assets/portfolio-logo.svg" alt=""><span>CODE TO CLOUD</span>';
    offerGrid.append(center);
  }
  const offerCounter=document.createElement('p');offerCounter.className='offer-counter';
  offerCounter.setAttribute('aria-hidden','true');offerGrid?.after(offerCounter);
  const work=document.getElementById('work');const rail=work?.querySelector('.project-grid');
  let enabled=false,nativeOpening=false,current=-1,frame=0,origin=0,height=0,transition=0,total=0,cameraY=null,lastPaint=0;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=v=>v*v*(3-2*v);
  // Skip identical writes: settled cards and hidden scenes need no frame work.
  const styleCache=new WeakMap();
  function style(node,key,value){
    let cache=styleCache.get(node);if(!cache){cache={};styleCache.set(node,cache);}
    if(cache[key]===value)return;cache[key]=value;
    if(key.startsWith('--'))node.style.setProperty(key,value);else node.style[key]=value;
  }
  const px=value=>Math.round(value*10)/10;
  function measure(){
    if(!enabled)return;
    nativeOpening=smallScreen.matches;
    document.documentElement.classList.toggle('native-opening',nativeOpening);
    if(nativeOpening) main.before(scenes[0].panel);
    else if(scenes[0].panel.parentElement && scenes[0].panel.parentElement!==stage) stage.prepend(scenes[0].panel);
    height=stage.clientHeight;origin=scrollY+main.getBoundingClientRect().top;transition=height*.8;
    scenes.forEach(s=>{s.panel.style.display="block";styleCache.delete(s.panel);});
    let cursor=0;
    scenes.forEach((s,i)=>{
      if(nativeOpening&&i===0){s.start=0;s.hold=0;s.overflow=0;return;}
      s.overflow=i===1?Math.max(0,rail.scrollWidth+rail.offsetLeft-stage.clientWidth):Math.max(0,s.inner.scrollHeight-height);
      if(s.key==='offers')s.overflow=0;
      s.hold=s.key==='offers'?height*(offerCards.length*.7+ .8):height*(i===0?1.15:.8)+s.overflow;
      s.start=cursor;cursor+=s.hold+transition;
      const candidates = (i===1||s.key==='offers') ? [] : [...(s.inner.querySelectorAll?.('.section-heading, .hero-service-card, .side-project-card, .github-callout, .capability-grid>div, .consultation-grid>div, .approach li, .experience-list>article, .stack-explorer, .architecture-card, .video-frame, .contact-layout, .studio-identity') || [])];
      s.reveals=candidates.map((node,index)=>{
        node.classList.add('section-motion');
        node.style.setProperty('--card-turn',`${index%2===0?1:-1}`);
        let top=0,parent=node;
        while(parent&&parent!==s.inner){top+=parent.offsetTop;parent=parent.offsetParent;}
        return {node,top,delay:index%3*18,last:-1};
      });
    });
    total=cursor-transition;main.style.height=`${total+height}px`;
    if(frame)cancelAnimationFrame(frame);frame=0;paint();
  }
  function paint(){
    frame=0;if(!enabled)return;
    const targetY=clamp(scrollY-origin,0,total);
    const now=performance.now(),dt=Math.min(50,Math.max(1,now-lastPaint||16));lastPaint=now;
    if(cameraY===null)cameraY=targetY;
    cameraY+=(targetY-cameraY)*(1-Math.exp(-dt/42));
    if(Math.abs(targetY-cameraY)<.15)cameraY=targetY;
    const y=cameraY;
    let selected=nativeOpening?1:0;
    scenes.forEach((s,i)=>{
      if(nativeOpening&&i===0){s.panel.removeAttribute('style');s.inner.removeAttribute('style');return;}
      const incoming=(i===0||(nativeOpening&&i===1))?1:clamp((y-s.start+transition)/transition);
      const outgoing=i===scenes.length-1?0:clamp((y-s.start-s.hold)/transition);
      const visible=incoming>0&&outgoing<1;
      // display:none cannot be defeated by descendant visibility declarations.
      style(s.panel,'display',visible?'block':'none');
      style(s.panel,'willChange',visible?'transform,opacity':'auto');
      if(!visible)return;
      const a=ease(incoming),b=ease(outgoing);
      style(s.panel,'zIndex',String(i+1));
      style(s.panel,'opacity',(a*(1-b)).toFixed(3));

      // Fade through the shared dark stage, without overlapping readable sections.
      style(s.panel,'transform',`translate3d(0,${px(((1-a)*.12-b*.08)*height)}px,0)`);
      const travel=clamp((y-s.start-height*.3)/Math.max(1,s.hold-height*.6));
      style(s.inner,'transform',i===1?'none':`translate3d(0,${px(-travel*s.overflow)}px,0)`);
      if(s.key==='offers'){
        const progress=clamp((y-s.start-height*.25)/Math.max(1,s.hold-height*.8));
        const position=.08+progress*(offerCards.length-.3);
        const slots=narrowOffers.matches?2:4;
        offerCards.forEach((card,index)=>{
          const enter=ease(clamp((position-index)/.78));
          const exit=ease(clamp((position-index-slots+.2)*5));
          const shown=enter>0&&exit<1;
          if(card.hidden===shown){card.hidden=!shown;card.inert=!shown;card.setAttribute('aria-hidden',String(!shown));}
          if(!shown)return;
          const slot=index%slots;
          style(card,'--offer-column',String(slots===2?1:(slot%2===0?1:3)));
          style(card,'--offer-row',String(slots===2?slot+1:Math.floor(slot/2)+1));
          style(card,'--offer-opacity',(enter*(1-exit)).toFixed(3));
          style(card,'--offer-transform',`perspective(1000px) translate3d(${(1-enter)*(slot%2===0?-130:130)}px,${(1-enter)*65-exit*40}px,0) rotateY(${(1-enter)*(slot%2===0?12:-12)}deg) rotateZ(${(1-enter)*(slot%2===0?-3:3)}deg) scale(${.88+enter*.12-exit*.03})`);
        });
        const counter=`${String(Math.min(offerCards.length,Math.max(1,Math.ceil(position)))).padStart(2,'0')} / ${offerCards.length} SERVICES · SCROLL TO EXPLORE`;
        if(offerCounter.textContent!==counter)offerCounter.textContent=counter;
      }
      if(i===1)style(rail,'transform',`translate3d(${px(-travel*s.overflow)}px,0,0)`);
      s.reveals.forEach(item=>{
        const top=item.top-travel*s.overflow;
        const progress=clamp((height*.94-top-item.delay)/(height*.23));
        if(Math.abs(progress-item.last)>.002){item.node.style.setProperty('--section-progress',progress.toFixed(3));item.last=progress;}
      });
      if(i===0){
        s.panel.style.setProperty('--opening-flight',String(clamp((y-s.start)/s.hold)));
      }
    });
    scenes.forEach((s,i)=>{if(!(nativeOpening&&i===0)&&y>=s.start-transition*.35)selected=i;});
    if(selected!==current){
      current=selected;
      scenes.forEach((s,i)=>{const inactive=i!==current&&!(nativeOpening&&i===0);s.panel.inert=inactive;s.panel.setAttribute('aria-hidden',String(inactive));});
    }
    // A quiet infrastructure map connects chapters without obscuring the content.
    const phase=y/Math.max(1,total);
    style(document.documentElement,'--scroll-progress',phase.toFixed(4));
    emblem.style.opacity=current===0?'.42':'.16';
    window.dispatchEvent(new CustomEvent('portfolio-camera-frame',{detail:{y:scrollY-origin<0?scrollY:y+origin}}));
    emblem.style.transform=`translate3d(${Math.sin(phase*Math.PI*2)*5}vw,${Math.cos(phase*Math.PI*2)*4}vh,0) rotate(${-8+phase*16}deg)`;
    if(cameraY!==targetY)schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function route(hash,behavior='smooth'){
    let id;try{id=decodeURIComponent(hash.slice(1));}catch{return false;}
    const target=document.getElementById(id);if(!target)return false;
    const index=target===main?0:scenes.findIndex(s=>s.inner.contains(target));if(index<0)return false;
    if(nativeOpening&&index===0){scrollTo({top:0,behavior});return true;}
    const s=scenes[index];let offset=0;
    if(index===1&&target.closest('.project-card'))offset=target.closest('.project-card').offsetLeft;
    else if(target!==main){let n=target;while(n&&n!==s.inner){offset+=n.offsetTop;n=n.offsetParent;}offset=clamp(offset,0,s.overflow);}
    const position=s.start+(offset?height*.3+offset/Math.max(1,s.overflow)*(s.hold-height*.6):0);
    scrollTo({top:origin+position,behavior});return true;
  }
  function mode(){
    enabled=!motion.matches;
    document.documentElement.classList.toggle('scene-scroll',enabled);document.documentElement.classList.toggle('scene-reading',!enabled);
    main.style.height='';current=-1;cameraY=null;
    scenes.forEach(s=>{styleCache.delete(s.panel);styleCache.delete(s.inner);});
    offerCards.forEach(card=>styleCache.delete(card));if(rail)styleCache.delete(rail);
    scenes.forEach(s=>{s.panel.removeAttribute('style');s.inner.removeAttribute('style');s.panel.inert=false;s.panel.removeAttribute('aria-hidden');});
    rail?.style.removeProperty('transform');
    offerCards.forEach(card=>{card.hidden=false;card.inert=false;card.removeAttribute('aria-hidden');card.removeAttribute('style');});
    if(!enabled&&nativeOpening){stage.prepend(scenes[0].panel);nativeOpening=false;document.documentElement.classList.toggle('native-opening',false);}
    if(enabled){measure();if(location.hash)route(location.hash,'instant');}
  }
  document.addEventListener('click',e=>{
    if(!enabled||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const link=e.target.closest('a[href^="#"],sakuga-button[data-href^="#"]');const hash=link?.getAttribute('href')||link?.dataset.href;
    if(hash&&route(hash)){e.preventDefault();e.stopImmediatePropagation();history.pushState(null,'',hash);}
  },true);
  window.addEventListener('hashchange',()=>{if(enabled)route(location.hash);});window.addEventListener('popstate',()=>{if(enabled)route(location.hash||'#top');});
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',()=>{const next=!motion.matches;if(next!==enabled)mode();else measure();});motion.addEventListener('change',mode);
  // Fixed dimensions keep hidden scenes measurable without painting them.
  if('ResizeObserver'in window){const observer=new ResizeObserver(()=>measure());observer.observe(stage);}
  document.fonts?.ready.then(measure);
  window.addEventListener('load',measure,{once:true});
  mode();
})();
