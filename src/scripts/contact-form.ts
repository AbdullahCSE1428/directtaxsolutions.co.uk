/**
 * Progressive enhancement for the enquiry form.
 * Without JavaScript the form posts straight to FormSubmit (which redirects to
 * /thank-you/). With JavaScript we validate inline and send it in the
 * background, falling back to the normal post if the request cannot be made.
 */

type Field = HTMLInputElement | HTMLTextAreaElement;

const messages: Record<string, { valueMissing: string; typeMismatch?: string }> = {
  name: { valueMissing: 'Please enter your name.' },
  email: {
    valueMissing: 'Please enter your email address.',
    typeMismatch: 'Please enter a valid email address.',
  },
  message: { valueMissing: 'Please enter a message.' },
};

function validate(field: Field): boolean {
  const error = document.getElementById(`${field.id}-error`);
  const text = messages[field.name];
  let message = '';

  if (field.validity.valueMissing || !field.value.trim()) message = text?.valueMissing ?? '';
  else if (field.validity.typeMismatch) message = text?.typeMismatch ?? '';

  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
  if (error) error.textContent = message;
  return !message;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const card = form?.closest<HTMLElement>('[data-form-card]');
  if (!form || !card) return;

  const panel = card.querySelector<HTMLElement>('[data-form-panel]');
  const success = card.querySelector<HTMLElement>('[data-form-success]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const fields = Array.from(form.querySelectorAll<Field>('input[required], textarea[required]'));
  const endpoint = form.dataset.ajax;

  const setStatus = (text: string, tone: 'info' | 'error' = 'info') => {
    if (!status) return;
    status.dataset.tone = tone;
    status.textContent = text;
  };

  const setBusy = (busy: boolean) => {
    if (!submit) return;
    submit.disabled = busy;
    submit.toggleAttribute('data-busy', busy);
    form.setAttribute('aria-busy', String(busy));
  };

  const showSuccess = () => {
    form.reset();
    setStatus('');
    if (panel) panel.hidden = true;
    if (success) {
      success.hidden = false;
      success.querySelector<HTMLElement>('[data-success-title]')?.focus();
    }
  };

  const showFailure = () => {
    if (!status) return;
    status.dataset.tone = 'error';
    status.textContent = 'Sorry, your message could not be sent. Please try again';
    const email = form.dataset.email;
    if (email) {
      const link = document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      status.append(', or email us at ', link);
    }
    status.append('.');
  };

  // Validate a field once the visitor has interacted with it, then live.
  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.value.trim() || field.hasAttribute('aria-invalid')) validate(field);
    });
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validate(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length > 0) {
      setStatus('Please check the highlighted fields.', 'error');
      invalid[0]?.focus();
      return;
    }

    // Bots fill in the hidden honeypot field; quietly drop those submissions.
    const honeypot = form.elements.namedItem('_honey');
    if (honeypot instanceof HTMLInputElement && honeypot.value) {
      showSuccess();
      return;
    }

    if (!endpoint || !('fetch' in window)) {
      form.submit();
      return;
    }

    const payload = Object.fromEntries(new FormData(form));
    delete payload['_next'];

    setBusy(true);
    setStatus('Sending your message…');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result: { success?: string | boolean } = await response.json().catch(() => ({}));
      if (response.ok && String(result.success) === 'true') showSuccess();
      else showFailure();
    } catch {
      // The background request could not be made (offline, blocked…):
      // fall back to a regular form submission.
      form.submit();
    } finally {
      setBusy(false);
    }
  });

  card.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    if (success) success.hidden = true;
    if (panel) panel.hidden = false;
    fields[0]?.focus();
  });

  // “Enquire about …” links on the service cards pre-fill an empty message.
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  document.querySelectorAll<HTMLAnchorElement>('[data-enquire]').forEach((link) => {
    link.addEventListener('click', () => {
      if (success && !success.hidden && panel) {
        success.hidden = true;
        panel.hidden = false;
      }
      if (message && !message.value.trim()) {
        message.value = `Hello, I’d like to find out more about ${link.dataset.enquire}.`;
      }
    });
  });
}
