/* =========================================================
   Evergreen Cleaning Co. — Demo Site Script
   Organized into small, self-contained modules that each
   run once the DOM is ready.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initWhiteLabel();
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initAccordion();
  initEstimateCalculator();
  initLeadForm();
});

/* =========================================================
   1. DYNAMIC WHITE-LABEL SYSTEM
   Reads ?name=&city=&phone= from the URL and pushes the
   values into every element tagged with the matching
   data-attribute. Falls back to demo defaults when a
   parameter is missing or empty.
   ========================================================= */
function initWhiteLabel() {
  const FALLBACKS = {
    name: 'Evergreen Cleaning Co.',
    city: 'Spokane',
    phone: '(509) 555-1234'
  };

  const params = new URLSearchParams(window.location.search);

  const businessName = cleanParam(params.get('name')) || FALLBACKS.name;
  const city = cleanParam(params.get('city')) || FALLBACKS.city;
  const rawPhone = cleanParam(params.get('phone')) || FALLBACKS.phone;
  const phoneDisplay = formatPhoneDisplay(rawPhone);
  const phoneHref = 'tel:' + formatPhoneForHref(rawPhone);

  // Text content bindings
  setTextForAll('[data-business-name]', businessName);
  setTextForAll('[data-city]', city);
  setTextForAll('[data-phone]', phoneDisplay);

  // tel: href bindings
  document.querySelectorAll('[data-phone-link]').forEach((el) => {
    el.setAttribute('href', phoneHref);
  });

  // Title
  const title = `${businessName} | Professional Cleaning Services in ${city}, WA`;
  document.title = title;

  // Meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      'content',
      `${businessName} offers professional residential and commercial cleaning services in ${city}. Get a fast, no-pressure estimate today.`
    );
  }

  // Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute(
      'content',
      `Reliable residential and commercial cleaning services in ${city} designed around your schedule. Get a fast, no-pressure estimate today.`
    );
  }

  function cleanParam(value) {
    if (!value) return '';
    return value.trim();
  }

  function setTextForAll(selector, value) {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = value;
    });
  }

  function formatPhoneForHref(phone) {
    // Strip everything except digits and a leading +
    return phone.replace(/[^\d+]/g, '');
  }

  function formatPhoneDisplay(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    // If it doesn't look like a standard 10-digit US number,
    // just show whatever was provided.
    return phone;
  }
}

/* =========================================================
   2. STICKY HEADER SCROLL STATE
   Adds a shadow once the page has scrolled past the top.
   ========================================================= */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const toggleScrolled = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

/* =========================================================
   3. MOBILE NAVIGATION MENU
   ========================================================= */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  };

  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu whenever a link inside it is used
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
}

/* =========================================================
   4. SCROLL REVEAL ANIMATIONS
   Uses IntersectionObserver so elements fade/slide in once
   as they enter the viewport. Skips the animation entirely
   when the user prefers reduced motion.
   ========================================================= */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* =========================================================
   5. FAQ ACCORDION
   Only one panel open at a time; fully keyboard accessible
   because it is built from native <button> elements.
   ========================================================= */
function initAccordion() {
  const accordion = document.getElementById('accordion');
  if (!accordion) return;

  const triggers = Array.from(accordion.querySelectorAll('.accordion-trigger'));

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close every panel first
      triggers.forEach((otherTrigger) => {
        otherTrigger.setAttribute('aria-expanded', 'false');
        const otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls'));
        if (otherPanel) otherPanel.setAttribute('hidden', '');
      });

      // Re-open the clicked one if it was previously closed
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.removeAttribute('hidden');
      }
    });
  });
}

/* =========================================================
   6. INSTANT ESTIMATE CALCULATOR
   A transparent, easily-editable pricing model. Adjust the
   values below to change how estimates are calculated.
   ========================================================= */
function initEstimateCalculator() {
  const form = document.getElementById('estimate-form');
  const resultBox = document.getElementById('estimate-result');
  const priceEl = document.getElementById('estimate-price');
  if (!form || !resultBox || !priceEl) return;

  // --- Editable pricing configuration ---------------------
  const BASE_PRICE_BY_TYPE = {
    residential: 120,
    commercial: 150,
    deep: 180,
    movein: 200
  };

  const SIZE_ADDON = {
    '1': 0,
    '2': 30,
    '3': 60,
    '4': 100
  };

  const FREQUENCY_MULTIPLIER = {
    onetime: 1,
    weekly: 0.75,
    biweekly: 0.85,
    monthly: 0.9
  };
  // ---------------------------------------------------------

  function calculateEstimate(cleaningType, propertySize, frequency) {
    const base = BASE_PRICE_BY_TYPE[cleaningType] ?? BASE_PRICE_BY_TYPE.residential;
    const addon = SIZE_ADDON[propertySize] ?? 0;
    const multiplier = FREQUENCY_MULTIPLIER[frequency] ?? 1;
    const total = (base + addon) * multiplier;
    // Round to the nearest $5 for a cleaner "starting price" feel
    return Math.round(total / 5) * 5;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const cleaningType = formData.get('cleaningType');
    const propertySize = formData.get('propertySize');
    const frequency = formData.get('frequency');

    const estimate = calculateEstimate(cleaningType, propertySize, frequency);

    priceEl.textContent = `$${estimate}`;
    resultBox.classList.add('is-visible');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* =========================================================
   7. LEAD CAPTURE FORM
   Prevents the default submission (no backend in this demo),
   validates via native HTML5 constraints, then swaps in a
   success state with the visitor's name inserted.
   ========================================================= */
function initLeadForm() {
  const form = document.getElementById('lead-capture-form');
  const successBox = document.getElementById('form-success');
  const successMessage = document.getElementById('form-success-message');
  const resetBtn = document.getElementById('form-reset-btn');
  if (!form || !successBox || !successMessage) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const firstName = name.split(' ')[0] || 'there';

    successMessage.textContent = `Thanks, ${firstName}. We've received your cleaning request. We'll contact you shortly to discuss your cleaning needs.`;

    form.hidden = true;
    successBox.hidden = false;
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      successBox.hidden = true;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}
