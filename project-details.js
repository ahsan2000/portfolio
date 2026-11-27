/* One shared details panel per project: hover, tap, keyboard and Escape. */
(() => {
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('#work .project-card').forEach((card, index) => {
    const preview = card.querySelector('.project-preview');
    const details = card.querySelector('.case-study');
    if (!preview || !details) return;
    const panel = document.createElement('div');
    panel.className = 'project-details'; panel.id = `project-details-${index}`;
    panel.tabIndex = 0;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Project'} details`);
    panel.append(details);
    const toggle = document.createElement('button');
    toggle.type = 'button';toggle.className = 'project-details-toggle';
    toggle.setAttribute('aria-controls', panel.id);
    let open = false;
    function setOpen(value) {
      open = value;card.classList.toggle('details-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close details' : 'Project details';
      panel.setAttribute('aria-hidden', String(!open));panel.inert = !open;
    }
    preview.append(panel, toggle);setOpen(false);
    toggle.addEventListener('click', e => { e.stopPropagation();setOpen(!open); });
    preview.addEventListener('click', e => {
      if (!e.target.closest('button,a,.project-details')) setOpen(!open);
    });
    preview.addEventListener('pointerenter', () => { if (hover.matches) setOpen(true); });
    preview.addEventListener('pointerleave', () => {
      if (hover.matches && !preview.contains(document.activeElement)) setOpen(false);
    });
    // Mouse wheels and trackpads keep driving the portfolio timeline.
    // An explicitly focused panel still permits keyboard/detail scrolling.
    panel.addEventListener('wheel', e => {
      if (!hover.matches || e.ctrlKey || !open || document.activeElement === panel) return;
      e.preventDefault();
      let distance = e.deltaY || e.deltaX;
      if (e.deltaMode === 1) distance *= 16;
      if (e.deltaMode === 2) distance *= window.innerHeight;
      window.scrollBy({top: distance, behavior: 'instant'});
    }, {passive: false});
    preview.addEventListener('focusout', e => {
      if (!preview.contains(e.relatedTarget)) setOpen(false);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) { e.preventDefault();toggle.focus();setOpen(false); }
    });
  });
})();
