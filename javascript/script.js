/* ============================================
   SANTI BLINDS — script.js
   ============================================ */

'use strict';

/* ---- NAV: Scroll & Mobile Toggle ---- */
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

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
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


/* ---- HERO: Animate in on load ---- */
(function initHeroLoad() {
  const heroReveals = document.querySelectorAll('.hero .reveal');
  let delay = 300;
  heroReveals.forEach(el => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, delay);
    delay += 120;
  });
})();


/* ---- TESTIMONIALS SLIDER ---- */
(function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial');
  const dotsContainer = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  if (!slides.length) return;

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

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let touchStartX = 0;
  const slider = document.getElementById('testimonialSlider');
  slider.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

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

    // Simple validation
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

    // Simulate async send
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Send Enquiry';
      btn.disabled = false;
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }, 1200);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeField(field) {
    field.style.animation = 'none';
    field.offsetHeight; // reflow
    field.style.animation = 'shake 0.4s ease';
    field.focus();
  }

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();


/* ---- GALLERY: Filter + Lightbox ---- */
(function initGallery() {
  // --- Filter bar ---
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

  // --- Lightbox ---
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

    // Mirror the fill's background into the lightbox img
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

  galleryItems.forEach((item, i) => {
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

  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbBackdrop && lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev && lbPrev.addEventListener('click', () => openLightbox(currentIdx - 1));
  lbNext && lbNext.addEventListener('click', () => openLightbox(currentIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIdx + 1);
  });

  // Touch swipe on lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) openLightbox(diff > 0 ? currentIdx + 1 : currentIdx - 1);
  }, { passive: true });
})();




/* ---- FAQ ACCORDION ---- */
(function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;
  items.forEach(item => {
    const btn = item.querySelector('.faq__q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq__q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
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