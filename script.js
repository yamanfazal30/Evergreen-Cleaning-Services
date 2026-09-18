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
  initChatbot();
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
    city: 'USA',
    phone: '(509) 555-1234'
  };

  const params = new URLSearchParams(window.location.search);

  const businessName = cleanParam(params.get('name')) || FALLBACKS.name;
  const city = cleanParam(params.get('city')) || FALLBACKS.city;
  const rawPhone = cleanParam(params.get('phone')) || FALLBACKS.phone;
  const phoneDisplay = formatPhoneDisplay(rawPhone);
  const phoneHref = 'tel:' + formatPhoneForHref(rawPhone);

  // Make the resolved values available to other modules (e.g. the chatbot)
  // so every part of the site stays in sync with the ?name=&city=&phone=
  // white-label parameters.
  window.SITE_CONFIG = {
    businessName,
    city,
    phoneDisplay,
    phoneHref
  };

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

/* =========================================================
   8. AI CHAT ASSISTANT
   A self-contained FAQ / knowledge-base assistant. No backend
   or API key required — it matches what the visitor types
   against a set of topics covering pricing, services, the
   booking process, and company info, then replies with a
   relevant, on-brand answer plus quick-action buttons.

   Because it reads window.SITE_CONFIG (set by initWhiteLabel),
   every reply automatically uses the correct business name,
   city, and phone number for whichever white-label version of
   the demo is being viewed.
   ========================================================= */
function initChatbot() {
  const root = document.getElementById('chatbot');
  const launcher = document.getElementById('chatbot-launcher');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesEl = document.getElementById('chatbot-messages');
  const quickRepliesEl = document.getElementById('chatbot-quick-replies');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const badge = document.getElementById('chatbot-badge');
  if (!root || !launcher || !panel || !form || !input || !messagesEl) return;

  const cfg = () =>
    window.SITE_CONFIG || {
      businessName: 'Evergreen Cleaning Co.',
      city: 'your area',
      phoneDisplay: '(509) 555-1234',
      phoneHref: 'tel:5095551234'
    };

  let hasGreeted = false;
  let isTyping = false;

  /* ---------- Knowledge base -------------------------------
     Each topic has keywords used to match the visitor's
     message, plus a reply() function that returns the HTML
     for the bot bubble. reply() is a function (not a plain
     string) so it can pull in the live business name/city/
     phone every time it's used. "actions" are optional quick
     buttons shown under that specific message.
     ----------------------------------------------------------- */
  const topics = [
    {
      id: 'pricing',
      keywords: ['price', 'pricing', 'cost', 'costs', 'how much', 'rate', 'rates', 'quote', 'estimate', 'expensive', 'cheap', 'fee', 'fees', 'charge'],
      reply: () =>
        `<p>Pricing depends on the type of cleaning, your property size, and how often you'd like us to come.</p>
         <p>As a starting point:</p>
         <ul>
           <li>Residential cleaning from <strong>$120</strong></li>
           <li>Commercial/office cleaning from <strong>$150</strong></li>
           <li>Deep cleaning from <strong>$180</strong></li>
           <li>Move-in / move-out from <strong>$200</strong></li>
         </ul>
         <p>Recurring plans (weekly, biweekly, monthly) also get a discount off the one-time rate. Want an exact number for your space?</p>`,
      actions: [{ label: 'Get my instant estimate', action: 'scroll-estimate' }]
    },
    {
      id: 'services',
      keywords: ['service', 'services', 'offer', 'what do you do', 'what do you clean', 'types of cleaning', 'options'],
      reply: () =>
        `<p><span data-business-name>${cfg().businessName}</span> offers four core services:</p>
         <ul>
           <li><strong>Deep House Cleaning</strong> — kitchens, bathrooms, bedrooms &amp; hard-to-reach spots</li>
           <li><strong>Move-In / Move-Out Cleaning</strong> — for empty homes and apartments</li>
           <li><strong>Office Cleaning</strong> — keeping workplaces clean and presentable</li>
           <li><strong>Regular Maintenance</strong> — weekly, biweekly or monthly plans</li>
         </ul>`,
      actions: [{ label: 'See pricing', action: 'ask-pricing' }, { label: 'Get an estimate', action: 'scroll-estimate' }]
    },
    {
      id: 'commercial',
      keywords: ['office', 'commercial', 'business cleaning', 'workplace', 'company cleaning'],
      reply: () =>
        `<p>Yes — we clean offices and commercial spaces. Cleanings can be scheduled around your business hours so they never get in the way of your team, and recurring plans (weekly, biweekly, or monthly) are available.</p>`,
      actions: [{ label: 'Get an estimate', action: 'scroll-estimate' }]
    },
    {
      id: 'movein',
      keywords: ['move in', 'move out', 'moving', 'move-in', 'move-out', 'moveout', 'movein', 'empty home', 'empty apartment'],
      reply: () =>
        `<p>Our Move-In / Move-Out Cleaning is built for empty homes and apartments — every room gets a detailed clean so the space is ready for its next chapter, whether that's handing over keys or settling in.</p>`,
      actions: [{ label: 'Get an estimate', action: 'scroll-estimate' }]
    },
    {
      id: 'recurring',
      keywords: ['recurring', 'weekly', 'biweekly', 'bi-weekly', 'monthly', 'subscription', 'regular', 'every week', 'schedule cleaning', 'ongoing'],
      reply: () =>
        `<p>Yes! Weekly, biweekly, and monthly recurring plans are all available, and each comes with a discount compared to a one-time clean. Most customers pick biweekly for the best balance of price and upkeep.</p>`,
      actions: [{ label: 'Compare recurring pricing', action: 'scroll-estimate' }]
    },
    {
      id: 'supplies',
      keywords: ['supplies', 'equipment', 'products', 'bring your own', 'chemicals', 'eco', 'green clean', 'own vacuum'],
      reply: () =>
        `<p>Professional-grade cleaning equipment and supplies can be provided, so you don't need to have anything ready. If you prefer we use products you already have on hand, just let us know when you book.</p>`
    },
    {
      id: 'trust',
      keywords: ['insured', 'insurance', 'licensed', 'bonded', 'background check', 'trust', 'safe', 'vetted', 'reliable'],
      reply: () =>
        `<p><span data-business-name>${cfg().businessName}</span> is licensed and insured, so you can feel confident having us in your home or business. Reliability and attention to detail are what we're built around.</p>`
    },
    {
      id: 'area',
      keywords: ['area', 'location', 'where', 'near me', 'city', 'zip', 'cover', 'service area'],
      reply: () =>
        `<p>We serve <strong data-city>${cfg().city}</strong> and the surrounding area. If you're nearby and unsure whether you're covered, send your address through the estimate form and we'll confirm.</p>`,
      actions: [{ label: 'Request an estimate', action: 'scroll-lead' }]
    },
    {
      id: 'booking',
      keywords: ['book', 'booking', 'schedule', 'how it works', 'get started', 'sign up', 'how do i', 'process', 'appointment'],
      reply: () =>
        `<p>Getting started only takes three steps:</p>
         <ul>
           <li><strong>1.</strong> Request your estimate (instant, no call needed)</li>
           <li><strong>2.</strong> Choose the service that fits your needs</li>
           <li><strong>3.</strong> We handle the cleaning — you get your time back</li>
         </ul>`,
      actions: [{ label: 'Start my estimate', action: 'scroll-estimate' }]
    },
    {
      id: 'hours',
      keywords: ['hours', 'open', 'available', 'time', 'when can you come', 'today', 'weekend'],
      reply: () =>
        `<p>We're generally able to schedule cleanings Monday through Saturday, with flexible time windows to fit your day. Share your preferred date on the estimate form and we'll confirm availability.</p>`,
      actions: [{ label: 'Request a date', action: 'scroll-lead' }]
    },
    {
      id: 'contact',
      keywords: ['phone', 'call', 'number', 'contact', 'email', 'reach you', 'talk to someone', 'human'],
      reply: () =>
        `<p>You can reach <span data-business-name>${cfg().businessName}</span> directly at <strong>${cfg().phoneDisplay}</strong>, or fill out the quick form and we'll get back to you.</p>`,
      actions: [{ label: `Call ${cfg().phoneDisplay}`, action: 'call' }, { label: 'Fill out the form', action: 'scroll-lead' }]
    },
    {
      id: 'guarantee',
      keywords: ['guarantee', 'satisfaction', 'not happy', 'refund', 'redo', 'complaint', 'quality'],
      reply: () =>
        `<p>Your satisfaction is the priority on every job. If something's not quite right, let us know and we'll make it right.</p>`
    },
    {
      id: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'yo', 'hiya'],
      reply: () =>
        `<p>Hi there 👋 I can help with pricing, our services, booking, or anything else about <span data-business-name>${cfg().businessName}</span>. What would you like to know?</p>`
    },
    {
      id: 'thanks',
      keywords: ['thank', 'thanks', 'appreciate', 'awesome', 'great', 'cool', 'perfect'],
      reply: () => `<p>You're welcome! Anything else I can help with — pricing, scheduling, or service area?</p>`
    },
    {
      id: 'human',
      keywords: ['agent', 'representative', 'real person', 'manager', 'owner'],
      reply: () =>
        `<p>Happy to connect you with the team directly — call <strong>${cfg().phoneDisplay}</strong> or submit the quick form and someone will follow up personally.</p>`,
      actions: [{ label: `Call ${cfg().phoneDisplay}`, action: 'call' }, { label: 'Fill out the form', action: 'scroll-lead' }]
    }
  ];

  const FALLBACK_ACTIONS = [
    { label: 'Pricing', action: 'ask-pricing' },
    { label: 'Our services', action: 'ask-services' },
    { label: 'Get an estimate', action: 'scroll-estimate' },
    { label: 'Talk to someone', action: 'scroll-lead' }
  ];

  const STARTER_CHIPS = [
    { label: '💲 Pricing', text: 'How much does it cost?' },
    { label: '🧽 Services', text: 'What services do you offer?' },
    { label: '📅 Book now', text: 'How do I book a cleaning?' },
    { label: '📍 Service area', text: 'What areas do you serve?' }
  ];

  /* ---------- Rendering helpers ---------------------------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function scrollToClose(selector) {
    const target = document.querySelector(selector);
    closePanel();
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 180);
    }
  }

  function runAction(action) {
    if (action === 'scroll-estimate') return scrollToClose('#estimate');
    if (action === 'scroll-lead') return scrollToClose('#lead-form');
    if (action === 'call') return (window.location.href = cfg().phoneHref);
    if (action === 'ask-pricing') return handleUserMessage('How much does it cost?', true);
    if (action === 'ask-services') return handleUserMessage('What services do you offer?', true);
  }

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-msg chatbot-msg-user';
    bubble.innerHTML = `<p>${escapeHtml(text)}</p>`;
    messagesEl.appendChild(bubble);
    scrollMessagesToBottom();
  }

  function addBotMessage(html, actions) {
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-msg chatbot-msg-bot';
    bubble.innerHTML = html;

    if (actions && actions.length) {
      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'chatbot-msg-actions';
      actions.forEach((a) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chatbot-msg-action';
        btn.textContent = a.label;
        btn.addEventListener('click', () => runAction(a.action));
        actionsWrap.appendChild(btn);
      });
      bubble.appendChild(actionsWrap);
    }

    messagesEl.appendChild(bubble);
    scrollMessagesToBottom();
  }

  function showTyping() {
    if (isTyping) return;
    isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.id = 'chatbot-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollMessagesToBottom();
  }

  function hideTyping() {
    isTyping = false;
    const typing = document.getElementById('chatbot-typing-indicator');
    if (typing) typing.remove();
  }

  function scrollMessagesToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderQuickReplies(chips) {
    quickRepliesEl.innerHTML = '';
    chips.forEach((chip) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatbot-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => handleUserMessage(chip.text, true));
      quickRepliesEl.appendChild(btn);
    });
  }

  /* ---------- Matching engine -------------------------------
     Scores every topic by how many of its keywords appear in
     the visitor's message (normalized), and returns the best
     match above a small threshold. This keeps things fast and
     dependency-free while still feeling conversational across
     lots of different phrasings.
     ----------------------------------------------------------- */
  function findBestTopic(message) {
    const normalized = ' ' + message.toLowerCase().replace(/[^\w\s]/g, ' ') + ' ';
    let best = null;
    let bestScore = 0;

    topics.forEach((topic) => {
      let score = 0;
      topic.keywords.forEach((kw) => {
        if (normalized.includes(' ' + kw.toLowerCase() + ' ') || normalized.includes(kw.toLowerCase())) {
          score += kw.split(' ').length; // reward multi-word / more specific matches
        }
      });
      if (score > bestScore) {
        bestScore = score;
        best = topic;
      }
    });

    return bestScore > 0 ? best : null;
  }

  function handleUserMessage(rawText, fromChip) {
    const text = rawText.trim();
    if (!text) return;

    addUserMessage(text);
    quickRepliesEl.innerHTML = '';
    if (!fromChip) input.value = '';

    showTyping();
    const delay = 420 + Math.min(text.length * 8, 500);

    setTimeout(() => {
      hideTyping();
      const topic = findBestTopic(text);
      if (topic) {
        addBotMessage(topic.reply(), topic.actions);
      } else {
        addBotMessage(
          `<p>I don't have an exact answer for that, but I can help with pricing, our services, booking, service area, or getting you an estimate. You can also reach the team directly at <strong>${cfg().phoneDisplay}</strong>.</p>`,
          FALLBACK_ACTIONS
        );
      }
    }, delay);
  }

  function greetIfNeeded() {
    if (hasGreeted) return;
    hasGreeted = true;
    showTyping();
    setTimeout(() => {
      hideTyping();
      addBotMessage(
        `<p>👋 Hi! I'm the <span data-business-name>${cfg().businessName}</span> assistant. Ask me about pricing, services, booking, or our service area in <span data-city>${cfg().city}</span> — happy to help.</p>`
      );
      renderQuickReplies(STARTER_CHIPS);
    }, 500);
  }

  /* ---------- Open / close ----------------------------------- */
  function openPanel() {
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    badge.classList.add('is-hidden');
    greetIfNeeded();
    setTimeout(() => input.focus(), 250);
  }

  function closePanel() {
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!root.classList.contains('is-open')) panel.hidden = true;
    }, 200);
  }

  launcher.addEventListener('click', () => {
    root.classList.contains('is-open') ? closePanel() : openPanel();
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) {
      closePanel();
      launcher.focus();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleUserMessage(input.value);
  });

  // Gently invite the visitor in after a short delay on their first visit,
  // without being pushy about it.
  setTimeout(() => {
    if (!root.classList.contains('is-open')) {
      badge.classList.remove('is-hidden');
    }
  }, 3000);
}
