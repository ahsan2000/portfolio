// Submit in the background, then show the portfolio's own thank-you page.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submit = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const slider = document.getElementById('send-slider');
  const check = document.getElementById('send-check');
  const checkState = document.getElementById('send-check-state');
  const caption = check.querySelector('.send-slider-caption');
  let confirmed = false;
  const notifyFox = state => window.dispatchEvent(new CustomEvent('portfolio-contact-state', { detail: { state } }));
  const resetCheck = () => {
    confirmed = false;
    slider.value = '0';
    slider.disabled = false;
    submit.disabled = true;
    check.classList.remove('confirmed');
    check.style.setProperty('--send-progress', '0%');
    checkState.textContent = 'Slide to unlock';
    caption.textContent = 'Slide right →';
  };
  slider.addEventListener('input', () => {
    if (sending || sent) return;
    const value = Number(slider.value);
    check.style.setProperty('--send-progress', `${value}%`);
    if (value === 100) {
      confirmed = true;
      slider.disabled = true;
      submit.disabled = false;
      check.classList.add('confirmed');
      checkState.textContent = 'Ready to send';
      caption.textContent = '✓ Ready to send';
      notifyFox('ready');
    }
  });
  slider.addEventListener('change', () => { if (!confirmed) resetCheck(); });
  let sending = false;
  let sent = false;
  resetCheck();
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    sending = false;
    sent = false;
    resetCheck();
    notifyFox('idle');
    submit.textContent = 'Send enquiry ↗';
    status.textContent = '';
    form.removeAttribute('aria-busy');
    form.querySelectorAll('input, textarea').forEach(field => { field.disabled = false; });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent || !form.reportValidity()) return;
    if (!confirmed) { slider.focus(); return; }
    const data = new FormData(form);
    if (String(data.get('_honey') || '').trim()) return;
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your enquiry…';
    notifyFox('sending');
    form.setAttribute('aria-busy', 'true');
    const fields = [...form.querySelectorAll('input:not([type="hidden"]), textarea')];
    fields.forEach(field => { field.disabled = true; });
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json();
      if (!response.ok || !(result.success === true || result.success === 'true')) {
        throw new Error('Submission was not confirmed');
      }
      sent = true;
      notifyFox('success');
      window.location.assign(new URL('thank-you.html', document.baseURI).href);
    } catch {
      status.textContent = 'Your enquiry could not be confirmed. Your message is still here; please try again or contact me on Upwork or LinkedIn.';
      submit.textContent = 'Send enquiry ↗';
      submit.disabled = false;
      fields.forEach(field => { field.disabled = false; });
      slider.disabled = true;
      notifyFox('error');
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
