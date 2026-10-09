// Local vanilla JS integration of Koboyo's page-mascot fox-riso sheets.
// See assets/page-mascot-LICENSE.txt for the original MIT license.
(() => {
  const companion = document.querySelector('.fox-companion');
  if (!companion) return;
  const button = companion.querySelector('.fox-boop');
  const direction = companion.querySelector('.fox-directions');
  const reaction = companion.querySelector('.fox-reactions');
  // Fetch the reaction sheet when the visitor interacts with the fox.
  let reactionReady = false;
  const reactionImage = new Image();
  reactionImage.onload = async () => {
    try {
      if (reactionImage.decode) await reactionImage.decode();
      reactionReady = true;
    } catch {
      // Keep the normal fox visible if the reaction cannot be decoded.
    }
  };
  const warmReaction = () => {
    if (!reactionImage.src) reactionImage.src = new URL('assets/fox-riso-reactions-optimized.webp', document.baseURI).href;
  };
  button.addEventListener('pointerenter', warmReaction, { once: true });
  button.addEventListener('focus', warmReaction, { once: true });
  button.addEventListener('pointerdown', warmReaction, { once: true });
  const restore = companion.querySelector('.fox-restore');
  const bubble = companion.querySelector('.fox-message');
  const message = companion.querySelector('.fox-message-text');
  const hint = companion.querySelector('.fox-hint');
  const hintLabel = hint.querySelector('.fox-hint-label') || hint;
  let hintTimer;
  let hasBeenPetted = false;
  let invitationShown = false;
  let reminderShown = false;
  const dismissHint = () => {
    clearTimeout(hintTimer);
    if (document.activeElement === hint) button.focus();
    hint.hidden = true;
  };
  const scheduleHint = (delay, reminder = false) => {
    clearTimeout(hintTimer);
    if (reminder ? reminderShown : invitationShown) return;
    hintTimer = setTimeout(() => {
      if (button.hidden || document.hidden || !bubble.hidden) return;
      hintLabel.textContent = aiActive ? 'Talk AI infrastructure? 🤖' : reminder ? 'One more head pat? 🥺' : 'A little head pat? 🥺';
      hint.hidden = false;
      if (reminder) reminderShown = true;
      else invitationShown = true;
      hintTimer = setTimeout(dismissHint, 8000);
    }, delay);
  };
  const showHintWhenReady = () => {
    // Wait for the actual loader removal or its six-second fallback.
    const loader = document.querySelector('#portfolio-loader');
    if (loader && !loader.classList.contains('is-complete') && !document.documentElement.hasAttribute('data-loader-expired')) {
      hintTimer = setTimeout(showHintWhenReady, 250);
      return;
    }
    scheduleHint(15000);
  };
  hintTimer = setTimeout(showHintWhenReady, 250);
  hint.addEventListener('click', () => button.click());
  const onUpwork = companion.dataset.channel === 'upwork';
  const messages = [
    'Looking for your next DevOps engineer? I’m ready to help.',
    'Want to talk about what you’re building? I’m listening.',
    onUpwork ? 'One Upwork message away. Let’s build something.' : 'I’m one email away. Your next idea starts with hello.',
    'Your next DevOps engineer? You’re looking at his portfolio.',
    'Less deployment drama. More time to build cool things.',
    'Got a cloud challenge? Let’s untangle it together.',
    'Great ideas deserve reliable infrastructure. Let’s talk.',
    'You bring the idea. I’ll bring the automation.',
    'Your pipeline called. It wants us to meet.',
    'Still scrolling? Imagine what we could build together.',
    'I bring the charm—and the reliable deployments.',
    'A friendly hello could be the start of your next great project.'
  ];
  let aiActive = false;
  const aiMessages = [
    'Taking an LLM to production? Let’s build its serving platform.',
    'GPU workloads need reliable infrastructure. Let’s plan yours.',
    'From model endpoint to monitoring: keep your AI service running.',
    'Private inference, predictable scaling, and clear observability.',
    'Building a RAG application? I can help with the infrastructure.'
  ];
  const aiSection = document.getElementById('ai-infrastructure');
  const setAI = active => {
    if (active === aiActive) return;
    aiActive = active;
    companion.classList.toggle('is-ai', active);
    companion.setAttribute('aria-label', active ? 'Riso AI drone companion' : 'Fox companion');
    button.setAttribute('aria-label', active ? 'Tap the riso drone for an AI infrastructure hint' : 'Pet the riso fox for a hint');
    companion.querySelector('.fox-dismiss').setAttribute('aria-label', active ? 'Hide drone companion' : 'Hide fox companion');
    restore.textContent = active ? 'Show drone' : 'Show fox';
    restore.setAttribute('aria-label', active ? 'Show drone companion' : 'Show fox companion');
    hint.setAttribute('aria-label', active ? 'Ask the drone about AI infrastructure' : 'Give the fox a head pat');
    reaction.hidden = true;
    dismissHint();
    hideMessage();
    if (active && !button.hidden) {
      message.textContent = aiMessages[0];
      bubble.hidden = false;
      messageTimer = setTimeout(hideMessage, 8000);
    }
  };
  let lastMessage = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let timer;
  let messageTimer;
  let nextAutoMessage = performance.now();
  const mobileScreen = matchMedia('(max-width: 760px)');
  const messageBreak = () => mobileScreen.matches
    ? 8000 + Math.random() * 2000
    : 6000 + Math.random() * 3000;
  const hideMessage = () => {
    clearTimeout(messageTimer);
    bubble.hidden = true;
    nextAutoMessage = performance.now() + messageBreak();
  };
  const frame = (element, index) => {
    element.style.backgroundPosition = `${index % 3 * 50}% ${Math.floor(index / 3) * 50}%`;
  };
  frame(direction, 4);
  const contactForm = document.getElementById('contact-form');
  const dock = document.getElementById('contact-fox-dock');
  let docked = false;
  let contactState = 'idle';
  let lastContactLine = '';
  const contactLines = {
    idle: ['Say hi! Tell me what you’re building.', 'Got a cloud puzzle? I like those. Tell me below!', 'A little hello could start a big project. I’m listening!', 'You write the brief. I’ll supervise the send button.'],
    ready: ['All set! Your message is cleared for takeoff.', 'Ready when you are. One click and we’re off!', 'The slide is done. Time to say hello!'],
    sending: ['Your hello is on its way to my inbox… paws crossed!', 'Your message is on its way. I’m watching the inbox route!', 'Sending now! Even a fox has to wait for the network.', 'Tiny paws, important delivery. Sending your message…'],
    error: ['The network got shy. Your words are safe here—try again!', 'Delivery wasn’t confirmed. Keep your message and give it another go.'],
    success: ['Message submitted! Thanks for saying hi.', 'Your hello is submitted. I’ll take it from here!']
  };
  const showContactLine = state => {
    if (button.hidden) return;
    dismissHint();
    const lines = contactLines[state] || contactLines.idle;
    const choices = lines.filter(line => line !== lastContactLine);
    lastContactLine = choices[Math.floor(Math.random() * choices.length)];
    message.textContent = lastContactLine;
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(hideMessage, 8000);
  };
  if (contactForm && dock) {
    dock.hidden = false;
    const home = document.createComment('Fox home position');
    companion.before(home);
    const moveToForm = visible => {
      if (visible === docked) return;
      docked = visible;
      clearTimeout(timer);
      reaction.hidden = true;
      dismissHint();
      hideMessage();
      // Keep the reserved space stable to avoid scroll jumps.
      companion.classList.toggle('at-contact', visible);
      if (visible) {
        dock.append(companion);
        frame(direction, 4); // Neutral until the visitor moves the pointer.
        showContactLine(contactState);
      } else {
        home.after(companion);
        frame(direction, 4);
      }
    };
    if ('IntersectionObserver' in window) {
      const contactObserver = new IntersectionObserver(entries => {
        moveToForm(entries[0].isIntersecting);
      }, { threshold: 0.05 });
      contactObserver.observe(contactForm.parentElement);
    }
    contactForm.addEventListener('focusin', () => moveToForm(true));
    window.addEventListener('portfolio-contact-state', event => {
      contactState = event.detail.state;
      if (docked) showContactLine(contactState);
    });
  }
  // Greet once after loading, then leave a real 3–4 second gap between bubbles.
  const greetings = [
    'Hey there! I build reliable infrastructure—and accept head pats. Welcome to my portfolio! 🦊',
    'Welcome aboard! Reliable infrastructure ahead. Head pats also accepted. 🦊',
    'Hey! Looking for a DevOps engineer? You’re in the right place. Let’s build something! 🦊'
  ];
  const scrollLines = [
    'Infrastructure stuck? I can help untangle it. Want a free 30-minute call?',
    'Cloud bill looking spicy? Let’s talk through your setup together.',
    'Still deploying by hand? Your weekend deserves better. Let me help!',
    'Kubernetes acting mysterious? Bring the puzzle to a free 30-minute consultation.',
    'Got a platform idea? You bring the goal. I’ll bring the infrastructure.',
    'Need a second pair of eyes on your architecture? I’m one message away.',
    'Your next release could use fewer surprises. Shall we talk?',
    'Head pats or infrastructure questions? I’m here for both. Say hello!'
  ];
  let greeted = false;
  let lastScrollLine = '';
  const sectionLines = {
    journey: ['Meet Ahsan: cloud infrastructure, automated releases, and fewer production surprises.', 'I handle the head pats. Ahsan handles the deployments.', 'Welcome! Follow my paws from code to cloud.'],
    work: ['These are real production contributions. Open a project to see Ahsan’s role.', 'Behind every smooth app is infrastructure doing the heavy lifting.', 'Production stories ahead. My favorite kind of bedtime reading.'],
    'bank-digital': ['Banking infrastructure needs dependable releases and disaster recovery.', 'Keeping banking workloads steady is serious business. I just bring the paws.', 'Cluster stability, Linux, and networking: the quiet work behind the app.'],
    digimate: ['DigiMate runs on Azure infrastructure with automated delivery and monitoring.', 'An AI assistant still needs a dependable place to live.', 'AKS, logs, and alerts. Even chatbots need a good support crew.'],
    tekrevol: ['At TekRevol, Ahsan automated delivery across web, mobile, and backend workloads.', 'Manual deployments? My paws prefer pipelines.', 'Docker, Jenkins, and quality checks keep this release train moving.'],
    'rise-up-kings': ['Repeatable AWS releases helped deliver changes and urgent hotfixes.', 'Hotfixes should be quick. Production should stay calm.', 'A good pipeline gives the team one less thing to worry about.'],
    oneview: ['OneView is Ahsan’s independent Android finance tracker, built and shipped.', 'Stocks, funds, and pensions together. I track treats in a separate portfolio.', 'Private local storage. This fox approves of keeping your data close.'],
    capabilities: ['Cloud setup, CI/CD, infrastructure as code, and production support: pick your starting point.', 'You bring the product. Ahsan brings its cloud foundation.', 'A little automation can rescue a lot of weekends.'],
    'ai-infrastructure': ['AI applications need secure endpoints, monitoring, and reliable model serving.', 'A clever model still needs a sensible production home.', 'RAG, inference, and observability. The drone is on infrastructure duty.'],
    consulting: ['Bring your cloud challenge to a conversation with Ahsan.', 'Sometimes a fresh pair of eyes is the best debugging tool. Paws optional.', 'Architecture puzzle? Let’s find the first useful step.'],
    approach: ['Plan, build, automate, and operate: a practical path to production.', 'Measure twice. Deploy once. Then watch the dashboards.', 'Good runbooks are love letters to your future on-call self.'],
    experience: ['Explore Ahsan’s engineering experience and production responsibilities.', 'Four-plus years of production lessons. Plenty of coffee along the way.', 'Reliable systems come from practice, not just tool logos.'],
    engineering: ['Explore the stack by layer to see where each tool fits.', 'Tools are ingredients. Architecture is the recipe.', 'Kubernetes herds containers. I’m still learning to herd my treats.'],
    architecture: ['Follow the delivery flow from commit through checks to production.', 'A pipeline is a conveyor belt with better quality control.', 'Build, verify, deploy. My release process is sniff, inspect, nap.'],
    contact: ['Tell Ahsan what you’re building and where you need help.', 'Your project brief is welcome here. So are head pats.', 'One hello could be the start of a stronger production platform.']
  };
  let activeSection = 'journey';
  const contextualBlocks = Object.keys(sectionLines).map(id => document.getElementById(id)).filter(Boolean);
  const updateSection = () => {
    const middle = innerHeight * .48;
    let best = null, bestDistance = Infinity;
    contextualBlocks.forEach(block => {
      const rect = block.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight) return;
      const distance = rect.top <= middle && rect.bottom >= middle ? 0 : Math.min(Math.abs(rect.top - middle), Math.abs(rect.bottom - middle));
      // Later entries are individual project cards, so prefer them to their parent.
      if (distance <= bestDistance) { best = block; bestDistance = distance; }
    });
    if (!best || best.id === activeSection) return;
    activeSection = best.id;
    setAI(activeSection === 'ai-infrastructure');
    if (!docked && !button.hidden) {
      dismissHint();
      hideMessage();
      nextAutoMessage = performance.now() + 1200;
    }
  };
  let sectionFrame = 0;
  const scheduleSection = () => {
    if (!sectionFrame) sectionFrame = requestAnimationFrame(() => { sectionFrame = 0; updateSection(); });
  };
  window.addEventListener('scroll', scheduleSection, { passive: true });
  window.addEventListener('resize', scheduleSection, { passive: true });
  window.addEventListener('pageshow', scheduleSection);
  updateSection();
  const checkAutoMessage = () => {
    if (document.hidden || button.hidden || !bubble.hidden || !hint.hidden
      || performance.now() < nextAutoMessage || document.querySelector('#portfolio-loader')) return;
    if (greeted && docked) {
      showContactLine(contactState);
      return;
    }
    const lines = sectionLines[activeSection] || (aiActive ? aiMessages : greetings);
    const choices = lines.filter(line => line !== lastScrollLine);
    lastScrollLine = choices[Math.floor(Math.random() * choices.length)];
    message.textContent = onUpwork ? lastScrollLine.replace('free 30-minute call', 'chat on Upwork').replace('free 30-minute consultation', 'chat on Upwork') : lastScrollLine;
    greeted = true;
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(hideMessage, 8000);
  };
  let autoMessageTimer = setInterval(checkAutoMessage, 250);
  window.addEventListener('scroll', checkAutoMessage, { passive: true });
  window.addEventListener('pagehide', () => { clearInterval(autoMessageTimer); autoMessageTimer = 0; });
  window.addEventListener('pageshow', () => {
    if (!autoMessageTimer) autoMessageTimer = setInterval(checkAutoMessage, 250);
  });
  window.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches || button.hidden || document.querySelector('#scene-toggle')?.getAttribute('aria-pressed') === 'true') return;
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const column = Math.abs(dx) < 55 ? 1 : dx < 0 ? 0 : 2;
    const row = Math.abs(dy) < 55 ? 1 : dy < 0 ? 0 : 2;
    frame(direction, row * 3 + column);
  }, { passive: true });
  button.addEventListener('click', () => {
    dismissHint();
    hasBeenPetted = true;
    scheduleHint(90000, true);
    if (docked) showContactLine(contactState);
    // Pick randomly from every message except the one currently displayed.
    const activeMessages = sectionLines[activeSection] || (aiActive ? aiMessages : messages);
    const choices = activeMessages.map((_, index) => index).filter(index => index !== lastMessage);
    lastMessage = choices[Math.floor(Math.random() * choices.length)];
    if (!docked) message.textContent = activeMessages[lastMessage];
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      if (bubble.contains(document.activeElement)) button.focus();
      hideMessage();
    }, 8000);
    clearTimeout(timer);
    direction.hidden = false;
    reaction.hidden = aiActive || !reactionReady;
    // Top-middle cell is the heart; bottom-right is the delighted face.
    frame(reaction, 1);
    if (!reduced.matches) companion.querySelector('.fox-sprite').animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.06, .94)' }, { transform: 'scale(1)' }
    ], { duration: 350 });
    timer = setTimeout(() => { direction.hidden = false; reaction.hidden = true; }, 1600);
  });
  companion.querySelector('.fox-dismiss').addEventListener('click', () => {
    dismissHint();
    hideMessage();
    button.hidden = true;
    companion.querySelector('.fox-dismiss').hidden = true;
    restore.hidden = false;
    restore.focus();
  });
  restore.addEventListener('click', () => {
    button.hidden = false;
    companion.querySelector('.fox-dismiss').hidden = false;
    restore.hidden = true;
    button.focus();
    if (docked) { frame(direction, 4); showContactLine(contactState); }
    else if (hasBeenPetted) scheduleHint(90000, true);
    else scheduleHint(15000);
  });
  const closeMessage = () => {
    hideMessage();
    button.focus();
  };
  companion.querySelector('.fox-message-close').addEventListener('click', closeMessage);
  companion.querySelector('.fox-message-contact').addEventListener('click', () => {
    hideMessage();
  });
  document.addEventListener('pointerdown', event => {
    if (!bubble.hidden && !bubble.contains(event.target) && !button.contains(event.target)) hideMessage();
  });
  companion.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !bubble.hidden) closeMessage();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) dismissHint();
    else if (!button.hidden) {
      if (hasBeenPetted) scheduleHint(90000, true);
      else showHintWhenReady();
    }
  });
})();
