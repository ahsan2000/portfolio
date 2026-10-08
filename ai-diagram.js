/* Native SVG request motion; suspend it outside the viewport. */
(() => {
  const descriptions = {
    users: 'Users send questions through the chat interface. Requests enter the application through the API gateway.',
    gateway: 'The API gateway handles authentication and rate limits before forwarding requests to the application.',
    kubernetes: 'Kubernetes runs the chatbot application and retrieval workers, with repeatable deployments and workload scaling.',
    model: 'Model services generate responses. Depending on the architecture, use self-hosted Ollama or Azure AI Foundry services.',
    vector: 'A vector database stores embeddings so retrieval workers can find relevant context for a question.',
    monitor: 'Monitoring tracks latency, errors, token usage, and costs to help operate the application reliably.'
  };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.ai-diagram').forEach(diagram => {
    const svg = diagram.querySelector('.ai-network');
    const toggle = diagram.querySelector('.ai-motion-toggle');
    const detail = diagram.querySelector('.ai-node-detail');
    const nodes = [...diagram.querySelectorAll('[data-ai-node]')];
    let paused = false, visible = !('IntersectionObserver' in window);
    const sync = () => {
      const stopped = paused || motion.matches;
      toggle.textContent = motion.matches ? 'Motion disabled' : paused ? 'Resume flow' : 'Pause flow';
      toggle.disabled = motion.matches;
      toggle.setAttribute('aria-pressed', String(stopped));
      if (stopped || !visible || document.hidden) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };
    svg.querySelectorAll('animateMotion').forEach(animation => animation.beginElement());
    const select = node => {
      nodes.forEach(item => item.setAttribute('aria-pressed', String(item === node)));
      detail.textContent = node.dataset.aiDescription || descriptions[node.dataset.aiNode];
    };
    nodes.forEach((node, index) => {
      node.addEventListener('click', () => select(node));
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); select(node);
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          const next = nodes[(index + (event.key === 'ArrowRight' ? 1 : -1) + nodes.length) % nodes.length];
          next.focus(); select(next);
        }
      });
    });
    toggle.addEventListener('click', () => { paused = !paused; sync(); });
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .05 });
      observer.observe(diagram);
    }
    window.addEventListener('pagehide', event => {
      svg.pauseAnimations();
      if (event.persisted) return;
      observer?.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    });
    window.addEventListener('pageshow', sync);
    sync();
  });
})();
