/* Optional graphics start after the content; phones retain the CSS scene. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  if (reduced.matches || compact.matches || navigator.connection?.saveData) {
    document.querySelector('.background-controls')?.setAttribute('hidden', '');
    document.querySelector('#cloud-scene')?.setAttribute('hidden', '');
    return;
  }
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  const start = async () => {
    try {
      await load('vendor/three.min.js');
      await load('devops-scene.js?v=20261008');
    } catch {
      document.querySelector('.background-controls')?.setAttribute('hidden', '');
    }
    if (!reduced.matches) load('tile-cloth.js?v=20261008').catch(() => {});
  };
  const schedule = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 3000 });
    else setTimeout(start, 1000);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
