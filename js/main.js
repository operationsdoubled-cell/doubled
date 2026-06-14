/* ════════════════════════════════════════════
   DOUBLED — main.js
   ════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   PORTFOLIO CONFIG
   Add your screenshots here. Each entry needs:
     title    — project name shown on hover
     category — type label shown on hover
     image    — path relative to index.html
                e.g. 'assets/portfolio/project-1.jpg'
                Set to null to show a placeholder.
   ───────────────────────────────────────────── */
const PORTFOLIO = [
  {
    title:    'PowerClean',
    category: 'Window Cleaning · Web Design',
    image:    'assets/images/Screenshot 2026-06-14 at 17.34.41.png',
    bg:       'pbg-2',
    featured: true,   // spans 2 columns
  },
  {
    title:    'Van & Man Removals',
    category: 'Removals · Web Design',
    image:    'assets/images/Screenshot 2026-06-14 at 17.33.47.png',
    bg:       'pbg-1',
  },
  {
    title:    'PowerClean — Services',
    category: 'Window Cleaning · Web Design',
    image:    'assets/images/Screenshot 2026-06-14 at 17.35.06.png',
    bg:       'pbg-3',
  },
  {
    title:    'Van & Man — Reviews',
    category: 'Removals · Web Design',
    image:    'assets/images/Screenshot 2026-06-14 at 17.35.41.png',
    bg:       'pbg-4',
  },
  {
    title:    'Your Next Project',
    category: 'Coming Soon',
    image:    null,
    bg:       'pbg-5',
  },
];

/* ─────────────────────────────────────────────
   BUILD PORTFOLIO REEL (infinite horizontal scroll)
   ───────────────────────────────────────────── */
(function buildPortfolio() {
  const reel = document.getElementById('portfolio-reel');
  if (!reel) return;

  const ITEM_W   = 480; // px — must match CSS .reel-item width
  const ITEM_GAP = 20;  // px — must match CSS .reel-item margin-right
  const SPEED    = 80;  // px per second

  function createItem(item) {
    const el = document.createElement('div');
    el.className = 'reel-item';

    if (item.image) {
      el.innerHTML = `
        <img src="${item.image}" alt="${item.title}" loading="lazy" draggable="false">
        <div class="reel-overlay">
          <h3>${item.title}</h3>
          <span>${item.category}</span>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="reel-placeholder ${item.bg}">
          <div class="placeholder-inner">
            <div class="placeholder-plus">+</div>
            <span class="placeholder-label">Coming Soon</span>
          </div>
        </div>
      `;
    }

    return el;
  }

  // Build the original set
  PORTFOLIO.forEach(item => reel.appendChild(createItem(item)));

  // Duplicate every item for a seamless infinite loop.
  // With margin-right on every item, -50% translateX lands exactly
  // at the start of the second set, creating a perfect loop.
  [...reel.children].forEach(el => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    reel.appendChild(clone);
  });

  // Drive speed from item count so adding more items keeps pace consistent
  const oneSetWidth = PORTFOLIO.length * (ITEM_W + ITEM_GAP);
  reel.style.animationDuration = `${(oneSetWidth / SPEED).toFixed(1)}s`;
})();

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
   ───────────────────────────────────────────── */
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  if (!cursor || !cursorDot) return;

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let curX   = mouseX;
  let curY   = mouseY;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth lag follow for the ring
  function tick() {
    curX += (mouseX - curX) * 0.1;
    curY += (mouseY - curY) * 0.1;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  // Expand ring on interactive elements
  const hoverEls = document.querySelectorAll(
    'a, button, .service-card, .reel-item, .pill, input, textarea'
  );

  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity    = '0';
    cursorDot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity    = '1';
    cursorDot.style.opacity = '1';
  });
})();

/* ─────────────────────────────────────────────
   NAVIGATION — glass on scroll + mobile toggle
   ───────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const toggle    = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  if (!nav) return;

  // Frosted glass on scroll
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      const [s1, s2, s3] = toggle.querySelectorAll('span');
      s1.style.transform  = open ? 'translateY(7px) rotate(45deg)' : '';
      s2.style.opacity    = open ? '0' : '1';
      s3.style.transform  = open ? 'translateY(-7px) rotate(-45deg)' : '';
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity   = '1';
        });
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

/* ─────────────────────────────────────────────
   SCROLL REVEAL — IntersectionObserver
   ───────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────
   CONTACT FORM
   ───────────────────────────────────────────── */
(function initForm() {
  const form = document.getElementById('contact-form');
  const btn  = document.getElementById('submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255,32,121,0.6)';
        valid = false;
      }
    });

    if (!valid) return;

    // Success state
    btn.disabled   = true;
    btn.innerHTML  = 'Sent! We\'ll be in touch ✓';
    btn.style.background = 'linear-gradient(135deg, #00FF88, #00C8FF)';
    btn.style.boxShadow  = '0 8px 32px rgba(0,255,136,0.25)';

    setTimeout(() => {
      btn.disabled   = false;
      btn.innerHTML  = 'Send Message <span class="btn-arrow">→</span>';
      btn.style.background = '';
      btn.style.boxShadow  = '';
      form.reset();
    }, 4000);
  });

  // Clear error highlight on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();

/* ─────────────────────────────────────────────
   PARALLAX — subtle hero orb drift on mousemove
   ───────────────────────────────────────────── */
(function initParallax() {
  const orbs = document.querySelectorAll('.hero-orb');
  if (!orbs.length) return;

  const strengths = [0.018, 0.012, 0.022, 0.009];

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    orbs.forEach((orb, i) => {
      const s = strengths[i] || 0.01;
      orb.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    });
  });
})();

/* ─────────────────────────────────────────────
   ACTIVE NAV LINK — highlight current section
   ───────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          const matches = link.getAttribute('href') === `#${id}`;
          link.style.color = matches ? 'var(--text)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();
