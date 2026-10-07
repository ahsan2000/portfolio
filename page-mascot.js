// Local vanilla JS integration of Koboyo's page-mascot fox-riso sheets.
// See assets/page-mascot-LICENSE.txt for the original MIT license.
(() => {
  const companion = document.querySelector('.fox-companion');
  if (!companion) return;
  const button = companion.querySelector('.fox-boop');
  const direction = companion.querySelector('.fox-directions');
  const reaction = companion.querySelector('.fox-reactions');
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
      if (button.hidden || document.hidden) return;
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
    'You should hire me. Even the fox thinks so.',
    'Want to talk to the human behind this fox?',
    onUpwork ? 'One Upwork message away. Let’s build something.' : 'I’m one email away. Your next idea starts with hello.',
    'Your next DevOps engineer? You’re looking at his portfolio.',
    'Less deployment drama. More time to build cool things.',
    'Got a cloud challenge? Let’s untangle it together.',
    'Great ideas deserve reliable infrastructure. Let’s talk.',
    'You bring the idea. I’ll bring the automation.',
    'Your pipeline called. It wants us to meet.',
    'Still scrolling? Imagine what we could build together.',
    'The fox handles the charm. I handle the deployments.',
    'A friendly hello could be the start of your next great project.'
  ];
  let lastMessage = -1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let timer;
  let messageTimer;
  const hideMessage = () => {
    clearTimeout(messageTimer);
    bubble.hidden = true;
  };
  const frame = (element, index) => {
    element.style.backgroundPosition = `${index % 3 * 50}% ${Math.floor(index / 3) * 50}%`;
  };
  frame(direction, 4);
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
    // Pick randomly from every message except the one currently displayed.
    const choices = messages.map((_, index) => index).filter(index => index !== lastMessage);
    lastMessage = choices[Math.floor(Math.random() * choices.length)];
    message.textContent = messages[lastMessage];
    bubble.hidden = false;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      if (bubble.contains(document.activeElement)) button.focus();
      hideMessage();
    }, 8000);
    clearTimeout(timer);
    direction.hidden = true;
    reaction.hidden = false;
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
    if (hasBeenPetted) scheduleHint(90000, true);
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
