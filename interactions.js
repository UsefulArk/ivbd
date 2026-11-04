/* IVBD progressive enhancements: no dependencies, network requests or tracking. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const effects = new Set();
  const play = (element, frames, options) => {
    if (reduced.matches || !element.animate) return;
    const animation = element.animate(frames, options);
    effects.add(animation);
    animation.finished.catch(() => {}).finally(() => effects.delete(animation));
  };
  reduced.addEventListener('change', () => {
    if (reduced.matches) effects.forEach(animation => animation.cancel());
  });

  // A soft ambient glow follows a mouse; touch and keyboard navigation stay clear.
  const aura = document.createElement('span');
  aura.className = 'cursor-aura';
  aura.setAttribute('aria-hidden', 'true');
  document.body.append(aura);
  let auraFrame = 0;
  let cursor;
  const hideAura = () => {
    cancelAnimationFrame(auraFrame);
    auraFrame = 0;
    aura.classList.remove('is-visible');
  };
  document.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch') { hideAura(); return; }
    cursor = { x: event.clientX, y: event.clientY };
    if (auraFrame) return;
    auraFrame = requestAnimationFrame(() => {
      auraFrame = 0;
      aura.style.transform = `translate3d(${cursor.x - 90}px, ${cursor.y - 90}px, 0)`;
      aura.classList.add('is-visible');
    });
  }, { passive: true });
  document.addEventListener('pointerleave', hideAura);
  document.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') hideAura(); });
  document.addEventListener('keydown', hideAura);
  document.addEventListener('visibilitychange', hideAura);
  addEventListener('blur', hideAura);
  fine.addEventListener('change', hideAura);
  reduced.addEventListener('change', hideAura);

  // A shared spotlight catches adjacent card edges, like light across a material.
  const groups = ['.pricing-grid', '.service-list', '.homes-grid', '.tour-grid', '.room-tabs'];
  groups.forEach(selector => {
    const group = document.querySelector(selector);
    if (!group) return;
    const cards = [...group.children].filter(card => card.matches('.package, details, .home-card, .tour-card, .room-tab'));
    cards.forEach(card => {
      card.classList.add('glow-card');
      const spot = document.createElement('span');
      spot.className = 'cursor-spot';
      spot.setAttribute('aria-hidden', 'true');
      // Keep summary first in details; the decorative layer never catches input.
      card.append(spot);
    });
    let frame = 0;
    let point;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      cards.forEach(card => card.classList.remove('is-lit'));
    };
    group.addEventListener('pointermove', event => {
      if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const boxes = cards.map(card => card.getBoundingClientRect());
        cards.forEach((card, index) => {
          const box = boxes[index];
          const x = point.x - box.left, y = point.y - box.top;
          const near = x > -70 && x < box.width + 70 && y > -70 && y < box.height + 70;
          card.classList.toggle('is-lit', near);
          if (!near) return;
          card.style.setProperty('--glow-x', `${x}px`);
          card.style.setProperty('--glow-y', `${y}px`);
          card.querySelector('.cursor-spot').style.transform = `translate3d(${x - 160}px, ${y - 160}px, 0)`;
        });
      });
    }, { passive: true });
    group.addEventListener('pointerleave', clear);
    fine.addEventListener('change', clear);
    reduced.addEventListener('change', clear);
  });

  // Content always stays visible without JavaScript or if an animation fails.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        play(entry.target, [
          { opacity: .65, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 520, easing: 'cubic-bezier(.2,.65,.3,1)' });
      });
    }, { threshold: .08 });
    document.querySelectorAll('.section-heading, .home-card, .tour-card, .process-grid article, .package, .project-intro').forEach(el => observer.observe(el));
  }

  // Swiping changes a photo; vertical scrolling and pinch zoom stay native.
  document.querySelectorAll('#lightbox-image, .room-feature-photo').forEach(surface => {
    let start;
    surface.classList.add('swipe-surface');
    surface.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId, time: performance.now() };
    }, { passive: true });
    surface.addEventListener('pointercancel', () => { start = undefined; });
    surface.addEventListener('pointerup', event => {
      const origin = start;
      start = undefined;
      if (!origin || event.pointerId !== origin.id) return;
      const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.7 || performance.now() - origin.time > 1000) return;
      surface.dispatchEvent(new CustomEvent('ivbd:swipe', { bubbles: true, detail: { direction: dx < 0 ? 1 : -1 } }));
    }, { passive: true });
  });
  document.querySelectorAll('.tour-image img, .feature-image, #lightbox-image').forEach(img => { img.draggable = false; });

  // One scroll measurement per frame, with a useful way back after long tours.
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  const top = document.createElement('button');
  top.className = 'back-to-top';
  top.type = 'button';
  top.textContent = '↑';
  top.setAttribute('aria-label', 'Back to top');
  top.hidden = true;
  top.addEventListener('click', () => {
    document.querySelector('.header .brand')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  document.body.append(progress, top);
  let scrollFrame = 0;
  const updateProgress = () => {
    scrollFrame = 0;
    const extent = document.documentElement.scrollHeight - innerHeight;
    const ratio = extent > 0 ? Math.max(0, Math.min(1, scrollY / extent)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    top.hidden = scrollY < 700;
  };
  const scheduleProgress = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  };
  addEventListener('scroll', scheduleProgress, { passive: true });
  addEventListener('resize', scheduleProgress, { passive: true });
  addEventListener('load', scheduleProgress, { once: true });
  updateProgress();
})();
