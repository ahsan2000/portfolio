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
      hintLabel.textContent = reminder ? 'One more head pat? 🥺' : 'A little head pat? 🥺';
      hint.hidden = false;
      if (reminder) reminderShown = true;
      else invitationShown = true;
      hintTimer = setTimeout(dismissHint, 8000);
    }, delay);
  };
  const showHintWhenReady = () => {
    // Wait for the actual loader removal or its six-second fallback.
    const loader = document.querySelector('#portfolio-loader');
    if (loader && !document.documentElement.hasAttribute('data-loader-expired')) {
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
  let lastMessage = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let timer;
  let messageTimer;
  let nextAutoMessage = performance.now();
  const mobileScreen = matchMedia('(max-width: 760px)');
  const messageBreak = () => mobileScreen.matches
    ? 8000 + Math.random() * 2000
    : 3750 + Math.random() * 1000;
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
  const checkAutoMessage = () => {
    if (document.hidden || button.hidden || !bubble.hidden || !hint.hidden
      || performance.now() < nextAutoMessage || document.querySelector('#portfolio-loader')) return;
    if (greeted && docked) {
      showContactLine(contactState);
      return;
    }
    const lines = greeted ? scrollLines : greetings;
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
    const choices = messages.map((_, index) => index).filter(index => index !== lastMessage);
    lastMessage = choices[Math.floor(Math.random() * choices.length)];
    if (!docked) message.textContent = messages[lastMessage];
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      if (bubble.contains(document.activeElement)) button.focus();
      hideMessage();
    }, 8000);
    clearTimeout(timer);
    direction.hidden = false;
    reaction.hidden = !reactionReady;
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
