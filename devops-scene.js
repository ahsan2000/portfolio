/* DevOps scene adaptation. Uses the exact Three.js runtime supplied with Kage.
   Original Kage source is retained in reference/threeui; this world replaces temple geometry. */
(() => {
  const canvas = document.querySelector('#cloud-scene');
  if (!canvas || !window.THREE) return;
  const T = window.THREE;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#scene-toggle');
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'}); }
  catch { canvas.hidden = true; toggle.hidden = true; return; }
  canvas.parentElement.classList.add('has-webgl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(8,7,11); camera.lookAt(0,0,0);
  scene.add(new T.AmbientLight(0x9baebf, .8));
  const key = new T.DirectionalLight(0xffe3cd, 1.9); key.position.set(4,8,6); scene.add(key);
  const red = new T.PointLight(0xe0231c, 3, 25); red.position.set(-4,2,3); scene.add(red);
  const world = new T.Group(); scene.add(world);
  const metal = new T.MeshStandardMaterial({color:0x1c252d,roughness:.4,metalness:.75});
  const pale = new T.MeshStandardMaterial({color:0xaab4ad,roughness:.35,metalness:.55});
  const accent = new T.MeshStandardMaterial({color:0xe0231c,emissive:0xe0231c,emissiveIntensity:.7,roughness:.4});
  const lines = new T.LineBasicMaterial({color:0x75807c,transparent:true,opacity:.45});
  const pathMaterial = new T.LineBasicMaterial({color:0xe0231c,transparent:true,opacity:.7});
  const box = new T.BoxGeometry(1,1,1);
  function mesh(geometry, material, x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);world.add(m);return m;}
  function label(text,x,y,z,size=1,color='#aab4ad'){
    const c=document.createElement('canvas');c.width=512;c.height=96;
    const ctx=c.getContext('2d');ctx.font='26px monospace';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,55);
    const texture=new T.CanvasTexture(c);const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(3*size,.56*size,1);world.add(sprite);
  }
  const grid=new T.GridHelper(16,32,0x632521,0x20272d);grid.position.y=-1.45;world.add(grid);
  mesh(new T.CylinderGeometry(2.1,2.1,.15,6),metal,0,-1.1,0);
  const ring=new T.Mesh(new T.TorusGeometry(2.45,.018,8,96),accent);ring.rotation.x=Math.PI/2;ring.position.y=-1;world.add(ring);
  // Seven spokes reference the Kubernetes wheel; six worker nodes surround the hub.
  const nodes=[];
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;const x=Math.cos(a)*1.65,z=Math.sin(a)*1.65;
    const node=new T.Group();node.position.set(x,0,z);world.add(node);nodes.push(node);
    for(let j=0;j<3;j++){
      const slab=new T.Mesh(box,metal);slab.scale.set(.73,.28,.73);slab.position.y=j*.35;node.add(slab);
      const edges=new T.LineSegments(new T.EdgesGeometry(box),lines);edges.scale.copy(slab.scale);edges.position.copy(slab.position);node.add(edges);
      const led=new T.Mesh(box,accent);led.scale.set(.15,.035,.02);led.position.set(.16,j*.35,.377);node.add(led);
    }
    const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-.8,0),new T.Vector3(x,-.8,z)]),pathMaterial);world.add(line);
  }
  mesh(new T.CylinderGeometry(.42,.42,.8,7),pale,0,.05,0);
  label('KUBERNETES',0,1.65,0,1.1,'#dfe7e0');
  const stages=['COMMIT','BUILD','VERIFY','DEPLOY'];
  const points=[];
  stages.forEach((name,i)=>{let x=-3.6+i*2.4;mesh(box,i===3?accent:metal,x,-1,-3.5,.8,.3,.8);label(name,x,-.45,-3.5,.65);points.push(new T.Vector3(x,-.78,-3.5));});
  const pipeline=new T.Line(new T.BufferGeometry().setFromPoints(points),pathMaterial);world.add(pipeline);
  const delivery=new T.Line(new T.BufferGeometry().setFromPoints([points[3],new T.Vector3(3.6,-.78,0),new T.Vector3(1.65,-.78,0)]),pathMaterial);world.add(delivery);
  label('AWS / AZURE / GCP',0,-1.15,3.5,.85);
  const packets=[];
  for(let i=0;i<7;i++){const p=mesh(new T.SphereGeometry(.045,8,8),accent,0,0,0);packets.push(p);}
  const dustGeo=new T.BufferGeometry(),dust=[];
  for(let i=0;i<160;i++)dust.push((Math.random()-.5)*15,Math.random()*7-1.5,(Math.random()-.5)*12);
  dustGeo.setAttribute('position',new T.Float32BufferAttribute(dust,3));const particles=new T.Points(dustGeo,new T.PointsMaterial({color:0xc9a24a,size:.025,transparent:true,opacity:.45}));world.add(particles);
  let frame=0,paused=motion.matches,visible=true,lost=false,time=0,last=0,targetX=0,targetY=0,storyProgress=0,sceneProgress=0;
  function render(){renderer.render(scene,camera);}
  function tick(now){frame=0;if(paused||!visible||document.hidden||lost)return;const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
    sceneProgress += (storyProgress-sceneProgress)*(1-Math.exp(-dt*3));
    updateCamera(sceneProgress);
    world.rotation.y+=(targetX+sceneProgress*.65-world.rotation.y)*.04;world.rotation.x+=(targetY-world.rotation.x)*.04;
    nodes.forEach((n,i)=>n.position.y=Math.sin(time*.7+i)*.055);
    ring.rotation.z=time*.08;particles.rotation.y=time*.018;
    packets.forEach((p,i)=>{const progress=(time*.18+i/7)%1;p.position.set(-3.6+progress*7.2,-.77,-3.5);});
    render();frame=requestAnimationFrame(tick);
  }
  function updateCamera(progress){
    // A slow approach, orbit and retreat creates depth without moving the text.
    const sweep=Math.sin(progress*Math.PI*2);
    const zoom=Math.sin(progress*Math.PI*3);
    const angle=.63+progress*.6+sweep*.12;
    const radius=13.6-zoom*2.25;
    camera.position.set(Math.sin(angle)*radius,7-progress*1.1+Math.sin(progress*Math.PI*2)*1.1,Math.cos(angle)*radius);
    camera.lookAt(0,Math.sin(progress*Math.PI)*.4,-progress*.8);
    camera.fov=38+Math.sin(progress*Math.PI*2)*2;
    camera.updateProjectionMatrix();
  }
  function onStory(event){
    storyProgress=event.detail.progress;
    if(motion.matches){sceneProgress=0;updateCamera(0);render();}
    else if(paused){sceneProgress=storyProgress;updateCamera(sceneProgress);world.rotation.y=sceneProgress*.65;render();}
  }
  window.addEventListener('devops-story-progress',onStory);
  function start(){if(!frame&&!paused&&visible&&!document.hidden&&!lost){last=performance.now();frame=requestAnimationFrame(tick);}}
  function syncButton(){toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));}
  toggle.addEventListener('click',()=>{paused=!paused;syncButton();if(paused){cancelAnimationFrame(frame);frame=0;}else start();});syncButton();
  const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render();});resize.observe(canvas);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;} });observer.observe(canvas);
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||motion.matches)return;const r=canvas.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.35;targetY=((e.clientY-r.top)/r.height-.5)*.12;if(paused){world.rotation.set(targetY,targetX,0);render();}});
  canvas.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();};document.addEventListener('visibilitychange',onVisibility);
  const onMotion=()=>{paused=motion.matches;syncButton();if(paused){cancelAnimationFrame(frame);frame=0;render();}else start();};motion.addEventListener('change',onMotion);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;});canvas.addEventListener('webglcontextrestored',()=>{lost=false;render();start();});
  window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);frame=0;if(e.persisted)return;resize.disconnect();observer.disconnect();window.removeEventListener('devops-story-progress',onStory);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});renderer.dispose();});window.addEventListener('pageshow',start);
  render();start();
})();
