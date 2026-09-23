// One small module for all motion. No framework, no dependencies.
// Everything degrades to fully visible static content when JS is off or motion is reduced.

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
root.classList.add('motion-ready');

/* ── Reveal on scroll (+ blur words, staggers, checklists, blueprints, wordmark) ── */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement;
      el.classList.add('in');
      io.unobserve(el);
      if (el.matches('[data-count]')) count(el);
      if (el.matches('[data-toolpath]')) toolpath(el);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);
document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((g) =>
  Array.from(g.children).forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i))),
);
document.querySelectorAll<HTMLElement>('.checklist').forEach((g) =>
  Array.from(g.children).forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i))),
);
document
  .querySelectorAll('[data-reveal],[data-stagger],.bw,.checklist,[data-count],.bp,[data-toolpath],.wordmark')
  .forEach((el) => io.observe(el));

/* ── Count-up ── */
function count(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const dur = 1600;
  if (reduce || !Number.isFinite(target)) return;
  const start = performance.now();
  const fmt = (n: number) => (el.dataset.plain ? String(Math.round(n)) : Math.round(n).toLocaleString('en-US'));
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = (el.dataset.prefix || '') + fmt(target * eased) + (el.dataset.suffix || '');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Blueprint path lengths for draw-on ── */
document.querySelectorAll<SVGGeometryElement>('.bp [data-draw]').forEach((p) => {
  try {
    const len = Math.ceil(p.getTotalLength());
    p.style.setProperty('--len', String(len));
  } catch {
    /* non-geometry element */
  }
});

/* ── Laser toolpath: a hot head that traces the part outline, throwing sparks ── */
function toolpath(svg: HTMLElement) {
  if (reduce) return;
  const path = svg.querySelector<SVGPathElement>('.tool-main');
  const head = svg.querySelector<SVGCircleElement>('.head');
  const sparkLayer = svg.querySelector<SVGGElement>('.sparks');
  if (!path || !head || !sparkLayer) return;
  const len = path.getTotalLength();
  const NS = 'http://www.w3.org/2000/svg';
  const sparks: { el: SVGCircleElement; x: number; y: number; vx: number; vy: number; life: number }[] = [];
  for (let i = 0; i < 26; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', '1.3');
    c.setAttribute('class', 'spark');
    c.style.opacity = '0';
    sparkLayer.appendChild(c);
    sparks.push({ el: c, x: 0, y: 0, vx: 0, vy: 0, life: 0 });
  }
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(svg);
  const speed = Number(svg.dataset.speed || 110); // svg units per second
  const delay = 2200;
  let t0 = performance.now() + delay;
  let si = 0;
  head.style.opacity = '0';
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (!visible || now < t0) return;
    head.style.opacity = '1';
    const d = (((now - t0) / 1000) * speed) % len;
    const pt = path.getPointAtLength(d);
    head.setAttribute('cx', pt.x.toFixed(1));
    head.setAttribute('cy', pt.y.toFixed(1));
    // emit 1 spark per frame
    const s = sparks[si++ % sparks.length];
    s.x = pt.x; s.y = pt.y;
    const a = Math.random() * Math.PI * 2;
    const v = 0.6 + Math.random() * 1.8;
    s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v - 0.4; s.life = 1;
    for (const p of sparks) {
      if (p.life <= 0) continue;
      p.life -= 0.035; p.vy += 0.06; p.x += p.vx; p.y += p.vy;
      p.el.setAttribute('cx', p.x.toFixed(1));
      p.el.setAttribute('cy', p.y.toFixed(1));
      p.el.style.opacity = String(Math.max(0, p.life));
    }
  };
  requestAnimationFrame(frame);
}

/* ── Cursor glow on cards + hero spotlight ── */
if (fine && !reduce) {
  document.addEventListener(
    'pointermove',
    (e) => {
      const card = (e.target as HTMLElement).closest?.('.card, .panel') as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    },
    { passive: true },
  );
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((h) => {
    const s = h.querySelector<HTMLElement>('.spotlight');
    const ghost = h.querySelector<HTMLElement>('.ghost');
    if (!s) return;
    h.addEventListener('pointermove', (e) => {
      const r = h.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      s.style.setProperty('--sx', `${fx * 100}%`);
      s.style.setProperty('--sy', `${fy * 100}%`);
      ghost?.style.setProperty('--gx', `${((0.5 - fx) * 36).toFixed(1)}px`);
      ghost?.style.setProperty('--gy', `${((0.5 - fy) * 24).toFixed(1)}px`);
    }, { passive: true });
  });
  /* Magnetic buttons */
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
}

/* ── Spotlight loupe: photo → drawing (adapted from the Nival reveal) ──
   Pointer coordinates are converted to the element's own unscaled space (offsetWidth / rect.width)
   so the loupe stays under the cursor even inside a transformed ancestor. Position and radius ease
   toward their targets; the rAF loop stops as soon as everything settles. */
document.querySelectorAll<HTMLElement>('[data-spot]').forEach((el) => {
  const R = () => Math.max(84, Math.min(180, el.offsetWidth * 0.3));
  let tx = 0, ty = 0, tr = 0, x = 0, y = 0, r = 0, raf = 0, sweep = 0;
  const paint = () => {
    el.style.setProperty('--mx', `${x.toFixed(1)}px`);
    el.style.setProperty('--my', `${y.toFixed(1)}px`);
    el.style.setProperty('--r', `${r.toFixed(1)}px`);
    el.style.setProperty('--ro', Math.min(1, r / R()).toFixed(3));
  };
  const tick = () => {
    const k = reduce ? 1 : 0.14;
    x += (tx - x) * k; y += (ty - y) * k; r += (tr - r) * (reduce ? 1 : 0.16);
    paint();
    raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > 0.3 ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const local = (e: PointerEvent) => {
    const b = el.getBoundingClientRect();
    return [(e.clientX - b.left) * (el.offsetWidth / b.width), (e.clientY - b.top) * (el.offsetHeight / b.height)];
  };
  el.addEventListener('pointermove', (e) => {
    if (sweep) { cancelAnimationFrame(sweep); sweep = 0; }
    [tx, ty] = local(e);
    if (r < 2) { x = tx; y = ty; } // appear where the pointer is, don't fly in
    tr = R();
    el.classList.add('used');
    kick();
  });
  el.addEventListener('pointerleave', () => { tr = 0; kick(); });
  // One teaser pass so the mechanic is discoverable (and visible on touch screens).
  if (!reduce) {
    const tio = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      tio.disconnect();
      setTimeout(() => {
        if (el.classList.contains('used')) return;
        const w = el.offsetWidth, h = el.offsetHeight, t0 = performance.now(), D = 2600;
        x = tx = w * 0.12; y = ty = h * 0.62; tr = R();
        const run = (now: number) => {
          const p = Math.min(1, (now - t0) / D);
          tx = w * (0.12 + 0.76 * p); ty = h * (0.62 - 0.26 * Math.sin(p * Math.PI));
          if (p > 0.82) tr = 0;
          kick();
          sweep = p < 1 ? requestAnimationFrame(run) : 0;
        };
        sweep = requestAnimationFrame(run);
      }, 1500);
    }, { threshold: 0.6 });
    tio.observe(el);
  }
});

/* ── Part scene: overview → entering → detail → returning → overview (adapted from VEYRA) ──
   Hover/focus isolates a part; click zooms the drawing plane toward it and opens its detail panel.
   Clicks are ignored while a transition runs. Back, Escape and focus return are handled. */
document.querySelectorAll<HTMLElement>('[data-scene]').forEach((scene) => {
  const plane = scene.querySelector<HTMLElement>('.scene-plane')!;
  const hots = Array.from(scene.querySelectorAll<HTMLButtonElement>('.hot'));
  const parts = Array.from(scene.querySelectorAll<SVGGElement>('.part'));
  const details = Array.from(scene.querySelectorAll<HTMLElement>('.sd'));
  const status = scene.querySelector<HTMLElement>('.scene-status');
  const INTERNAL = new Set(['busbar', 'coldplate', 'heatsink', 'pcba', 'harness']);
  const name = (id: string) => hots.find((h) => h.dataset.hot === id)?.querySelector('.lbl b')?.textContent || id;
  const T_IN = reduce ? 0 : 700, T_OUT = reduce ? 0 : 620;
  let state = 'overview', current = '', leaveTimer = 0, busy = false;
  const setState = (s: string) => { state = s; scene.dataset.state = s; };
  const say = (t: string) => { if (status) status.textContent = t; };
  const highlight = (id: string) => {
    if (id) scene.dataset.active = id; else delete scene.dataset.active;
    if (id && INTERNAL.has(id)) scene.dataset.open = ''; else delete scene.dataset.open;
    parts.forEach((p) => p.classList.toggle('on', p.dataset.part === id));
    hots.forEach((h) => h.classList.toggle('on', h.dataset.hot === id));
  };
  const zoomTo = (id: string) => {
    const h = hots.find((x) => x.dataset.hot === id);
    if (!h) return;
    const cx = parseFloat(h.style.left) / 100, cy = parseFloat(h.style.top) / 100;
    const wide = innerWidth >= 1000, s = wide ? 1.7 : 1.45;
    const tx = (wide ? 0.3 : 0.5) - s * cx, ty = 0.5 - s * cy; // origin 0 0: p' = s·p + t
    plane.style.transformOrigin = '0 0';
    plane.style.transform = `translate(${(tx * 100).toFixed(2)}%, ${(ty * 100).toFixed(2)}%) scale(${s})`;
  };
  const showDetail = (id: string) => details.forEach((d) => (d.hidden = d.dataset.detail !== id));
  const open = (id: string) => {
    if (busy || (state !== 'overview' && state !== 'detail')) return;
    busy = true;
    const fromOverview = state === 'overview';
    current = id;
    clearTimeout(leaveTimer);
    highlight(id);
    showDetail(id);
    zoomTo(id);
    if (fromOverview) setState('entering');
    say(`Showing ${name(id)}. Press Escape to return to the full drawing.`);
    setTimeout(() => {
      setState('detail');
      busy = false;
      const h3 = scene.querySelector<HTMLElement>(`.sd[data-detail="${id}"] h3`);
      h3?.focus({ preventScroll: innerWidth >= 1000 });
    }, T_IN);
  };
  const close = () => {
    if (busy || state !== 'detail') return;
    busy = true;
    setState('returning');
    plane.style.transform = '';
    const back = current;
    setTimeout(() => {
      setState('overview');
      highlight('');
      showDetail('');
      busy = false;
      hots.find((h) => h.dataset.hot === back)?.focus({ preventScroll: true });
      say('Select a part to begin.');
    }, T_OUT);
  };
  const hoverOn = (id: string) => { if (state !== 'overview') return; clearTimeout(leaveTimer); highlight(id); };
  const hoverOff = () => { if (state !== 'overview') return; leaveTimer = window.setTimeout(() => highlight(''), 90); };
  hots.forEach((h) => {
    const id = h.dataset.hot!;
    h.addEventListener('pointerenter', () => hoverOn(id));
    h.addEventListener('focus', () => hoverOn(id));
    h.addEventListener('pointerleave', hoverOff);
    h.addEventListener('blur', hoverOff);
    h.addEventListener('click', () => open(id));
  });
  parts.forEach((p) => {
    const id = p.dataset.part!;
    p.addEventListener('pointerenter', () => hoverOn(id));
    p.addEventListener('pointerleave', hoverOff);
    p.addEventListener('click', () => open(id));
  });
  scene.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((b) => b.addEventListener('click', close));
  scene.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((b) => b.addEventListener('click', () => open(b.dataset.next!)));
  scene.querySelectorAll<HTMLButtonElement>('.sd-row').forEach((b) =>
    b.addEventListener('click', () => {
      const openNow = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(openNow));
      const p = document.getElementById(b.getAttribute('aria-controls')!);
      if (p) p.hidden = !openNow;
    }),
  );
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'detail') close(); });
  addEventListener('resize', () => { if (state === 'detail') zoomTo(current); }, { passive: true });
});

/* ── Nav: glass on scroll + mobile menu ── */
const nav = document.querySelector<HTMLElement>('.nav');
const onScroll = () => nav?.classList.toggle('scrolled', scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });
document.querySelector('.menu-btn')?.addEventListener('click', (e) => {
  const open = nav?.classList.toggle('open');
  (e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(!!open));
});

/* ── Horizontal scroll section (desktop, motion allowed) ── */
const hs = document.querySelector<HTMLElement>('.hs');
if (hs) {
  const track = hs.querySelector<HTMLElement>('.hs-track')!;
  const bar = hs.querySelector<HTMLElement>('.hs-progress');
  const enable = () => !reduce && innerWidth > 900;
  const size = () => {
    if (!enable()) {
      root.classList.add('no-hs');
      hs.style.height = '';
      return;
    }
    root.classList.remove('no-hs');
    const extra = track.scrollWidth - innerWidth;
    hs.style.height = `${innerHeight + Math.max(0, extra)}px`;
  };
  const move = () => {
    if (!enable()) return;
    const r = hs.getBoundingClientRect();
    const total = hs.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    const extra = track.scrollWidth - innerWidth;
    track.style.transform = `translate3d(${-p * Math.max(0, extra)}px,0,0)`;
    bar?.style.setProperty('--hp', p.toFixed(3));
  };
  size();
  move();
  addEventListener('resize', () => { size(); move(); });
  addEventListener('scroll', move, { passive: true });
}

/* ── Steps: progress line fills as you scroll through ── */
document.querySelectorAll<HTMLElement>('.steps-list').forEach((list) => {
  const items = Array.from(list.children) as HTMLElement[];
  const upd = () => {
    const r = list.getBoundingClientRect();
    const mid = innerHeight * 0.55;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    list.style.setProperty('--sp', p.toFixed(3));
    items.forEach((li) => li.classList.toggle('lit', li.getBoundingClientRect().top < mid));
  };
  upd();
  addEventListener('scroll', upd, { passive: true });
});

/* ── Process finder: fab vs short run vs progressive (published thresholds) ── */
document.querySelectorAll<HTMLElement>('[data-finder]').forEach((f) => {
  const range = f.querySelector<HTMLInputElement>('input[type=range]')!;
  const out = f.querySelector<HTMLOutputElement>('output')!;
  const lanes = f.querySelectorAll<HTMLElement>('.lane');
  const segBtns = f.querySelectorAll<HTMLButtonElement>('.seg button');
  let big = false;
  // slider 0..100 → 100 .. 1,000,000 pcs/yr (log scale)
  const vol = (v: number) => Math.round(Math.pow(10, 2 + (v / 100) * 4) / 50) * 50 || 100;
  const pick = (n: number) => (big || n < 2500 ? 'fab' : n <= 100000 ? 'short' : 'prog');
  const render = () => {
    const n = vol(Number(range.value));
    out.textContent = n.toLocaleString('en-US');
    range.style.setProperty('--p', `${range.value}%`);
    const k = pick(n);
    lanes.forEach((l) => l.classList.toggle('on', l.dataset.lane === k));
  };
  range.addEventListener('input', render);
  segBtns.forEach((b) =>
    b.addEventListener('click', () => {
      big = b.dataset.big === 'true';
      segBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render();
    }),
  );
  render();
});

/* ── Story video: click to play with sound ── */
document.querySelectorAll<HTMLElement>('.vid').forEach((w) => {
  const v = w.querySelector('video')!;
  w.querySelector('.play')?.addEventListener('click', () => {
    v.controls = true;
    v.play();
    w.classList.add('playing');
  });
});

/* ── RFQ form: drag & drop list + stubbed submit (prototype never posts anywhere) ── */
document.querySelectorAll<HTMLFormElement>('form[data-rfq]').forEach((form) => {
  const drop = form.querySelector<HTMLElement>('.drop');
  const input = drop?.querySelector<HTMLInputElement>('input[type=file]');
  const list = form.querySelector<HTMLElement>('.files');
  const showFiles = () => {
    if (!input || !list) return;
    list.innerHTML = '';
    Array.from(input.files || []).forEach((f) => {
      const li = document.createElement('li');
      li.textContent = `✓ ${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB`;
      list.appendChild(li);
    });
  };
  input?.addEventListener('change', showFiles);
  ['dragenter', 'dragover'].forEach((ev) => drop?.addEventListener(ev, () => drop.classList.add('over')));
  ['dragleave', 'drop'].forEach((ev) => drop?.addEventListener(ev, () => drop.classList.remove('over')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.classList.add('sent');
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });
});

/* ── Mono scramble on data-scramble labels ── */
if (!reduce) {
  const glyphs = '01<>/[]#=+-*';
  const sio = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      sio.unobserve(el);
      const final = el.textContent || '';
      let f = 0;
      const tick = () => {
        f++;
        el.textContent = final
          .split('')
          .map((ch, i) => (ch === ' ' || i < f / 1.6 ? ch : glyphs[(Math.random() * glyphs.length) | 0]))
          .join('');
        if (f / 1.6 < final.length) requestAnimationFrame(tick);
        else el.textContent = final;
      };
      tick();
    });
  });
  document.querySelectorAll('[data-scramble]').forEach((el) => sio.observe(el));
}
