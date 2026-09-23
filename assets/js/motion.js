/* ==========================================================================
   Motion system: smooth scroll, reveals, split text, parallax, counters,
   magnetic buttons, tilt cards, custom cursor, marquee, pinned story.
   Degrades gracefully: everything works without GSAP/Lenis, and respects
   prefers-reduced-motion.
   ========================================================================== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches && innerWidth > 900;
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* Smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    window.lenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // anchor links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href') === '#') return;
      const t = document.querySelector(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -90, duration: 1.4 });
    });
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('is-revealed');
      if (el.hasAttribute('data-count')) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            const o = document.createElement('span'); o.className = 'w'; const i = document.createElement('span'); i.textContent = w; o.appendChild(i); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, i) => s.parentElement.style.setProperty('--i', i));
  }

  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const dur = 1800, t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = pre + (end * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; if (p < 1) requestAnimationFrame(tick); };
    if (reduce) { el.textContent = pre + end.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; return; }
    requestAnimationFrame(tick);
  }

  function refresh(scope) {
    $$('[data-reveal], [data-split], [data-count]', scope || document).forEach((el) => {
      if (el.hasAttribute('data-split')) splitWords(el);
      if (el.closest('[data-reveal-stagger]')) { const kids = Array.from(el.parentElement.children); el.style.transitionDelay = (kids.indexOf(el) * 90) + 'ms'; }
      if (reduce) { el.classList.add('is-revealed'); if (el.hasAttribute('data-count')) countUp(el); return; }
      io.observe(el);
    });
    $$('[data-reveal-stagger]', scope || document).forEach((p) => Array.from(p.children).forEach((c, i) => { if (!c.hasAttribute('data-reveal')) { c.setAttribute('data-reveal', ''); c.style.transitionDelay = i * 90 + 'ms'; io.observe(c); } }));
    initTilt(scope); initMagnetic(scope);
  }

  /* Parallax */
  const par = $$('[data-parallax]');
  function parallax() {
    par.forEach((el) => {
      const f = parseFloat(el.dataset.parallax) || 0.2;
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-c * f).toFixed(1)}px, 0)`;
    });
  }
  if (par.length && !reduce) { const loop = () => { parallax(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  /* Magnetic buttons */
  function initMagnetic(scope) {
    if (!fine || reduce) return;
    $$('.magnetic', scope || document).forEach((el) => {
      if (el.dataset.mag) return; el.dataset.mag = '1';
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; el.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`; });
      el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)'; el.style.transform = ''; setTimeout(() => (el.style.transition = ''), 600); });
    });
  }

  /* Tilt cards + spotlight */
  function initTilt(scope) {
    $$('.tilt, .card', scope || document).forEach((el) => {
      if (el.dataset.tilt) return; el.dataset.tilt = '1';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
        if (el.classList.contains('tilt') && fine && !reduce) el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => { if (el.classList.contains('tilt')) el.style.transform = ''; });
    });
  }

  /* Custom cursor */
  function initCursor() {
    if (!fine || reduce) return;
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    document.body.append(dot, ring); document.body.classList.add('has-cursor');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, visible = false;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = 1; } });
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = 0; visible = false; });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-cursor]'); const l = e.target.closest('a, button, [role=button], input, textarea, label, .chip');
      ring.classList.toggle('is-text', !!t); ring.textContent = t ? t.dataset.cursor : ''; ring.classList.toggle('is-hover', !!l && !t);
    });
    const loop = () => { rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18); dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`; ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
    loop();
  }

  /* Marquee */
  function initMarquee() {
    $$('.marquee__track').forEach((track) => {
      track.innerHTML += track.innerHTML;
      if (reduce) return;
      let x = 0, speed = parseFloat(track.dataset.speed) || 0.6, paused = false;
      track.parentElement.addEventListener('mouseenter', () => (paused = true));
      track.parentElement.addEventListener('mouseleave', () => (paused = false));
      const loop = () => { if (!paused) { x -= speed; const half = track.scrollWidth / 2; if (-x >= half) x = 0; track.style.transform = `translate3d(${x}px,0,0)`; } requestAnimationFrame(loop); };
      loop();
    });
  }

  /* Pinned story (pillars) */
  function initStory() {
    const story = document.querySelector('.story'); if (!story) return;
    const steps = $$('.story__step', story), layers = $$('.story__visual .layer', story);
    const activate = (i) => { steps.forEach((s, j) => s.classList.toggle('is-active', i === j)); layers.forEach((l, j) => l.classList.toggle('is-active', i === j)); };
    activate(0);
    const sio = new IntersectionObserver((en) => { en.forEach((e) => { if (e.isIntersecting) activate(steps.indexOf(e.target)); }); }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
  }

  /* Hero floating card follows the pointer gently */
  function initFloat() {
    if (!fine || reduce) return;
    $$('[data-float]').forEach((el) => {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      window.addEventListener('mousemove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 18; ty = (e.clientY / innerHeight - 0.5) * 18; });
      const loop = () => { cx = lerp(cx, tx, 0.05); cy = lerp(cy, ty, 0.05); el.style.transform = `perspective(1200px) rotateY(${cx * 0.4}deg) rotateX(${-cy * 0.4}deg) translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
      loop();
    });
  }

  /* GSAP-only flourishes */
  function initGsap() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$('[data-scrub-scale]').forEach((el) => gsap.fromTo(el, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('[data-draw]').forEach((svg) => { $$('path', svg).forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); gsap.to(p, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: svg, start: 'top 85%', end: 'bottom 40%', scrub: 1 } }); }); });
    $$('.hero__inner').forEach((el) => gsap.to(el, { y: 120, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: el.closest('.hero'), start: 'top top', end: 'bottom top', scrub: true } }));
  }

  window.Motion = { refresh, countUp, splitWords, typeInto: null };
  refresh(); initCursor(); initMarquee(); initStory(); initFloat(); initGsap();
})();
