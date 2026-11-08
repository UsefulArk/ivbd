/* IVBD progressive enhancements: no dependencies, network requests or tracking. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const effects = new Set();
  const style = getComputedStyle(document.documentElement);
  const duration = token => parseFloat(style.getPropertyValue(token));
  const ease = style.getPropertyValue('--studio-ease').trim();
  function play(element, frames, token) {
    if (document.hidden || reduced.matches || !element?.animate) return;
    const animation = element.animate(frames, { duration: duration(token), easing: ease });
    effects.add(animation);
    animation.finished.catch(() => {}).finally(() => effects.delete(animation));
    return animation;
  }
  // Real image readiness, with independent bounded exits and no minimum delay.
  const root = document.documentElement;
  const loader = document.getElementById('site-loader');
  let loadingTimer, entranceTimer, releaseTimer, loadingFinished = false;
  function releaseLoader() {
    clearTimeout(releaseTimer);
    root.classList.remove('studio-loading');
    loader?.remove();
  }
  function dismissLoader() {
    clearTimeout(loadingTimer);
    clearTimeout(entranceTimer);
    loadingFinished = true;
    root.classList.remove('studio-entry');
    releaseLoader();
  }
  function finishLoading() {
    if (loadingFinished) return;
    loadingFinished = true;
    clearTimeout(loadingTimer);
    if (document.hidden || reduced.matches || location.hash) { dismissLoader(); return; }
    loader?.classList.add('is-leaving');
    releaseTimer = setTimeout(releaseLoader, duration('--loader-exit') + 30);
    root.classList.add('studio-entry');
    entranceTimer = setTimeout(() => root.classList.remove('studio-entry'), duration('--entry-length'));
  }
  if (loader && root.classList.contains('studio-loading')) {
    const hero = document.querySelector('.hero-image img');
    loader.addEventListener('animationend', e => { if (e.target === loader && e.animationName === 'loader-away') releaseLoader(); });
    loadingTimer = setTimeout(finishLoading, 900);
    if (!hero || hero.complete) finishLoading();
    else {
      hero.addEventListener('load', finishLoading, { once: true });
      hero.addEventListener('error', finishLoading, { once: true });
    }
    document.addEventListener('focusin', dismissLoader, { once: true });
    document.addEventListener('pointerdown', dismissLoader, { once: true, passive: true });
  } else loader?.remove();
  function settle() {
    dismissLoader();
    effects.forEach(animation => animation.cancel());
    clearLight();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  reduced.addEventListener('change', () => { if (reduced.matches) settle(); });
  window.addEventListener('pagehide', settle);
  window.addEventListener('hashchange', dismissLoader);

  const consult = document.querySelector('.mobile-consult');
  if (consult && 'IntersectionObserver' in window) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
      consult.hidden = visible.size > 0;
    });
    document.querySelectorAll('.hero-actions, #contact').forEach(el => observer.observe(el));
  }

  // A single pointer sample and paint per frame for the aura and nearby edges.
  const aura = document.createElement('span');
  aura.className = 'cursor-aura';
  aura.setAttribute('aria-hidden', 'true');
  document.body.append(aura);
  const groupSelector = '.pricing-grid, .service-list, .homes-grid, .tour-grid, .room-tabs';
  const cardSelector = '.package, details, .home-card, .tour-card, .room-tab';
  const groups = new Map();
  document.querySelectorAll(groupSelector).forEach(group => {
    const cards = [...group.children].filter(el => el.matches(cardSelector));
    cards.forEach(card => {
      const spot = document.createElement('span');
      spot.className = 'cursor-spot';
      spot.setAttribute('aria-hidden', 'true');
      card.classList.add('glow-card');
      card.append(spot);
    });
    groups.set(group, cards);
  });
  let frame = 0, point, lit = [];
  function clearLight() {
    cancelAnimationFrame(frame);
    frame = 0;
    aura.classList.remove('is-visible');
    lit.forEach(card => card.classList.remove('is-lit'));
    lit = [];
  }
  function paintLight() {
    frame = 0;
    const { x, y, group } = point;
    const nearby = (groups.get(group) || []).map(card => [card, card.getBoundingClientRect()])
      .filter(([, box]) => x > box.left - 60 && x < box.right + 60 && y > box.top - 60 && y < box.bottom + 60);
    const next = nearby.map(([card]) => card);
    lit.forEach(card => { if (!next.includes(card)) card.classList.remove('is-lit'); });
    lit = next;
    aura.style.transform = `translate3d(${x - 90}px,${y - 90}px,0)`;
    aura.classList.add('is-visible');
    nearby.forEach(([card, box]) => {
      const dx = x - box.left, dy = y - box.top;
      card.classList.add('is-lit');
      card.style.setProperty('--glow-x', dx + 'px');
      card.style.setProperty('--glow-y', dy + 'px');
      card.lastElementChild.style.transform = `translate3d(${dx - 160}px,${dy - 160}px,0)`;
    });
  }
  document.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
    point = { x: event.clientX, y: event.clientY, group: event.target.closest?.(groupSelector) };
    if (!frame) frame = requestAnimationFrame(paintLight);
  }, { passive: true });
  document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') clearLight(); });
  document.addEventListener('pointerleave', clearLight);
  document.addEventListener('keydown', clearLight);
  window.addEventListener('blur', clearLight);
  fine.addEventListener('change', clearLight);

  // Animate the incoming photograph when the browser actually has pixels to show.
  document.querySelectorAll('.feature-image, #lightbox-image').forEach(image => {
    let previous;
    image.addEventListener('load', () => {
      previous?.cancel();
      const bounds = image.getBoundingClientRect();
      if (!bounds.height || bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      previous = play(image, [{ opacity: .42 }, { opacity: 1 }], '--room-length');
    });
  });

  if ('IntersectionObserver' in window) {
    const reveals = new WeakMap();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) {
          reveals.get(target)?.cancel();
          return;
        }
        if (reveals.has(target) || document.hidden) return;
        if (target.matches(':target') || target.contains(document.activeElement)) {
          observer.unobserve(target);
          return;
        }
        const animation = play(target, [
          { opacity: .28, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'none' }
        ], '--section-length');
        if (!animation) {
          observer.unobserve(target);
          return;
        }
        reveals.set(target, animation);
        const done = () => observer.unobserve(target);
        animation.finished.then(done, done);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.section-heading, .home-picture, .tour-image, .process-grid article, .package, .project-intro, .services-intro h2, .contact-intro h2')
      .forEach(el => observer.observe(el));
  }

  // A single, gentle camera move per room. No scroll loop or extra media.
  if ('IntersectionObserver' in window) {
    const scenes = new Map();
    const camera = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        let scene = scenes.get(target);
        if (!isIntersecting) {
          scene?.animations.forEach(animation => animation?.cancel());
          return;
        }
        if (scene || document.hidden || reduced.matches) return;
        scene = { animations: [] };
        scenes.set(target, scene);
        const enter = () => {
          if (!target.isConnected || document.hidden || reduced.matches || !target.complete || !target.naturalWidth) return;
          const small = matchMedia('(max-width: 600px)').matches;
          scene.animations.push(play(target, [{ transform: 'scale(1.03)' }, { transform: 'scale(1)' }], '--camera-length'));
          const card = target.closest('.tour-card');
          card?.querySelectorAll('.room-label, h3, p').forEach(caption => scene.animations.push(play(caption,
            [{ opacity: .3, transform: `translateY(${small ? 10 : 16}px)` }, { opacity: 1, transform: 'none' }], '--section-length')));
        };
        if (target.complete) enter(); else target.addEventListener('load', () => {
          const box = target.getBoundingClientRect();
          if (box.bottom > 0 && box.top < innerHeight) enter();
          else scenes.delete(target);
        }, {once:true});
      });
    }, {threshold: .12});
    document.querySelectorAll('.tour-image img, .home-picture img').forEach(img => camera.observe(img));
  }

  // Swiping changes a photo; vertical scrolling and pinch zoom stay native.
  document.querySelectorAll('#lightbox-image, .room-feature-photo').forEach(surface => {
    let start;
    surface.classList.add('swipe-surface');
    surface.addEventListener('pointerdown', event => {
      if (!event.isPrimary) { start = undefined; return; }
      if (event.pointerType !== 'touch') return;
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
