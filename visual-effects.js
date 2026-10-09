/* Start the desktop 3D world automatically after the page content loads. */
(() => {
  const button = document.querySelector('#scene-toggle');
  const canvas = document.querySelector('#cloud-scene');
  if (!button || !canvas) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px), (pointer: coarse)');
  if (reduced.matches || compact.matches || navigator.connection?.saveData) {
    button.parentElement.hidden = true;
    canvas.hidden = true;
    return;
  }
  button.disabled = true;
  button.textContent = 'Loading motion…';
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  const start = async () => {
    try {
      if (!window.THREE) await load('vendor/three.min.js');
      canvas.hidden = false;
      await load('devops-scene.js?v=20261009-navy-teal-v2');
      if (!canvas.parentElement.classList.contains('has-webgl')) throw new Error('Graphics unavailable');
      button.disabled = false;
      load('tile-cloth.js?v=20261009-oneview').catch(() => {});
    } catch {
      canvas.hidden = true;
      button.parentElement.hidden = true;
    }
  };
  const schedule = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 250);
  };
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
