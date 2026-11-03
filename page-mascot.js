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
    if (!matchMedia('(max-width: 760px)').matches) return;
    if (reminder ? reminderShown : invitationShown) return;
    hintTimer = setTimeout(() => {
      if (docked || button.hidden || document.hidden || !bubble.hidden) return;
      hintLabel.textContent = aiActive ? 'Tap for an AI summary 🤖' : 'Pat me for a section summary 🦊';
      hint.hidden = false;
      if (reminder) reminderShown = true;
      else invitationShown = true;
      hintTimer = setTimeout(dismissHint, mobileScreen.matches ? 3000 : 5000);
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
    'Need a full-stack website or KMP app? Ahsan can build it and take it live.',
    'Namecheap, GoDaddy, Hostinger, or any other provider—Ahsan can handle domains, DNS, hosting, and SSL.',
    'Less deployment drama. More time to build cool things.',
    'Got a cloud challenge? Let’s untangle it together.',
    'Great ideas deserve reliable infrastructure. Let’s talk.',
    'You bring the idea. Ahsan can build the product and its cloud home.',
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

  };
  let lastMessage = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let timer;
  let messageTimer;
  let nextAutoMessage = performance.now() + 1000;
  const mobileScreen = matchMedia('(max-width: 760px)');
  const messageBreak = () => mobileScreen.matches
    ? 8000 + Math.random() * 2000
    : 6000 + Math.random() * 3000;
  const hideMessage = () => {
    clearTimeout(messageTimer);
    bubble.hidden = true;
    nextAutoMessage = performance.now() + messageBreak();
    if (!docked && greeted) scheduleHint(1200);
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
    writing: ['Tell me your goal and where you need help.', 'A few project details will help me reply.'],
    sliding: ['Slide all the way to unlock Send.'],
    ready: ['All set! Your message is cleared for takeoff.', 'Ready when you are. One click and we’re off!', 'The slide is done. Time to say hello!'],
    sending: ['Your hello is on its way to my inbox… paws crossed!', 'Your message is on its way. I’m watching the inbox route!', 'Sending now! Even a fox has to wait for the network.', 'Tiny paws, important delivery. Sending your message…'],
    error: ['The network got shy. Your words are safe here—try again!', 'Delivery wasn’t confirmed. Keep your message and give it another go.'],
    success: ['Message submitted! Thanks for saying hi.', 'Your hello is submitted. I’ll take it from here!']
  };
  const showContactLine = state => {
    if (button.hidden) return;
    dismissHint();
    const lines = contactLines[state] || contactLines.idle;
    const choices = lines.filter(line => lines.length === 1 || line !== lastContactLine);
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
    let writingPromptAt = -Infinity;
    contactForm.addEventListener('input', event => {
      if (!event.target.matches('input:not([type=range]), textarea') || performance.now() - writingPromptAt < 8000) return;
      writingPromptAt = performance.now();
      contactState = 'writing';
      if (docked) showContactLine(contactState);
    });
    contactForm.querySelector('input[type=range]')?.addEventListener('input', event => {
      if (Number(event.target.value) >= 100 || contactState === 'sliding') return;
      contactState = 'sliding';
      if (docked) showContactLine(contactState);
    });
    contactForm.querySelector('input[type=range]')?.addEventListener('pointerdown', () => {
      contactState = 'sliding';
      if (docked) showContactLine(contactState);
    });
    window.addEventListener('portfolio-contact-state', event => {
      contactState = event.detail.state;
      if (docked) showContactLine(contactState);
    });
  }
  // Desktop commentary follows the current section; mobile adds a pat-to-summarize prompt.
  const greetings = [
    'Hey there! I build reliable infrastructure—and accept head pats. Welcome to my portfolio! 🦊',
    'Welcome aboard! Cloud, websites, apps, and launches ahead. Head pats also accepted. 🦊',
    'Hey! Looking for a DevOps engineer? You’re in the right place. Let’s build something! 🦊'
  ];
  let greeted = false;
  const summarizedSections = new Set();
  let lastAutoLine = "";
  const sectionLines = {
    "journey": [
        "Welcome! I build cloud infrastructure, websites, and apps. Have something in mind? Send me a message.",
        "From your first idea to launch, I can help connect the pieces. Tell me what you’re building."
    ],
    "work": [
        "Explore my production contributions and the role I played. Need help with a similar setup? Let’s talk.",
        "Behind every smooth app is dependable infrastructure. Want help with yours? Send me a message."
    ],
    "bank-digital": [
        "Banking workloads need dependable releases and disaster recovery. Need help planning yours? Let’s talk.",
        "Cluster stability, Linux, and networking keep things running. Facing a similar challenge? Message me."
    ],
    "digimate": [
        "DigiMate brings Azure, automated delivery, and monitoring together. Building an AI service? Let’s talk infrastructure.",
        "Even a clever chatbot needs a reliable home. Need help with AKS, logs, or alerts? Send me a message."
    ],
    "tekrevol": [
        "At TekRevol, I automated delivery for web, mobile, and backend workloads. Want a smoother pipeline? Let’s talk.",
        "Docker, Jenkins, and quality checks keep releases moving. Need that for your team? Message me."
    ],
    "rise-up-kings": [
        "Repeatable AWS releases helped deliver changes and hotfixes. Want a similar delivery flow? Let’s talk.",
        "Hotfixes should be quick and repeatable. Need help automating your releases? Send me a message."
    ],
    "oneview": [
        "OneView is my side project, from app to website and hosting. Have a product idea of your own? Let’s talk.",
        "An app needs more than code: DNS, hosting, and SSL matter too. Need help getting yours live? Message me."
    ],
    "capabilities": [
        "Cloud, CI/CD, websites, apps, and hosting: choose your starting point. Tell me where you need help.",
        "Have an idea, a half-built website, or a launch problem? Send me a message and we’ll find the next step."
    ],
    "ai-infrastructure": [
        "AI apps need secure endpoints, monitoring, and reliable serving. Building one? Let’s plan its infrastructure.",
        "RAG, inference, and observability belong together. Need help connecting them? Send me a message."
    ],
    "consulting": [
        "Have a cloud or architecture puzzle? Tell me what’s happening and we can work through the next step.",
        "A fresh pair of eyes can help untangle a tricky setup. Send me a message about your challenge."
    ],
    "approach": [
        "Plan, build, automate, and operate: that’s my approach. Want help taking your project through those steps? Let’s talk.",
        "Good pipelines and runbooks make releases easier. Need help putting them in place? Message me."
    ],
    "experience": [
        "Explore my production experience and responsibilities. Looking for this kind of help on your team? Let’s talk.",
        "Reliable systems take hands-on practice. Need a DevOps engineer for your next challenge? Send me a message."
    ],
    "engineering": [
        "Explore my tools for cloud, delivery, apps, and AI. Need help choosing or connecting your stack? Let’s talk.",
        "The right tools should make your work easier. Tell me what you’re building and where you’re stuck."
    ],
    "architecture": [
        "Follow the flow from commit to checks and production. Want a pipeline like this? Send me a message.",
        "Build, verify, deploy, and monitor. Need help connecting that flow for your team? Let’s talk."
    ],
    "video-cv": [
        "Watch a quick introduction to my work and approach. Think we could work together? Send me a message."
    ],
    "contact": [
        "Tell me what you’re building and where you need help. A few project details are a great start.",
        "Need a website, an app, or cloud help? Send me your idea and let’s find the next step."
    ]
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
      dismissHint();
      nextAutoMessage = performance.now() + 1800;
      invitationShown = false;
    }
  };
  let sectionFrame = 0;
  const scheduleSection = () => {
    if (!sectionFrame) sectionFrame = requestAnimationFrame(() => { sectionFrame = 0; updateSection(); });
  };
  window.addEventListener('scroll', () => {
    if (!docked && !bubble.hidden) hideMessage();
    nextAutoMessage = performance.now() + 1800;
    scheduleSection();
  }, { passive: true });
  document.addEventListener('focusin', event => {
    if (!companion.contains(event.target) && !docked) hideMessage();
  });
  window.addEventListener('resize', scheduleSection, { passive: true });
  window.addEventListener('pageshow', scheduleSection);
  updateSection();
  const checkAutoMessage = () => {
    if (docked || (mobileScreen.matches && greeted && summarizedSections.has(activeSection))
      || document.activeElement?.matches('input, textarea, select')
      || document.hidden || button.hidden || !bubble.hidden || !hint.hidden
      || performance.now() < nextAutoMessage || document.querySelector('#portfolio-loader')) return;
    const lines = greeted ? (sectionLines[activeSection] || greetings) : greetings;
    const choices = lines.filter(line => lines.length === 1 || line !== lastAutoLine);
    lastAutoLine = choices[Math.floor(Math.random() * choices.length)];
    message.textContent = lastAutoLine;
    if (greeted || activeSection === 'journey') summarizedSections.add(activeSection);
    greeted = true;
    dismissHint();
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(hideMessage, mobileScreen.matches ? 2000 : 8000);
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
    const choices = activeMessages.map((_, index) => index).filter(index => activeMessages.length === 1 || index !== lastMessage);
    lastMessage = choices[Math.floor(Math.random() * choices.length)];
    if (!docked) message.textContent = activeMessages[lastMessage];
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      if (bubble.contains(document.activeElement)) button.focus();
      hideMessage();
    }, docked ? 8000 : mobileScreen.matches ? 3000 : 5000);
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
