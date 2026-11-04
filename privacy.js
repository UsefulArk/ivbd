// Keep the privacy page's contact status consistent with site-content.js.
(() => {
  'use strict';
  const contact = window.IVBD?.contact || {};
  const rawNumber = String(contact.whatsapp || '').trim();
  const digits = rawNumber.replace(/\D/g, '');
  const whatsapp = /^[+\d ()-]+$/.test(rawNumber) && /^[1-9]\d{6,14}$/.test(digits) ? digits : '';
  const facebook = /^https:\/\//.test(contact.facebook || '') ? contact.facebook : '';
  const email = String(contact.email || '').trim();
  const endpoint = /^https:\/\//.test(contact.formEndpoint || '') ? contact.formEndpoint : '';
  const methods = [];
  if (whatsapp) methods.push('WhatsApp');
  if (facebook) methods.push('Facebook');
  if (email) methods.push('email');
  if (endpoint || methods.length) {
    document.getElementById('policy-current-flow').textContent = endpoint
      ? 'The primary enquiry button sends your completed form directly to the configured enquiry service so IVBD can respond. “Save a copy” creates a local file without sending it.'
      : `Available contact methods: ${methods.join(', ')}. Prepared messages are sent to IVBD only when you complete sending in your chosen app. “Save a copy” keeps the brief on your device.`;
    document.getElementById('policy-contact-note').textContent = 'Use a verified contact link above, or reply through your existing IVBD conversation, for a privacy request.';
  }
  if (endpoint) {
    const note = document.getElementById('policy-endpoint');
    note.hidden = false;
    note.textContent = `Direct form submission sends the fields listed in section 1 to our enquiry service at ${new URL(endpoint).hostname}. That service processes the enquiry for IVBD. This happens only when you press the primary submit button.`;
    if (!methods.length) {
      document.getElementById('policy-contact-note').textContent = 'Use the consultation form and describe your privacy request in the requirements field. Provide a contact method so IVBD can reply.';
    }
  }
  const links = document.getElementById('policy-contact-links');
  const addLink = (label, href) => {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    if (!href.startsWith('mailto:')) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    links.append(link);
  };
  if (whatsapp) addLink('Contact IVBD on WhatsApp ↗', `https://wa.me/${whatsapp}`);
  if (facebook) addLink('Contact IVBD on Facebook ↗', facebook);
  if (email) addLink('Email IVBD ↗', `mailto:${email}`);
})();
