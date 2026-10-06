// Connections follow real card positions, including the mobile layout.
(() => {
  const diagram = document.querySelector('.live-architecture');
  if (!diagram) return;
  const map = diagram.querySelector('.delivery-map');
  const svg = diagram.querySelector('svg');
  const lines = diagram.querySelector('.flow-lines');
  const nodes = [...diagram.querySelectorAll('.delivery-node')];
  const toggle = diagram.querySelector('.diagram-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  const updateMotion = () => {
    diagram.classList.toggle('flow-paused', paused || preference.matches);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume flow' : 'Pause flow';
  };
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  preference.addEventListener('change', updateMotion);
  const draw = () => {
    const base = map.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
    lines.replaceChildren();
    const rects = nodes.map(node => {
      const r = node.getBoundingClientRect();
      return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
    });
    const path = (d, feedback = false) => {
      for (const moving of [false, true]) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('d', d);
        el.setAttribute('class', moving ? 'flow-packet' : 'flow-track');
        if (!moving) el.setAttribute('marker-end', 'url(#flow-arrow)');
        if (feedback) el.classList.add('flow-return');
        lines.append(el);
      }
    };
    rects.slice(0, -1).forEach((a, i) => {
      const b = rects[i + 1];
      if (Math.abs(a.y - b.y) < 5) {
        const right = b.x > a.x;
        path(`M ${right ? a.x + a.w : a.x} ${a.y + a.h / 2} L ${right ? b.x : b.x + b.w} ${b.y + b.h / 2}`);
      } else {
        path(`M ${a.x + a.w / 2} ${a.y + a.h} L ${b.x + b.w / 2} ${b.y}`);
      }
    });
    const first = rects[0], last = rects[rects.length - 1];
    const bottom = base.height - 18;
    path(`M ${last.x + last.w / 2} ${last.y + last.h} L ${last.x + last.w / 2} ${bottom} L 12 ${bottom} L 12 ${first.y + first.h / 2} L ${first.x} ${first.y + first.h / 2}`, true);
  };
  new ResizeObserver(draw).observe(map);
  updateMotion();
  draw();
})();
