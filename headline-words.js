/* Alternate the typewriter rows so the heading never loses both words. */
(() => {
  const heading=document.querySelector('#hero-title');
  const words=[heading?.querySelector('[data-rotate="build"]'),heading?.querySelector('[data-rotate="deploy"]')];
  if(words.some(word=>!word))return;
  const phrases=[['purpose.','precision.','clarity.','care.'],['confidence.','reliability.','control.','consistency.']];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  words.forEach(word=>word.setAttribute('aria-hidden','true'));
  let visible=false,timer=0,row=0,state='hold',count=0;
  const indices=[0,0];
  const active=()=>visible&&!document.hidden&&!motion.matches;
  function queue(delay){clearTimeout(timer);if(active())timer=setTimeout(tick,delay);}
  function tick(){
    if(!active())return;
    if(state==='hold'){count=words[row].textContent.length;state='erase';queue(45);return;}
    if(state==='erase'){
      count--;words[row].textContent=phrases[row][indices[row]].slice(0,count);
      if(count<=0){indices[row]=(indices[row]+1)%phrases[row].length;state='type';queue(80);}else queue(45);
    }else{
      count++;words[row].textContent=phrases[row][indices[row]].slice(0,count);
      if(count>=phrases[row][indices[row]].length){row=1-row;state='hold';queue(2800);}else queue(85);
    }
  }
  function sync(){
    clearTimeout(timer);
    // Settle partial words whenever motion stops or the hero leaves view.
    if(!active()){
      words.forEach((word,i)=>{word.textContent=phrases[i][indices[i]];});state='hold';return;
    }
    queue(state==='hold'?2800:85);
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1});
  observer.observe(heading);document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
})();
