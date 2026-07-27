/**
 * FAREWELL PAGE — JAVASCRIPT
 * ==========================
 *
 * Sections:
 *   1. Scroll-triggered animations (Intersection Observer)
 *   2. Hero parallax effect
 *   3. Gallery lightbox
 *   4. Stat counter animation
 *
 * No external libraries required — pure vanilla JS.
 */

'use strict';

/* ================================================================
 * 1. SCROLL-TRIGGERED ANIMATIONS
 *
 *    Any element with data-animate in the HTML will fade up
 *    into view when it enters the viewport.
 *    Optional data-delay="200" (in ms) staggers the animation.
 * ================================================================ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* animate once only */
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px', /* trigger slightly before full entry */
    }
  );

  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });
})();


/* ================================================================
 * 2. HERO PARALLAX
 *
 *    The hero background image (.js-parallax) moves at 40% of the
 *    scroll speed, creating a depth effect.
 *    Uses requestAnimationFrame for smooth 60 fps performance.
 * ================================================================ */
(function initParallax() {
  const heroBg = document.querySelector('.js-parallax');
  if (!heroBg) return;

  let ticking = false;

  function updateParallax() {
    /* Parallax only while hero is visible */
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.38}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ================================================================
 * 3. GALLERY LIGHTBOX
 *
 *    Clicking any .gallery-tile button opens a full-screen lightbox.
 *    Clicking the backdrop or close button (both have .js-lb-close)
 *    closes it. ESC key also closes.
 * ================================================================ */
(function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = lightbox.querySelector('.lightbox__img');
  const lbCaption    = lightbox.querySelector('.lightbox__caption');
  const triggers     = document.querySelectorAll('.gallery-tile[data-src]');

  /* Open lightbox */
  function open(src, caption) {
    lbImg.src         = src;
    lbImg.alt         = caption;
    lbCaption.textContent = caption;
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    /* Move focus to close button for accessibility */
    lightbox.querySelector('.lightbox__close').focus();
  }

  /* Close lightbox */
  function close() {
    lightbox.setAttribute('hidden', '');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  /* Wire up gallery tile clicks */
  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      open(btn.dataset.src, btn.dataset.caption || '');
    });
  });

  /* Close on backdrop / close-button click */
  lightbox.querySelectorAll('.js-lb-close').forEach((el) => {
    el.addEventListener('click', close);
  });

  /* Close on ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) close();
  });
})();


/* ================================================================
 * 4. STAT COUNTER ANIMATION
 *
 *    Elements with class .js-counter and data-target="<number>"
 *    count up from 0 to their target when they scroll into view.
 *    Non-integer targets (e.g. 4.5) are formatted with one decimal.
 * ================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.js-counter[data-target]');
  if (!counters.length) return;

  const DURATION = 1800; /* ms */

  function animateCounter(el) {
    const target     = parseFloat(el.dataset.target);
    const isDecimal  = !Number.isInteger(target);
    const start      = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      /* Ease-out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : target.toString();
    }
    requestAnimationFrame(step);
  }

  /* Trigger counter when it enters the viewport */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();