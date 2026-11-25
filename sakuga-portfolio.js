/* App wiring only. button.js and slider.js are unchanged upstream components. */
(() => {
  document.querySelectorAll('sakuga-button[data-href]').forEach(button => {
    button.addEventListener('click', event => {
      if (button.disabled || event.defaultPrevented) return;
      const link = document.createElement('a');
      link.href = button.dataset.href;
      link.target = event.ctrlKey || event.metaKey ? '_blank' : button.dataset.target || '_self';
      link.rel = button.dataset.rel || 'noopener noreferrer';
      if (button.hasAttribute('data-download')) link.download = button.dataset.download;
      link.click();
    });
  });
  // Existing handlers update ARIA on hosts; mirror it onto the real shadow button.
  customElements.whenDefined('sakuga-button').then(() => {
    document.querySelectorAll('sakuga-button').forEach(host => {
      const sync = () => {
        const button = host.shadowRoot?.querySelector('button');
        if (!button) return;
        for (const name of ['aria-label', 'aria-pressed', 'aria-expanded', 'aria-controls']) {
          if (host.hasAttribute(name)) button.setAttribute(name, host.getAttribute(name));
          else button.removeAttribute(name);
        }
      };
      sync();
      new MutationObserver(sync).observe(host, { attributes: true, attributeFilter: ['aria-label', 'aria-pressed', 'aria-expanded', 'aria-controls'] });
    });
  });
})();
// Sakuga inputs participate in FormData through their own ElementInternals.
// Mirror the portfolio's constraints into the native input without editing input.js.
customElements.whenDefined('sakuga-input').then(() => {
  document.querySelectorAll('sakuga-input').forEach(host => {
    const input = host.shadowRoot.querySelector('input');
    for (const attribute of ['required', 'maxlength', 'minlength', 'pattern']) {
      if (host.hasAttribute(attribute)) input.setAttribute(attribute, host.getAttribute(attribute));
    }
    const validate = () => host.internals.setValidity(input.validity, input.validationMessage, input);
    input.addEventListener('input', validate);
    input.addEventListener('change', validate);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.isComposing) {
        event.preventDefault();
        host.closest('form')?.requestSubmit();
      }
    });
    host.addEventListener('invalid', () => input.focus());
    validate();
  });
});
