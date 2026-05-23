/* ============================================
   SANTI BLINDS — script.js
   ============================================ */

'use strict';

/* ---- NAV: Scroll & Mobile Toggle ---- */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!nav || !hamburger || !navLinks) return;

  // Scroll state
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
})();


/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Immediately reveal elements that are already in view on load
  function revealIfVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
        setTimeout(() => {
          el.classList.add('in-view');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    if (revealIfVisible(el)) {
      // Stagger top-of-page elements
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('in-view'), 100 + delay);
    } else {
      observer.observe(el);
    }
  });
})();


/* ---- HERO: Animate in on load (index page only) ---- */
(function initHeroLoad() {
  const heroReveals = document.querySelectorAll('.hero .reveal');
  if (!heroReveals.length) return;
  let delay = 200;
  heroReveals.forEach(el => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, delay);
    delay += 120;
  });
})();


/* ---- PAGE HERO INNER PAGES: Animate in on load ---- */
(function initPageHeroLoad() {
  const pageHeroReveals = document.querySelectorAll('.page-hero .reveal');
  if (!pageHeroReveals.length) return;
  let delay = 150;
  pageHeroReveals.forEach(el => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, delay);
    delay += 140;
  });
})();


/* ---- TESTIMONIALS SLIDER ---- */
(function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let touchStartX = 0;
  const slider = document.getElementById('testimonialSlider');
  if (slider) {
    slider.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  resetAuto();
})();


/* ---- CONTACT FORM ---- */
(function initForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();

    if (!name || !email) {
      shakeField(name ? form.email : form.name);
      return;
    }
    if (!isValidEmail(email)) {
      shakeField(form.email);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'Send Enquiry';
      btn.disabled = false;
      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    }, 1200);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeField(field) {
    field.style.animation = 'none';
    field.offsetHeight;
    field.style.animation = 'shake 0.4s ease';
    field.focus();
  }
})();


/* ---- GALLERY: Filter + Lightbox ---- */
(function initGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-grid__item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.room === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  // Products page filter
  const productFilterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  if (productCards.length && productFilterBtns.length) {
    productFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        productFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        productCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Lightbox
  const lightbox   = document.getElementById('lightbox');
  const lbBackdrop = document.getElementById('lightboxBackdrop');
  const lbImg      = document.getElementById('lightboxImg');
  const lbInfo     = document.getElementById('lightboxInfo');
  const lbClose    = document.getElementById('lightboxClose');
  const lbPrev     = document.getElementById('lightboxPrev');
  const lbNext     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let currentIdx = 0;
  const getVisible = () => [...galleryItems].filter(i => !i.classList.contains('hidden'));

  function openLightbox(idx) {
    const visible = getVisible();
    if (!visible.length) return;
    currentIdx = ((idx % visible.length) + visible.length) % visible.length;
    const item = visible[currentIdx];
    const fill = item.querySelector('.gallery-grid__fill');
    const label = item.querySelector('.gallery-grid__label');
    const product = item.querySelector('.gallery-grid__product');

    if (fill && lbImg) {
      lbImg.style.background = getComputedStyle(fill).background;
      lbImg.style.backgroundImage = getComputedStyle(fill).backgroundImage;
    }
    if (lbInfo) {
      lbInfo.textContent = (label ? label.textContent : '') + (product ? '  ·  ' + product.textContent : '');
    }
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const visible = getVisible();
      const visIdx = visible.indexOf(item);
      openLightbox(visIdx);
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const visible = getVisible();
        openLightbox(visible.indexOf(item));
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => openLightbox(currentIdx - 1));
  if (lbNext) lbNext.addEventListener('click', () => openLightbox(currentIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) openLightbox(diff > 0 ? currentIdx + 1 : currentIdx - 1);
  }, { passive: true });
})();


/* ---- FAQ ACCORDION ---- */
(function initFAQ() {
  // Handle both .faq__item/.faq__q and .faq-item/.faq-item__q patterns
  const items = document.querySelectorAll('.faq__item, .faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq__q, .faq-item__q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq__q, .faq-item__q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ---- SMOOTH SCROLL ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---- PARALLAX: Hero slat overlay subtle shift ---- */
(function initParallax() {
  const overlay = document.querySelector('.hero__slats-overlay');
  if (!overlay) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    overlay.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
})();


/* ---- MARQUEE: Seamless infinite loop — clone until wider than viewport ---- */
(function initMarquee() {
  document.querySelectorAll('.marquee').forEach(marquee => {
    const track = marquee.querySelector('.marquee__track');
    if (!track) return;

    // Pause animation while we measure & clone
    track.style.animation = 'none';

    // Collect the original set of child nodes (one full logical set)
    const originalChildren = Array.from(track.children);
    if (!originalChildren.length) return;

    // Clone until the track is at least 2× the viewport width
    // so translateX(-50%) always lands on an identical copy
    const minWidth = window.innerWidth * 2;

    function getTotalWidth() {
      return track.scrollWidth;
    }

    // Keep adding full copies of the original set until we exceed minWidth
    let safetyLimit = 20; // never loop forever
    while (getTotalWidth() < minWidth && safetyLimit-- > 0) {
      originalChildren.forEach(child => {
        track.appendChild(child.cloneNode(true));
      });
    }

    // Now the track is long enough. The animation should move exactly
    // one "original set" width — which is half the total track width
    // if we only cloned once, or we use the measured original width.
    const oneSetWidth = originalChildren.reduce((sum, el) => {
      return sum + el.getBoundingClientRect().width;
    }, 0);

    // Inject a per-marquee keyframe using the exact pixel distance
    const uid = 'mq' + Math.random().toString(36).slice(2, 7);
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${uid} {
        from { transform: translateX(0); }
        to   { transform: translateX(-${oneSetWidth}px); }
      }
    `;
    document.head.appendChild(style);

    // Apply the custom animation — duration scales with content length
    // so speed feels consistent regardless of how many words are in the track
    const basePx = 120; // px per second
    const duration = Math.round(oneSetWidth / basePx);
    track.style.animation = `${uid} ${duration}s linear infinite`;
  });
})();
