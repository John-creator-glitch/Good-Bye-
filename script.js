/**
 * FAREWELL PAGE — JAVASCRIPT
 * ==========================
 *
 * Sections:
 *   0. Site navigation (scroll state + mobile menu)
 *   1. Scroll-triggered animations (Intersection Observer)
 *   2. Hero parallax effect
 *   3. Gallery lightbox
 *   3B. Background music (autoplay with fallback + toggle button)
 *   4. Stat counter animation
 *
 * No external libraries required — pure vanilla JS.
 */

'use strict';

/* ================================================================
 * 0. SITE NAVIGATION
 *
 *    Adds a solid background to the fixed nav bar once the page
 *    scrolls past the hero, and wires up the mobile hamburger
 *    menu (opens the link panel, closes it again on link click
 *    or outside click).
 * ================================================================ */
(function initSiteNav() {
  const nav      = document.getElementById('siteNav');
  const toggle   = document.getElementById('siteNavToggle');
  const links    = document.getElementById('siteNavLinks');
  if (!nav || !toggle || !links) return;

  /* Solid background after scrolling past ~40px */
  function updateNavBg() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', updateNavBg, { passive: true });
  updateNavBg();

  /* Mobile hamburger toggle */
  function closeMenu() {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    links.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  /* Close the mobile menu once a link is tapped */
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });
})();


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
 * 3B. BACKGROUND MUSIC
 *
 *    Tries to autoplay a soft track the moment the page loads.
 *    Most browsers block audio with sound until the visitor has
 *    interacted with the page at least once, so if the initial
 *    play() is blocked, we quietly retry on the visitor's first
 *    click/keypress/touch anywhere on the page. The floating
 *    button always reflects the true state and lets anyone turn
 *    the music off if they'd rather browse in silence.
 * ================================================================ */
(function initBackgroundMusic() {
  const audio  = document.getElementById('bgMusic');
  const toggle = document.getElementById('musicToggle');
  if (!audio || !toggle) return;

  audio.volume = 0.45; /* soft, background-level volume */

  function setPlayingState(isPlaying) {
    toggle.setAttribute('aria-pressed', String(isPlaying));
    toggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  }

  function attemptAutoplay() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlayingState(true))
        .catch(() => {
          /* Autoplay blocked — wait for the first user interaction */
          setPlayingState(false);
          const resumeOnInteraction = () => {
            audio.play().then(() => setPlayingState(true)).catch(() => {});
            document.removeEventListener('click', resumeOnInteraction);
            document.removeEventListener('keydown', resumeOnInteraction);
            document.removeEventListener('touchstart', resumeOnInteraction);
          };
          document.addEventListener('click', resumeOnInteraction, { once: true });
          document.addEventListener('keydown', resumeOnInteraction, { once: true });
          document.addEventListener('touchstart', resumeOnInteraction, { once: true });
        });
    }
  }

  /* Manual toggle button always works, regardless of autoplay state */
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlayingState(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayingState(false);
    }
  });

  attemptAutoplay();
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
