// Submit in the background, then show the portfolio's own thank-you page.
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submit = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  let sending = false;
  let sent = false;
  submit.disabled = false;
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    sending = false;
    sent = false;
    submit.disabled = false;
    submit.textContent = 'Send enquiry ↗';
    status.textContent = '';
    form.removeAttribute('aria-busy');
    form.querySelectorAll('input, textarea').forEach(field => { field.disabled = false; });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent || !form.reportValidity()) return;
    const data = new FormData(form);
    if (String(data.get('_honey') || '').trim()) return;
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your enquiry…';
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
      window.location.assign(new URL('thank-you.html', document.baseURI).href);
    } catch {
      status.textContent = 'Your enquiry could not be confirmed. Your message is still here; please try again or contact me on Upwork or LinkedIn.';
      submit.textContent = 'Send enquiry ↗';
      submit.disabled = false;
      fields.forEach(field => { field.disabled = false; });
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
