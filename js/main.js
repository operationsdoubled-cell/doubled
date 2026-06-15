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
    title:    'Alltree',
    category: 'Tree Services · Web Design',
    image:    'assets/images/alltree.png',
    bg:       'pbg-3',
    contain:  true,
  },
  {
    title:    'Van & Man Removals',
    category: 'Removals · Web Design',
    image:    'assets/images/van-and-man-hero.png',
    bg:       'pbg-1',
    contain:  true,
  },
  {
    title:    'PowerClean',
    category: 'Window Cleaning · Web Design',
    image:    'assets/images/powerclean-hero.png',
    bg:       'pbg-2',
  },
];

/* ─────────────────────────────────────────────
   BUILD PORTFOLIO REEL (CSS auto-scroll + drag)
   ───────────────────────────────────────────── */
(function buildPortfolio() {
  const wrap = document.querySelector('.portfolio-reel-wrap');
  const reel = document.getElementById('portfolio-reel');
  if (!reel || !wrap) return;

  const SPEED = 60; // px per second

  function createItem(item) {
    const el = document.createElement('div');
    el.className = 'reel-item';

    if (item.image) {
      // Blurred atmospheric fill behind contain images — eliminates dark gap
      const bg = item.contain
        ? `<div class="reel-bg" style="background-image:url('${item.image}')"></div>`
        : '';
      el.innerHTML = `
        ${bg}
        <img src="${item.image}" alt="${item.title}" loading="lazy" draggable="false"${item.contain ? ' class="img-contain"' : ''}>
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

  // Build original set + clone for seamless CSS-transform loop
  PORTFOLIO.forEach(item => reel.appendChild(createItem(item)));
  [...reel.children].forEach(el => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    reel.appendChild(clone);
  });

  // Set animation duration from actual rendered width
  requestAnimationFrame(() => {
    const halfWidth  = reel.scrollWidth / 2;
    const duration   = (halfWidth / SPEED).toFixed(1);
    reel.style.animationDuration = `${duration}s`;
  });

  // ── Drag support ──────────────────────────────
  // We freeze the CSS animation, track the drag offset, then resume
  // using a negative animation-delay that matches the paused position.

  let isDragging  = false;
  let dragStartX  = 0;
  let frozenX     = 0; // translateX value when drag began

  function getTranslateX() {
    return new DOMMatrix(getComputedStyle(reel).transform).m41;
  }

  function resumeFrom(x) {
    const halfWidth = reel.scrollWidth / 2;
    const duration  = parseFloat(reel.style.animationDuration);
    // Map x (negative) → position within [0, halfWidth]
    const pos   = ((-x % halfWidth) + halfWidth) % halfWidth;
    const delay = -((pos / halfWidth) * duration);
    reel.style.transform        = '';
    reel.style.animationDelay   = `${delay}s`;
    reel.style.animationPlayState = 'running';
  }

  wrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    frozenX    = getTranslateX();
    reel.style.animationPlayState = 'paused';
    wrap.classList.add('dragging');
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    reel.style.transform = `translateX(${frozenX + (e.clientX - dragStartX)}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('dragging');
    const endX = new DOMMatrix(getComputedStyle(reel).transform).m41;
    resumeFrom(endX);
  });

  // Pause on hover (when not mid-drag)
  wrap.addEventListener('mouseenter', () => {
    if (!isDragging) reel.style.animationPlayState = 'paused';
  });
  wrap.addEventListener('mouseleave', () => {
    if (!isDragging) reel.style.animationPlayState = 'running';
  });
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
   CONTACT FORM — Formspree
   Submissions go to operations.doubled@gmail.com
   Sign up at formspree.io, create a form, and
   replace YOUR_FORM_ID below with your form ID.
   ───────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgkazgq';

(function initForm() {
  const form = document.getElementById('contact-form');
  const btn  = document.getElementById('submit-btn');
  if (!form || !btn) return;

  const setBtn = (text, bg, shadow) => {
    btn.innerHTML        = text;
    btn.style.background = bg    || '';
    btn.style.boxShadow  = shadow || '';
  };

  const resetBtn = () => {
    setTimeout(() => {
      btn.disabled = false;
      setBtn('Send Message <span class="btn-arrow">→</span>');
    }, 5000);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Inline validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255,32,121,0.6)';
        valid = false;
      }
    });
    if (!valid) return;

    btn.disabled = true;
    setBtn('Sending…');

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        setBtn(
          'Sent! We\'ll be in touch ✓',
          'linear-gradient(135deg, #00FF88, #00C8FF)',
          '0 8px 32px rgba(0,255,136,0.22)'
        );
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.error('Form error:', err);
      setBtn(
        'Something went wrong — try again',
        'linear-gradient(135deg, #FF2079, #FF6B00)',
        '0 8px 32px rgba(255,32,121,0.2)'
      );
      btn.disabled = false;
    }

    resetBtn();
  });

  // Clear error highlight as user types
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();

/* ─────────────────────────────────────────────
   DEMO IFRAME SCALER
   Scales each iframe to fill its wrapper at the
   correct ratio, as if viewing at 1440px desktop.
   ───────────────────────────────────────────── */
(function initDemoFrames() {
  const wraps = document.querySelectorAll('.demo-frame-wrap');
  if (!wraps.length) return;

  function scale() {
    wraps.forEach(wrap => {
      const frame = wrap.querySelector('.demo-frame');
      if (!frame) return;
      const s = wrap.offsetWidth / 1440;
      frame.style.transform = `scale(${s})`;
      wrap.style.height     = Math.round(900 * s) + 'px';
    });
  }

  scale();
  window.addEventListener('resize', scale, { passive: true });
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
