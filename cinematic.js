/* Event-driven cinematic effects: no render loop while the page is idle. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  const hero = document.querySelector('.hero');
  const backdrop = document.querySelector('.chapter-backdrop');
  const chapterLayers = [...backdrop.querySelectorAll('span')];
  const chapters = [...document.querySelectorAll('[data-backdrop]')];
  const main = document.querySelector('main');
  let activeChapter = '';
  let activeLayer = 0;
  function updateChapter() {
    // A reading line in the upper half of the viewport avoids flicker at boundaries.
    const readingLine = innerHeight * .4;
    let current = chapters[0];
    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top <= readingLine) current = chapter;
      else break;
    }
    const label = current.dataset.backdrop;
    const visible = current !== hero && main.getBoundingClientRect().bottom > readingLine;
    backdrop.classList.toggle('is-visible', visible);
    if (label !== activeChapter) {
      activeChapter = label;
      activeLayer = 1 - activeLayer;
      chapterLayers[activeLayer].textContent = label;
      chapterLayers.forEach((layer, index) => layer.classList.toggle('is-current', index === activeLayer));
    }
    const drift = enabled && !compact.matches ? Math.max(-28, Math.min(28, -current.getBoundingClientRect().top * .035)) : 0;
    backdrop.style.setProperty('--chapter-drift', `${drift}px`);
    const depth = enabled && !compact.matches ? Math.max(-1, Math.min(1, current.getBoundingClientRect().top / innerHeight)) : 0;
    backdrop.style.setProperty('--chapter-tilt-x', `${depth * 7}deg`);
    backdrop.style.setProperty('--chapter-tilt-y', `${depth * -5}deg`);
    backdrop.style.setProperty('--chapter-depth', `${Math.abs(depth) * -45}px`);
  }
  const heroWord = document.querySelector('.cinema-word');
  let assemblyStarted = false;
  let letterAnimations = [];
  const heroSkills = ['PORTFOLIO', 'LINUX', 'KUBERNETES', 'TERRAFORM', 'CI/CD', 'AWS', 'AZURE', 'GOOGLE CLOUD', 'DOCKER', 'ANSIBLE', 'MONITORING', 'AI & LLM', 'RAG', 'OLLAMA', 'MS FOUNDRY'];
  let skillIndex = 0;
  let skillTimer = null;
  let animationVersion = 0;
  function heroIsVisible() {
    const bounds = hero.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < innerHeight;
  }
  function stopSkillTimer() {
    if (skillTimer !== null) window.clearTimeout(skillTimer);
    skillTimer = null;
  }
  function fitHeroWord() {
    if (!heroWord) return;
    heroWord.style.removeProperty('--hero-word-font');
    const available = heroWord.clientWidth;
    const glyphs = [...heroWord.querySelectorAll('.assembly-letter')];
    if (!available || !glyphs.length) return;
    // offsetWidth is independent of the scroll-linked perspective and glyph animation.
    const naturalWidth = glyphs.reduce((width, glyph) => width + glyph.offsetWidth, 0);
    if (!naturalWidth) return;
    const baseSize = parseFloat(getComputedStyle(heroWord).fontSize);
    const safeWidth = Math.max(1, available - Math.max(24, available * .035));
    heroWord.style.setProperty('--hero-word-font', `${baseSize * Math.min(1, safeWidth / naturalWidth)}px`);
  }
  function finishAssembly() {
    animationVersion++;
    letterAnimations.forEach(animation => animation.cancel());
    letterAnimations = [];
    if (heroWord) {
      heroWord.replaceChildren(...[...'PORTFOLIO'].map(letter => {
        const span = document.createElement('span');
        span.className = 'assembly-letter';
        span.textContent = letter;
        return span;
      }));
      fitHeroWord();
    }
  }
  async function animateHeroWord(label) {
    const version = ++animationVersion;
    // Keep settled glyphs in place between transitions to avoid a kerning/layout snap.
    let outgoing = [...heroWord.querySelectorAll('.assembly-letter')];
    if (outgoing.length) {
      const count = outgoing.length;
      letterAnimations = outgoing.map((span, index) => span.animate([
        { transform: 'translate3d(0,0,0) rotateY(0deg)', opacity: 1, filter: 'blur(0px)' },
        { transform: `translate3d(${((index + Math.ceil(count / 2)) % count - index) * 34}px,${index % 2 ? -20 : 20}px,0) rotateY(${index % 2 ? -40 : 40}deg)`, opacity: .08, filter: 'blur(5px)' }
      ], { duration: 650, delay: index * 18, easing: 'cubic-bezier(.55,0,.8,.5)', fill: 'both' }));
      await Promise.allSettled(letterAnimations.map(animation => animation.finished));
      if (version !== animationVersion) return;
    }
    const previousAnimations = letterAnimations;
    const letters = [...label];
    const scrambledOrder = label === 'PORTFOLIO' ? [5, 7, 6, 4, 1, 2, 0, 3, 8] : letters.map((_, index) => (index + Math.ceil(letters.length / 2)) % letters.length);
    heroWord.style.removeProperty('--word-size');
    const spans = letters.map(letter => {
      const span = document.createElement('span');
      span.className = 'assembly-letter';
      span.textContent = letter === ' ' ? '\u00a0' : letter;
      return span;
    });
    heroWord.replaceChildren(...spans);
    fitHeroWord();
    previousAnimations.forEach(animation => animation.cancel());
    const positions = spans.map(span => span.getBoundingClientRect());
    const startX = [];
    let cursor = positions[0].left;
    scrambledOrder.forEach(index => { startX[index] = cursor; cursor += positions[index].width; });
    letterAnimations = spans.map((span, index) => {
      const x = startX[index] - positions[index].left;
      return span.animate([
        { transform: `translate3d(${x}px,${index % 2 ? -20 : 20}px,0) rotateY(${index % 2 ? -40 : 40}deg)`, opacity: outgoing.length ? .08 : .5, filter: outgoing.length ? 'blur(5px)' : 'blur(0px)', offset: 0 },
        { transform: `translate3d(${x}px,${index % 2 ? -12 : 12}px,0) rotateY(${index % 2 ? -24 : 24}deg)`, opacity: .7, filter: 'blur(0px)', offset: .22 },
        { transform: 'translate3d(0,0,0) rotateY(0deg)', opacity: 1, filter: 'blur(0px)', offset: 1 }
      ], { duration: 1300, delay: index * 28, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    });
    await Promise.allSettled(letterAnimations.map(animation => animation.finished));
    if (version !== animationVersion) return;
    letterAnimations.forEach(animation => animation.cancel());
    letterAnimations = [];
    scheduleSkillTour();
  }
  function scheduleSkillTour() {
    if (!assemblyStarted || !heroWord || !enabled || document.hidden || !heroIsVisible() || letterAnimations.length || skillTimer !== null || !heroWord.animate) return;
    skillTimer = window.setTimeout(() => {
      skillTimer = null;
      if (!enabled || document.hidden || !heroIsVisible()) return;
      skillIndex = (skillIndex + 1) % heroSkills.length;
      animateHeroWord(heroSkills[skillIndex]);
    }, 2300);
  }
  function assemblePortfolio() {
    if (assemblyStarted || !heroWord) return;
    assemblyStarted = true;
    if (!enabled || document.hidden || !heroIsVisible() || !heroWord.animate) return;
    animateHeroWord('PORTFOLIO');
  }
  let enabled = false;
  let frame = 0;
  function update() {
    frame = 0;
    const distance = Math.max(root.scrollHeight - innerHeight, 1);
    root.style.setProperty('--scroll-progress', String(Math.max(0, Math.min(1, scrollY / distance))));
    const y = enabled && !compact.matches ? Math.min(Math.max(-hero.getBoundingClientRect().top, 0), 900) : 0;
    hero.style.setProperty('--cinema-title-y', `${y * .18}px`);
    hero.style.setProperty('--cinema-photo-y', `${y * .07}px`);
    const heroDepth = enabled && !compact.matches ? Math.min(y / innerHeight, 1) : 0;
    hero.style.setProperty('--hero-tilt-x', `${heroDepth * 13}deg`);
    hero.style.setProperty('--hero-tilt-y', `${heroDepth * -5}deg`);
    hero.style.setProperty('--hero-depth', `${heroDepth * -85}px`);
    root.style.setProperty('--scene-scroll-depth', `${enabled && !compact.matches ? Math.min(scrollY * .025, 160) : 0}px`);
    updateChapter();
    if (heroIsVisible()) scheduleSkillTour();
    else stopSkillTimer();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function sync() {
    enabled = !reduced.matches;
    root.classList.toggle('motion-off', !enabled);
    if (!enabled) { stopSkillTimer(); finishAssembly(); }
    window.dispatchEvent(new CustomEvent('portfolio-motion-change', { detail: { enabled } }));
    schedule();
  }
  document.querySelectorAll('.hero-actions .button').forEach(link => {
    const reset = () => { link.style.removeProperty('--magnet-x'); link.style.removeProperty('--magnet-y'); };
    link.addEventListener('pointermove', event => {
      if (!enabled || compact.matches || event.pointerType !== 'mouse') return;
      const box = link.getBoundingClientRect();
      link.style.setProperty('--magnet-x', `${(event.clientX - box.left - box.width / 2) * .12}px`);
      link.style.setProperty('--magnet-y', `${(event.clientY - box.top - box.height / 2) * .2}px`);
    });
    link.addEventListener('pointerleave', reset);
    link.addEventListener('blur', reset);
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => {
    // Settle the glyphs before refitting so old animation coordinates cannot clip them.
    animationVersion++;
    letterAnimations.forEach(animation => animation.cancel());
    letterAnimations = [];
    fitHeroWord();
    schedule();
  }, { passive: true });
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', sync);
  compact.addEventListener('change', schedule);
  const atmosphere = document.querySelector('.cinema-atmosphere');
  if (navigator.connection?.saveData) atmosphere?.classList.add('atmosphere-static');
  const visibility = () => {
    atmosphere?.classList.toggle('page-idle', document.hidden);
    if (document.hidden) {
      stopSkillTimer();
      if (letterAnimations.length) finishAssembly();
    } else scheduleSkillTour();
  };
  document.addEventListener('visibilitychange', visibility);
  visibility();
  // Re-evaluate after media loads, font changes and skill-panel height changes.
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(main);
  document.fonts?.ready.then(schedule);
  sync();
  // Let the restored opening loader finish before revealing the shuffled hero letters.
  const loaderReady = document.querySelector('#portfolio-loader') ? new Promise(resolve => {
    const done = () => { window.removeEventListener('portfolio-ready', done); window.clearTimeout(fallback); resolve(); };
    const fallback = window.setTimeout(done, 2100);
    window.addEventListener('portfolio-ready', done, { once: true });
  }) : Promise.resolve();
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([loaderReady, fontsReady]).then(assemblePortfolio);
})();
