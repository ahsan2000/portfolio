/* DevOps scene adaptation. Uses the exact Three.js runtime supplied with Kage.
   Original Kage source is retained in reference/threeui; this world replaces temple geometry. */
(() => {
  const canvas = document.querySelector('#cloud-scene');
  if (!canvas || !window.THREE) return;
  const T = window.THREE;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#scene-toggle');
  const mobileGraphics = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, alpha:true, antialias:!mobileGraphics, powerPreference:'low-power'}); }
  catch { canvas.hidden = true; toggle.hidden = true; return; }
  canvas.parentElement.classList.add('has-webgl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobileGraphics ? 1.25 : 2));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(8,7,11); camera.lookAt(0,0,0);
  scene.add(new T.AmbientLight(0xc8d9ea, 1.25));
  const key = new T.DirectionalLight(0xffe3cd, 1.9); key.position.set(4,8,6); scene.add(key);
  const red = new T.PointLight(0xe0231c, 3, 25); red.position.set(-4,2,3); scene.add(red);
  const world = new T.Group(); scene.add(world);
  const metal = new T.MeshStandardMaterial({color:0x40566b,roughness:.4,metalness:.75});
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
  scene.fog = new T.FogExp2(0x182330, .018);
  const cyan = new T.MeshStandardMaterial({color:0x55cbd4,emissive:0x287d88,emissiveIntensity:.8,metalness:.5,roughness:.3});
  const grid=new T.GridHelper(120,120,0x632521,0x20272d);grid.position.set(0,-1.45,-40);world.add(grid);
  const nodes=[], packets=[], routes=[];
  function wire(points, color=0xe0231c){const route=points.map(p=>new T.Vector3(...p));world.add(new T.Line(new T.BufferGeometry().setFromPoints(route),new T.LineBasicMaterial({color,transparent:true,opacity:.65})));return route;}
  function rack(x,z,height=4){
    mesh(box,metal,x,height/2-1.4,z,1.35,height,1.1);
    for(let j=0;j<8;j++){
      mesh(box,pale,x,j*height/9-1.1,z+.57,1.12,.035,.035);
      mesh(box,accent,x+.42,j*height/9-1,z+.6,.11,.04,.04);
      mesh(box,metal,x,j*height/9-.97,z+.6,.72,.21,.05);
    }
  }
  function gate(z,name,material=accent){
    [-4.5,4.5].forEach(x=>mesh(box,metal,x,2,z,.55,7,.65));
    mesh(box,metal,0,5.3,z,9.6,.6,.7);
    mesh(box,material,0,4.93,z+.38,8.8,.065,.055);
    label(name,0,5.9,z,1.65,'#dfe7e0');
  }
  // Four rooms share one continuous aisle. The camera actually passes through them.
  gate(0,'INFRASTRUCTURE / ENTER');
  for(let i=0;i<5;i++){rack(-5,-i*4);rack(5,-i*4);}
  label('CLOUD GATEWAY',3,1.8,-3,1.1);
  gate(-22,'KUBERNETES / CLUSTER',cyan);
  for(let i=0;i<6;i++){
    const z=-25-Math.floor(i/2)*5,x=i%2?4:-4;
    rack(x,z,3);nodes.push(mesh(box,cyan,x,2.5,z,.65,.65,.65));
    routes.push(wire([[x,-.9,z],[x/2,-.9,z],[x/2,-.9,-36],[0,-.9,-36]],0x55cbd4));
  }
  mesh(new T.CylinderGeometry(.8,.8,.7,7),pale,0,-.9,-36);
  label('SERVICE MESH / NETWORK',0,3.9,-32,1.5,'#83dce3');
  gate(-43,'CI/CD / DELIVERY');
  ['COMMIT','BUILD','TEST','DEPLOY'].forEach((name,i)=>{
    const z=-46-i*5;gate(z,name,i===3?cyan:accent);
    mesh(box,i===3?cyan:accent,3,.3,z,1.3,1.3,1.3);
    rack(-5.5,z,3);
  });
  label('JENKINS / BITBUCKET',0,3.4,-53,1.5,'#83dce3');
  routes.push(wire([[3,.3,-46],[3,.3,-61],[0,.3,-64]],0xe0231c));
  gate(-69,'AUTOMATION / CONTROL',cyan);
  [-5,5].forEach(x=>{for(let i=0;i<3;i++){
    const z=-73-i*5;mesh(box,metal,x,1,z,2.5,3,.3);
    for(let j=0;j<4;j++)mesh(box,cyan,x-.65+j*.42,.5+j*.3,z+.2,.18,.5+j*.4,.04);
  }});
  label('TERRAFORM / ANSIBLE',0,4,-75,1.7,'#83dce3');
  label('OBSERVE / RECOVER / REPEAT',0,3,-85,1.6);
  const ring=new T.Mesh(new T.TorusGeometry(2.8,.025,8,96),cyan);ring.position.set(0,1,-86);world.add(ring);
  for(let i=0;i<18;i++)packets.push(mesh(new T.SphereGeometry(.07,8,8),i%2?cyan:accent,0,0,0));
  const dustGeo=new T.BufferGeometry(),dust=[];
  for(let i=0;i<260;i++)dust.push((Math.random()-.5)*18,Math.random()*9-1.5,-Math.random()*100);
  dustGeo.setAttribute('position',new T.Float32BufferAttribute(dust,3));const particles=new T.Points(dustGeo,new T.PointsMaterial({color:0xc9a24a,size:.035,transparent:true,opacity:.45}));world.add(particles);
  let frame=0,paused=motion.matches,visible=true,lost=false,time=0,last=0,targetX=0,targetY=0,storyProgress=0,sceneProgress=0;
  function render(){renderer.render(scene,camera);}
  function tick(now){frame=0;if(paused||!visible||document.hidden||lost)return;const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;time+=dt;
    sceneProgress += (storyProgress-sceneProgress)*(1-Math.exp(-dt*3));
    updateCamera(sceneProgress);

    nodes.forEach((n,i)=>{n.position.y=2.5+Math.sin(time*.7+i)*.12;n.rotation.y=time*.2;});
    ring.rotation.z=time*.08;
    packets.forEach((packet,i)=>{
      const route=routes[i%routes.length];
      const phase=time*.22+i/packets.length;
      const u=phase-Math.floor(phase);
      const segment=u*(route.length-1);
      const j=Math.min(Math.floor(segment),route.length-2);
      packet.position.lerpVectors(route[j],route[j+1],segment-j);
    });
    render();frame=requestAnimationFrame(tick);
  }
  function updateCamera(progress){
    const z=13-progress*94;
    camera.position.set(1.8+Math.sin(progress*Math.PI*3)*1.1+targetX*2,2.5+Math.sin(progress*Math.PI*2)*.35+targetY,z);
    camera.lookAt(.3+targetX,2,-9+z);
    camera.fov=innerWidth<650?55:44;
    camera.updateProjectionMatrix();
  }

  function onStory(event){
    storyProgress=event.detail.progress;
    if(motion.matches){sceneProgress=0;updateCamera(0);render();}
    else if(paused){sceneProgress=storyProgress;updateCamera(sceneProgress);render();}
  }
  window.addEventListener('devops-story-progress',onStory);
  function start(){if(!frame&&!paused&&visible&&!document.hidden&&!lost){last=performance.now();frame=requestAnimationFrame(tick);}}
  function syncButton(){toggle.textContent=paused?'Resume motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));}
  toggle.addEventListener('click',()=>{paused=!paused;syncButton();if(paused){cancelAnimationFrame(frame);frame=0;}else start();});syncButton();
  const resize=new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();render();});resize.observe(canvas);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;} });observer.observe(canvas);
  window.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||motion.matches)return;const r=canvas.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.35;targetY=((e.clientY-r.top)/r.height-.5)*.12;if(paused){updateCamera(sceneProgress);render();}});
  document.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();};document.addEventListener('visibilitychange',onVisibility);
  const onMotion=()=>{paused=motion.matches;syncButton();if(paused){cancelAnimationFrame(frame);frame=0;render();}else start();};motion.addEventListener('change',onMotion);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;});canvas.addEventListener('webglcontextrestored',()=>{lost=false;render();start();});
  window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);frame=0;if(e.persisted)return;resize.disconnect();observer.disconnect();window.removeEventListener('devops-story-progress',onStory);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});geos.forEach(g=>g.dispose());mats.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});renderer.dispose();});window.addEventListener('pageshow',start);
  updateCamera(0);render();start();
})();
