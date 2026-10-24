/* ==========================================================================
   BITTS COFFEE INTERACTIVE SCRIPT
   Logic for Menu Filters, Branch Switcher, Interactive Price Calculator,
   Conversion Tracking, Voucher Codes, and Bitts Club Signup
   ========================================================================== */

// Ganti dengan URL Web App hasil deploy apps-script/bitts-club.gs
const CLUB_SHEET_URL = 'https://script.google.com/macros/s/APPS_SCRIPT_DEPLOYMENT_ID/exec';
// Nomor WhatsApp admin Bitts (format 62xxx, tanpa +)
const WA_NUMBER = '6281234567890';
// false = diskon sepeda dan tumbler tidak bisa digabung (maks 10%).
// Kalau Bitts mengizinkan digabung, ubah ke true dan sesuaikan syarat-ketentuan.html.
const PROMO_STACKABLE = false;

document.addEventListener('DOMContentLoaded', () => {

  // --- Conversion Tracking (GA4 + Microsoft Clarity) ---
  // Any element with data-track="event_name" is reported on click.
  // Optional: data-track-label (which button) and data-track-item (which menu).
  const trackEvent = (eventName, params = {}) => {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
    if (typeof clarity === 'function') {
      clarity('event', eventName);
    }
  };

  document.addEventListener('click', (e) => {
    const trackedEl = e.target.closest('[data-track]');
    if (!trackedEl) return;

    const params = {};
    if (trackedEl.dataset.trackLabel) params.label = trackedEl.dataset.trackLabel;
    if (trackedEl.dataset.trackItem) params.item_name = trackedEl.dataset.trackItem;
    trackEvent(trackedEl.dataset.track, params);
  });


  // --- Mobile Menu Toggle ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('active');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // --- Branch Switcher Tab ---
  const tabButtons = document.querySelectorAll('.location-tab-btn');
  const branchContents = document.querySelectorAll('.branch-content');
  const mapIframes = document.querySelectorAll('.map-iframe');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedBranch = btn.getAttribute('data-branch');

      // Update button active states
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update text details panel
      branchContents.forEach(content => {
        if (content.id === `branch-${selectedBranch}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      // Update map active states
      mapIframes.forEach(map => {
        if (map.id === `map-${selectedBranch}`) {
          map.classList.add('active');
        } else {
          map.classList.remove('active');
        }
      });
    });
  });


  // --- Menu Filter Tab ---
  const menuFilterButtons = document.querySelectorAll('.menu-tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  menuFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      // Update active state on tab buttons
      menuFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards
      menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          // Force reflow and add animation
          card.style.animation = 'none';
          card.offsetHeight; /* trigger reflow */
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  // --- Interactive Discount Calculator ---
  const checkBike = document.getElementById('calc-bike');
  const checkTumbler = document.getElementById('calc-tumbler');
  const calcNote = document.getElementById('calc-note');
  const menuPrices = document.querySelectorAll('.menu-item-price');

  function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
  }

  function updatePrices() {
    let discountRate = 0;
    
    if (checkBike && checkBike.checked) {
      discountRate += 0.10; // 10% discount
    }
    if (checkTumbler && checkTumbler.checked) {
      discountRate += 0.10; // Another 10% discount
    }

    menuPrices.forEach(priceSpan => {
      const originalPrice = parseInt(priceSpan.getAttribute('data-original-price'), 10);
      
      if (discountRate > 0) {
        const discountedPrice = Math.round(originalPrice * (1 - discountRate));
        
        priceSpan.innerHTML = `
          <span class="price-old">${formatIDR(originalPrice)}</span>
          <span class="price-current">${formatIDR(discountedPrice)}</span>
        `;
        priceSpan.classList.add('price-discounted');
      } else {
        priceSpan.innerHTML = formatIDR(originalPrice);
        priceSpan.classList.remove('price-discounted');
      }
    });
  }

  if (checkBike && checkTumbler) {
    // Non-stackable promos behave like a choice: ticking one unticks the other
    const onToggle = (changed, other) => {
      if (!PROMO_STACKABLE && changed.checked) other.checked = false;
      updatePrices();
    };
    checkBike.addEventListener('change', () => onToggle(checkBike, checkTumbler));
    checkTumbler.addEventListener('change', () => onToggle(checkTumbler, checkBike));

    if (PROMO_STACKABLE && calcNote) calcNote.hidden = true;
  }


  // --- Add subtle entrance effects on scroll ---
  const revealElements = document.querySelectorAll('.story-card, .menu-card, .testimonial-card, .booking-card, .bean-card, .polaroid-card');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 100; // px before revealing
      
      if (elementTop < windowHeight - elementVisible) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  };

  // Set initial hidden styles for scroll effect
  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  // --- Shared Modal Logic (Delivery & Voucher) ---
  const modals = document.querySelectorAll('.delivery-modal-backdrop');
  let lastFocused = null; // Button that opened the modal, refocused on close

  const openModal = (modal) => {
    lastFocused = document.activeElement;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable scroll under modal
    document.body.classList.add('modal-open'); // Hides the mobile sticky bar
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  };

  const closeModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
    document.body.classList.remove('modal-open');
    if (lastFocused) lastFocused.focus({ preventScroll: true });
  };

  modals.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }

    // Close when clicking backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('active')) closeModal(modal);
      });
    }
  });


  // --- Delivery Platform Modal ---
  const deliveryModal = document.getElementById('delivery-modal');
  const modalItemName = document.getElementById('modal-item-name');
  const openButtons = document.querySelectorAll('.open-delivery-modal');

  if (deliveryModal) {
    const deliveryLinks = deliveryModal.querySelectorAll('.btn-delivery');

    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemName = btn.getAttribute('data-item-name');
        if (modalItemName) {
          modalItemName.textContent = itemName;
        }
        // Tag GoFood/GrabFood clicks with the chosen menu for reporting
        deliveryLinks.forEach(link => link.setAttribute('data-track-item', itemName));
        openModal(deliveryModal);
      });
    });
  }


  // --- Voucher Claim Modal (unique WEB- codes for offline tracking) ---
  // The cashier logs every WEB- code redeemed, so walk-in visits from the
  // website can be counted even without analytics.
  const voucherPromos = {
    bike: {
      prefix: 'BIKE',
      name: 'Bitts Bike (10%)',
      requirement: 'Syarat: datang naik sepeda (jenis apapun) ke Bitts Coffee.'
    },
    tumbler: {
      prefix: 'TUMB',
      name: 'Bitts Tumbler (10%)',
      requirement: 'Syarat: bawa tumbler atau botol minum sendiri dari rumah.'
    }
  };

  const voucherModal = document.getElementById('voucher-modal');
  const voucherCode = document.getElementById('voucher-code');
  const voucherPromoName = document.getElementById('voucher-promo-name');
  const voucherRequirement = document.getElementById('voucher-requirement');
  const voucherWaBtn = document.getElementById('voucher-wa-btn');
  const voucherButtons = document.querySelectorAll('.open-voucher-modal');

  // Same visitor keeps the same code; storage may be blocked (private mode)
  function getVoucherCode(promoKey) {
    const storageKey = `bitts-voucher-${promoKey}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved;
    } catch (err) { /* storage unavailable */ }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid typos at the cashier
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    const code = `WEB-${voucherPromos[promoKey].prefix}-${suffix}`;

    try {
      localStorage.setItem(storageKey, code);
    } catch (err) { /* storage unavailable */ }
    return code;
  }

  if (voucherModal) {
    voucherButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const promoKey = btn.getAttribute('data-promo');
        const promo = voucherPromos[promoKey];
        if (!promo) return;

        const code = getVoucherCode(promoKey);
        voucherCode.textContent = code;
        voucherPromoName.textContent = promo.name;
        voucherRequirement.textContent = promo.requirement;

        const waText = `Halo Bitts Coffee! Saya ingin klaim voucher ${promo.name} dengan kode ${code}. (via website)`;
        voucherWaBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

        openModal(voucherModal);
      });
    });
  }


  // --- Bitts Club Signup (Google Sheets via Apps Script) ---
  const clubForm = document.getElementById('club-form');
  const clubPhone = document.getElementById('club-phone');
  const clubSubmit = document.getElementById('club-submit');
  const clubStatus = document.getElementById('club-status');

  // Accepts 08xx / +628xx / 628xx / 8xx and returns 628xx, or null if invalid
  function normalizePhone(raw) {
    let digits = raw.replace(/[\s\-().]/g, '').replace(/^\+/, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return /^628\d{8,11}$/.test(digits) ? digits : null;
  }

  function setClubStatus(message, type) {
    clubStatus.textContent = message;
    clubStatus.className = `cta-status ${type}`;
  }

  if (clubForm) {
    clubForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const phone = normalizePhone(clubPhone.value);
      if (!phone) {
        setClubStatus('Nomor WhatsApp belum valid. Contoh: 081234567890', 'error');
        clubPhone.focus();
        return;
      }

      const source = new URLSearchParams(window.location.search).get('utm_source') || 'direct';
      clubSubmit.disabled = true;
      clubSubmit.textContent = 'Mengirim...';

      try {
        // no-cors: Apps Script doesn't send CORS headers, so the response is opaque.
        // fetch only rejects on network failure, which is what we report.
        await fetch(CLUB_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams({ phone, source, page: window.location.pathname })
        });
        clubForm.reset();
        setClubStatus('Keren! Kamu sudah jadi anggota Bitts Club. Tunggu kupon rahasia di WhatsApp-mu ya!', 'success');
        trackEvent('join_club', { label: source });
      } catch (err) {
        setClubStatus('Gagal mengirim. Cek koneksi internetmu lalu coba lagi.', 'error');
      } finally {
        clubSubmit.disabled = false;
        clubSubmit.textContent = 'Join Club';
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Run initially to reveal elements in viewport

});
