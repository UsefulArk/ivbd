/* IVBD interactions — plain JavaScript, no framework or tracking scripts. */
(() => {
  'use strict';
  const config = window.IVBD;
  const contacts = config.contact;
  const createEl = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  // Accessible mobile navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuToggle && mobileNav) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let transition;
    function setMenu(open, immediate = false) {
      transition?.cancel();
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.inert = !open;
      mobileNav.hidden = false;
      if (immediate || reduced.matches || !mobileNav.animate || document.hidden) {
        mobileNav.hidden = !open;
        return;
      }
      const styles = getComputedStyle(mobileNav);
      const frames = [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }];
      transition = mobileNav.animate(open ? frames : frames.reverse(), {
        duration: parseFloat(styles.getPropertyValue('--menu-length')),
        easing: styles.getPropertyValue('--studio-ease').trim()
      });
      transition.onfinish = () => { mobileNav.hidden = !open; };
    }
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false, true); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileNav.hidden) { setMenu(false); menuToggle.focus(); }
    });
    matchMedia('(min-width: 851px)').addEventListener('change', e => { if (e.matches) setMenu(false, true); });
    reduced.addEventListener('change', () => { if (reduced.matches) transition?.finish(); });
    window.addEventListener('pagehide', () => setMenu(false, true));
    document.addEventListener('visibilitychange', () => { if (document.hidden) setMenu(false, true); });
  }

  // Keep legacy bookmarks useful after the redesign.
  if (document.body.dataset.apartment === undefined) {
    const legacy = { '#gallery': '#apartments', '#about': '#services' };
    if (legacy[window.location.hash]) {
      document.querySelector(legacy[window.location.hash])?.scrollIntoView();
    }
  }

  // Homepage room tabs. Only the selected photograph is requested.
  const roomTabs = Array.from(document.querySelectorAll('.room-tab'));
  function activateRoom(tab, focus = false) {
    const room = config.apartments[0].rooms.find(item => item.id === tab.dataset.room);
    if (!room) return;
    roomTabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    const image = document.querySelector('.feature-image');
    const maxWidth = room.image.startsWith('warm-') ? 1536 : 1920;
    image.alt = room.alt;
    image.srcset = `assets/${room.image}-480.webp 480w, assets/${room.image}-960.webp 960w, assets/${room.image}-${maxWidth}.webp ${maxWidth}w`;
    image.src = `assets/${room.image}-960.webp`;
    document.getElementById('feature-label').textContent = `THE WARM RESIDENCE / ${room.label.toUpperCase()}`;
    document.getElementById('feature-title').textContent = room.title;
    document.getElementById('feature-description').textContent = room.description;
    document.getElementById('feature-link').href = `warm-residence.html#room-${room.id}`;
    document.getElementById('room-panel').setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
  }
  roomTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateRoom(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % roomTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + roomTabs.length) % roomTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = roomTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateRoom(roomTabs[next], true);
      }
    });
  });

  document.querySelector('.room-feature-photo')?.addEventListener('ivbd:swipe', event => {
    const index = roomTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    if (roomTabs.length) activateRoom(roomTabs[(index + event.detail.direction + roomTabs.length) % roomTabs.length]);
  });

  document.querySelectorAll('.service-list details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) document.querySelectorAll('.service-list details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });

  // Standard and Premium deliberately share the same presentation and deliverables.
  const pricing = document.getElementById('pricing-grid');
  if (pricing) config.packages.forEach(item => {
    const card = createEl('article', 'package');
    card.append(createEl('p', 'eyebrow', item.eyebrow), createEl('h3', '', item.name), createEl('p', 'package-desc', item.description));
    const list = createEl('ul');
    item.points.forEach(point => list.append(createEl('li', '', point)));
    const link = createEl('a', 'button button-dark', 'Request a quote');
    link.href = '#contact';
    const arrow = createEl('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
    link.addEventListener('click', () => { document.querySelector('[name="package"]').value = item.name; });
    card.append(list, link, createEl('p', 'package-note', 'Thoughtful design. A home that feels like you.'));
    pricing.append(card);
  });

  // Apartment lightbox reads the images and captions directly from each HTML page.
  const lightbox = document.getElementById('room-lightbox');
  const galleryButtons = Array.from(document.querySelectorAll('[data-gallery]'));
  if (lightbox && galleryButtons.length) {
    let selectedRoom = 0;
    const showRoom = index => {
      selectedRoom = (index + galleryButtons.length) % galleryButtons.length;
      const button = galleryButtons[selectedRoom];
      const article = button.closest('.tour-card');
      const image = document.getElementById('lightbox-image');
      image.src = button.dataset.full;
      image.alt = button.querySelector('img').alt;
      document.getElementById('lightbox-title').textContent = article.querySelector('h3').textContent;
      document.getElementById('lightbox-caption').textContent = `${selectedRoom + 1} / ${galleryButtons.length} · ${article.querySelector('.room-label').textContent.split(' / ')[1]}`;
    };
    galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
      showRoom(index);
      lightbox.showModal();
      document.body.classList.add('modal-open');
    }));
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    document.getElementById('lightbox-prev').addEventListener('click', () => showRoom(selectedRoom - 1));
    document.getElementById('lightbox-next').addEventListener('click', () => showRoom(selectedRoom + 1));
    lightbox.addEventListener('ivbd:swipe', event => showRoom(selectedRoom + event.detail.direction));
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        showRoom(selectedRoom + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
    lightbox.addEventListener('click', event => {
      if (event.target !== lightbox) return;
      const bounds = lightbox.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
    });
  }

  // Contact actions remain inactive until real details are configured.
  if (document.getElementById('consultation-form')) {
  const whatsappRaw = String(contacts.whatsapp || '').trim();
  const whatsappDigits = whatsappRaw.replace(/\D/g, '');
  const whatsapp = /^[+\d ()-]+$/.test(whatsappRaw) && /^[1-9]\d{6,14}$/.test(whatsappDigits) ? whatsappDigits : '';
  const email = String(contacts.email || '').trim();
  const facebook = /^https:\/\//.test(contacts.facebook || '') ? contacts.facebook : '';
  const endpoint = /^https:\/\//.test(contacts.formEndpoint || '') ? contacts.formEndpoint : '';
  const channelList = [
    {label:whatsapp ? 'Chat on WhatsApp' : 'WhatsApp · +8801614886374',url:whatsapp ? `https://wa.me/${whatsapp}` : '',note:'Number is added'},
    {label:'Message on Facebook',url: 'https://www.facebook.com/profile.php?id=61594814672042' ,note:' link is  added'},
    ...(email ? [{label:'Email us',url:`mailto:${email}`}] : [])
  ];
  channelList.forEach(item => {
    const block = createEl('div', 'contact-channel-block');
    if(item.url) {
      const link = createEl('a', 'contact-channel', item.label); link.href = item.url;
      if(!item.url.startsWith('mailto:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      link.append(createEl('span','','↗')); block.append(link);
    } else {
      block.append(createEl('span','contact-channel contact-channel-placeholder',item.label),createEl('span','channel-note',item.note));
    }
    document.getElementById('contact-channels').append(block);
  });
  const form = document.getElementById('consultation-form');
  const status = document.getElementById('form-status');
  const submitLabel = document.getElementById('submit-label');
  const formPrivacy = document.getElementById('form-privacy');
  const primaryButton = form.querySelector('[value="primary"]');
  const facebookButton = form.querySelector('[value="facebook"]');
  form.noValidate = true;
  primaryButton.setAttribute('aria-disabled', String(!endpoint && !whatsapp && !email));
  facebookButton.setAttribute('aria-disabled', String(!facebook));
  if(endpoint || whatsapp || email) {
    submitLabel.textContent = endpoint ? 'Request my free consultation' : whatsapp ? 'Continue on WhatsApp' : 'Continue in email';
    formPrivacy.textContent = endpoint ? 'Your details will be sent to IVBD to respond to your enquiry.' : `Your brief will open in ${whatsapp ? 'WhatsApp' : 'your email app'}. Review it and send when ready.`;
  } else if(facebook) {
    formPrivacy.textContent = 'Continue on Facebook to review your enquiry and send it in a message. WhatsApp will be available once our number is added.';
  }
  form.addEventListener('input', () => {status.textContent = '';});
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const channel = event.submitter?.value || 'primary';
    if(channel === 'facebook' && !facebook) { status.textContent = 'Our Facebook Page link will be added shortly. You can save a copy of your brief in the meantime.'; return; }
    if(channel === 'primary' && !endpoint && !whatsapp && !email) { status.textContent = 'XXXXXXX is a temporary placeholder. WhatsApp enquiries will open once our real contact number is added. You can save a copy of your brief for now.'; return; }
    if(!form.reportValidity()) return;
    const raw = Object.fromEntries(new FormData(form)); if(raw.website) return; delete raw.website;
    const values = Object.fromEntries(Object.entries(raw).map(([key,val]) => [key,String(val).trim()]));
    const brief = `INTERIOR VISUALISATION BD — APARTMENT BRIEF\n\nName: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email || 'Not provided'}\nApartment location: ${values.location}\nApartment size: ${values.size}\nService: ${values.service}\nDesign approach: ${values.package}\nEstimated design budget: ${values.budget || 'To discuss'}\n\nAdditional requirements:\n${values.requirements || 'To discuss during consultation'}\n`;
    if(channel === 'download') {
      const blob = new Blob([brief],{type:'text/plain;charset=utf-8'}); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'IVBD-apartment-brief.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'A copy of your apartment brief has been downloaded to your device.';
    } else if(channel === 'facebook') {
      window.open(facebook, '_blank', 'noopener,noreferrer');
      try { await navigator.clipboard.writeText(brief); status.textContent = 'Your brief has been copied. Open the Page’s Message option, paste your brief and send it on Facebook.'; }
      catch {
        const copyArea = createEl('textarea', 'brief-copy'); copyArea.value = brief; copyArea.readOnly = true; copyArea.setAttribute('aria-label', 'Your enquiry to copy into Facebook');
        status.replaceChildren(createEl('span','','Facebook has opened. Copy your brief below and paste it into a message to the Page.'),copyArea);
        copyArea.focus(); copyArea.select();
      }
    } else if(endpoint) {
      const submit = primaryButton; submit.disabled = true; const previous = submitLabel.textContent; submitLabel.textContent = 'Sending your enquiry…';
      try {
        const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(values)});
        if(!response.ok) throw new Error('Enquiry request failed');
        status.textContent = 'Thank you. Your enquiry has been sent to IVBD.'; form.reset();
      } catch { status.textContent = 'Your enquiry could not be sent. Please try again or use one of the contact links.'; }
      finally { submit.disabled = false; submitLabel.textContent = previous; }
    } else if(whatsapp) {
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(brief)}`, '_blank', 'noopener,noreferrer');
      status.textContent = 'Your brief is ready in WhatsApp. Review and send it there to complete your enquiry.';
    } else if(email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('Apartment design consultation — ' + values.name)}&body=${encodeURIComponent(brief)}`;
      status.textContent = 'Your email app should open with your brief. Review and send it there to complete your enquiry.';
    }
  });
    form.removeAttribute('inert');
  }
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
