/* ============================================================
   La Huerta de Juan Fernández — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ── DOM refs ─────────────────────────────────────── */
  const header      = $('#site-header');
  const hamburger   = $('#hamburger');
  const navLinks    = $('#nav-links');
  const langBtn     = $('#lang-btn');
  const langLabel   = $('#lang-label');
  const backToTop   = $('#back-to-top');
  const footerYear  = $('#footer-year');
  const contactForm = $('#contact-form');
  const formSuccess = $('#form-success');

  /* ─────────────────────────────────────────────────────
     FOOTER YEAR
  ───────────────────────────────────────────────────── */
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ─────────────────────────────────────────────────────
     STICKY HEADER
  ───────────────────────────────────────────────────── */
  function onScroll() {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────────────
     BACK TO TOP
  ───────────────────────────────────────────────────── */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────────────────────────────
     HAMBURGER / MOBILE MENU
  ───────────────────────────────────────────────────── */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click
    $$('.nav__link', navLinks).forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     LANGUAGE SWITCHER (ES / EN)
  ───────────────────────────────────────────────────── */
  let currentLang = localStorage.getItem('hjf-lang') || 'es';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('hjf-lang', lang);
    langLabel.textContent = lang === 'es' ? 'EN' : 'ES';
    document.documentElement.lang = lang;

    // Update all elements with data-es / data-en
    $$('[data-es][data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (!text) return;

      // For inputs / selects / buttons with value
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else if (el.tagName === 'OPTION') {
        el.textContent = text;
      } else {
        el.textContent = text;
      }

      // Also update aria-label if this element has one
      if (el.hasAttribute('aria-label')) {
        el.setAttribute('aria-label', text);
      }
    });

    // Update testimonial dot aria-labels (if dots have been built)
    const dotLabel = lang === 'es' ? 'Testimonio' : 'Testimonial';
    $$('.tns-dot').forEach((dot, i) => {
      dot.setAttribute('aria-label', `${dotLabel} ${i + 1}`);
    });
  }

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'es' ? 'en' : 'es');
    });
  }

  // Apply initial language
  applyLanguage(currentLang);

  /* ─────────────────────────────────────────────────────
     PRODUCT FILTER TABS
  ───────────────────────────────────────────────────── */
  const filterTabs  = $$('.filter-tab');
  const productCards = $$('.product-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      filterTabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });

      // Filter cards with animation
      productCards.forEach(card => {
        const matches = filter === 'all' || card.dataset.category === filter;
        if (matches) {
          card.classList.remove('hidden');
          card.style.animation = 'fade-up 0.4s ease both';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ─────────────────────────────────────────────────────
     TESTIMONIALS SLIDER
  ───────────────────────────────────────────────────── */
  const testimonialCards = $$('.testimonial-card');
  const dotsContainer    = $('#tns-dots');
  const prevBtn          = $('#tns-prev');
  const nextBtn          = $('#tns-next');
  let currentSlide       = 0;
  let autoSlideTimer     = null;

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    testimonialCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'tns-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', currentLang === 'es' ? `Testimonio ${i + 1}` : `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlider(index) {
    testimonialCards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    if (dotsContainer) {
      $$('.tns-dot', dotsContainer).forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    currentSlide = index;
  }

  function goToSlide(index) {
    const total = testimonialCards.length;
    updateSlider((index + total) % total);
    resetAutoSlide();
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  if (testimonialCards.length > 0) {
    buildDots();
    updateSlider(0);
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    resetAutoSlide();
  }

  /* ─────────────────────────────────────────────────────
     SCROLL REVEAL  (IntersectionObserver)
  ───────────────────────────────────────────────────── */
  const revealTargets = [
    '.product-card',
    '.service-card',
    '.why-item',
    '.about-content > p',
    '.about-features li',
    '.contact-details li',
    '.section__header',
    '.about-content .section__tag',
    '.about-content .section__title',
  ];

  function addRevealClasses() {
    revealTargets.forEach(sel => {
      $$(sel).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${Math.min(i * 0.08, 0.5)}s`;
      });
    });
  }

  function initRevealObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.reveal').forEach(el => observer.observe(el));
  }

  addRevealClasses();
  initRevealObserver();

  /* ─────────────────────────────────────────────────────
     CONTACT FORM
  ───────────────────────────────────────────────────── */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const nombre  = $('#nombre');
      const email   = $('#email');
      const mensaje = $('#mensaje');

      // Reset errors
      [nombre, email, mensaje].forEach(f => f && f.classList.remove('error'));

      if (!nombre || !nombre.value.trim()) {
        nombre && nombre.classList.add('error');
        valid = false;
      }
      if (!email || !validateEmail(email.value.trim())) {
        email && email.classList.add('error');
        valid = false;
      }
      if (!mensaje || !mensaje.value.trim()) {
        mensaje && mensaje.classList.add('error');
        valid = false;
      }

      if (!valid) return;

      // Simulate send
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const origText = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'es' ? 'Enviando…' : 'Sending…';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
          contactForm.reset();
          if (formSuccess) {
            formSuccess.classList.add('show');
            setTimeout(() => formSuccess.classList.remove('show'), 5000);
          }
        }, 1200);
      }
    });

    // Live validation
    ['nombre', 'email', 'mensaje'].forEach(id => {
      const field = $(`#${id}`);
      if (field) {
        field.addEventListener('input', () => field.classList.remove('error'));
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     SMOOTH SCROLL FOR ANCHOR LINKS
  ───────────────────────────────────────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────────────
     NAV ACTIVE LINK BASED ON SCROLL
  ───────────────────────────────────────────────────── */
  const sections = $$('section[id]');
  const navLinkEls = $$('.nav__link');

  function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = navLinkEls.find(a => a.getAttribute('href') === `#${id}`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < bottom);
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

})();
