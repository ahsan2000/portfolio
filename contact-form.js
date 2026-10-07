// Keep enquiries on the portfolio; FormSubmit delivers them to the configured inbox.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const slider = document.getElementById('deploy-slider');
  const check = document.getElementById('deploy-check');
  const checkState = document.getElementById('deploy-check-state');
  const caption = check.querySelector('.deploy-slider-caption');
  const submit = document.getElementById('deploy-submit');
  const terminal = document.getElementById('submission-terminal');
  const status = document.getElementById('submission-status');
  const another = document.getElementById('deploy-another');
  let confirmed = false;
  let sending = false;
  let sent = false;

  const resetCheck = () => {
    confirmed = false;
    slider.value = '0';
    slider.disabled = false;
    check.style.setProperty('--deploy-progress', '0%');
    check.classList.remove('confirmed');
    checkState.textContent = 'awaiting confirmation';
    caption.textContent = 'Slide to deploy →';
    submit.disabled = true;
  };
  slider.addEventListener('input', () => {
    if (sending || sent) return;
    const value = Number(slider.value);
    check.style.setProperty('--deploy-progress', `${value}%`);
    if (value === 100) {
      confirmed = true;
      slider.disabled = true;
      check.classList.add('confirmed');
      checkState.textContent = 'ready to deploy';
      caption.textContent = '✓ Ready to deploy';
      submit.disabled = false;
    }
  });
  slider.addEventListener('change', () => {
    if (!confirmed) resetCheck();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent) return;
    if (!form.reportValidity()) return;
    if (!confirmed) {
      slider.focus();
      return;
    }
    const data = new FormData(form);
    if (String(data.get('_honey') || '').trim()) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Deploying…';
    terminal.hidden = false;
    terminal.dataset.state = 'sending';
    form.setAttribute('aria-busy', 'true');
    status.textContent = '[ RUN ] Sending your enquiry to the inbox…';
    another.hidden = true;
    // Lock the submitted fields while the request is in flight.
    const fields = [...form.querySelectorAll('input:not([type="hidden"]), textarea')];
    fields.forEach(field => { field.disabled = true; });
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Submission was not confirmed');
      }
      sent = true;
      terminal.dataset.state = 'success';
      status.textContent = '[ OK ] Enquiry submitted. Thank you! I’ll reply to the email you provided.';
      submit.textContent = 'Message deployed ✓';
      another.hidden = false;
    } catch (error) {
      terminal.dataset.state = 'error';
      status.textContent = error.name === 'AbortError'
        ? '[ WARN ] The connection timed out; delivery could not be confirmed. You can retry or contact me on Upwork or LinkedIn.'
        : '[ ERROR ] Submission could not be confirmed. Your message is still here. Please retry, or contact me on Upwork or LinkedIn.';
      fields.forEach(field => { field.disabled = false; });
      resetCheck();
      submit.textContent = 'Retry deployment ↗';
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.removeAttribute('aria-busy');
    }
  });
  another.addEventListener('click', () => {
    if (sending) return;
    sent = false;
    form.reset();
    form.querySelectorAll('input, textarea').forEach(field => { field.disabled = false; });
    resetCheck();
    terminal.hidden = true;
    another.hidden = true;
    submit.textContent = 'Deploy message ↗';
    form.elements.namedItem('name').focus();
  });
  resetCheck();
})();
