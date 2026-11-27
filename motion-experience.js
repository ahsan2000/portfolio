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
  // Static SVG images are rasterized once; only their transforms/opacity move.
  // Live textPath offsets would re-layout hundreds of curved glyphs each frame.
  const commands='$ git push  ·  $ terraform apply  ·  $ kubectl rollout status  ·  $ helm upgrade  ·  $ docker build  ·  ';
  function texture(path,length,viewBox,width,height){
    const phrase=commands.repeat(Math.max(2,Math.round(length/(commands.length*10))));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}"><defs><path id="ribbon" d="${path}"/></defs><use href="#ribbon" fill="none" stroke="#5eead4" stroke-opacity=".12" stroke-width="30"/><text fill="#a5ffe9" font-family="monospace" font-size="18" textLength="${length}" lengthAdjust="spacing"><textPath href="#ribbon">${phrase}</textPath></text></svg>`;
    const image=new Image();image.alt='';image.decoding='async';image.draggable=false;
    image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return image;
  }
  const snakeLayer=document.createElement('div');snakeLayer.className='traveling-snake';snakeLayer.setAttribute('aria-hidden','true');
  const ring=document.createElement('div');ring.className='snake-ring-layer';
  ring.append(texture('M300 -30 C482 -30 630 118 630 300 C630 482 482 630 300 630 C118 630 -30 482 -30 300 C-30 118 118 -30 300 -30 Z',2074,'-150 -150 900 900',1200,1200));
  const wave=document.createElement('div');wave.className='snake-wave-layer';
  wave.append(texture('M-1500 -600 C-1000 -200 -300 900 300 350 C900 -200 1400 1000 1800 550 C2100 1400 -1800 1400 -1800 600 C-2000 100 -1900 -900 -1500 -600 Z',10700,'-2100 -1000 4400 2800',2048,1304));
  snakeLayer.append(ring,wave);emblem.querySelector('.infra-orbit').append(snakeLayer);
  let last='';
  function render(y){
    const progress=Math.max(0,Math.min(1,y/Math.max(1,innerHeight*1.4)));
    const blend=progress*progress*(3-2*progress);
    const key=`${blend.toFixed(3)}:${Math.round(y)}`;if(key===last)return;last=key;
    ring.hidden=blend>=1;wave.hidden=blend<=0;
    ring.style.opacity=String(1-blend);wave.style.opacity=String(blend);
    ring.style.transform=`rotate(${y*.018}deg)`;
    wave.style.transform=`translate3d(${Math.sin(y/innerHeight*.65)*8}%,${Math.sin(y/innerHeight*.4)*6}%,0) rotate(${Math.sin(y/innerHeight*.35)*9}deg)`;
  }
  window.addEventListener('portfolio-camera-frame',event=>render(event.detail.y));
  window.addEventListener('scroll',()=>{if(!document.documentElement.classList.contains('scene-scroll'))render(scrollY);},{passive:true});
  render(scrollY);
})();
