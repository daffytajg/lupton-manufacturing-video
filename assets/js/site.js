/* ==========================================================================
   Site shell: navigation, footer, command palette, page transitions,
   per-page behaviours (insights filtering, article tools, contact form...).
   ========================================================================== */
(function () {
  const K = window.TWM;
  const I = K.icons;
  const ROOT = document.body.dataset.root || '';
  const PAGE = document.body.dataset.page || '';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const h = (s) => s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const url = (p) => (/^(https?:|mailto:|tel:|#)/.test(p) ? p : ROOT + p);
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  window.TWM.util = { $, $$, h, url, fmtDate };

  /* ---------------------------------------------------------------- nav */
  function renderNav() {
    const mount = $('#site-nav');
    if (!mount) return;
    const active = (p) => (PAGE === p ? ' is-active' : '');
    mount.outerHTML = `
      <header class="nav" id="nav">
        <div class="nav__inner">
          <a class="brand" href="${url('index.html')}" aria-label="Trident Wealth Management Group home">
            <span class="brand__icon">${I.trident}</span>
            <span class="brand__text"><span class="brand__name">TRIDENT</span><span class="brand__sub">Wealth Management Group</span></span>
          </a>
          <nav aria-label="Primary">
            <ul class="nav__links">
              <li><a class="nav__link${active('home')}" href="${url('index.html')}">Home</a></li>
              <li>
                <a class="nav__link${active('strength') || active('skill') || active('value')}" href="${url('strength.html')}" aria-haspopup="true">About ${I.chevron}</a>
                <div class="nav__menu" role="menu">
                  ${K.pillars.map((p) => `<a href="${url(p.href)}" role="menuitem"><span class="ico">${I[p.icon]}</span><span><strong>${p.word}</strong><span>${h(p.tagline)}</span></span></a>`).join('')}
                </div>
              </li>
              <li><a class="nav__link${active('insights')}" href="${url('insights.html')}">Insights</a></li>
              <li><a class="nav__link${active('lab')}" href="${url('planning-lab.html')}">Planning Lab <span class="badge badge--aqua" style="padding:2px 6px;font-size:.58rem">AI</span></a></li>
              <li><a class="nav__link${active('login')}" href="${url('client-login.html')}">Client Login</a></li>
            </ul>
          </nav>
          <div class="nav__cta">
            <button class="nav__search" type="button" aria-label="Search the site (Ctrl+K)" data-open-palette>${I.search}</button>
            <a class="btn btn--gold btn--sm magnetic" href="${url('contact.html')}">Contact Us</a>
            <button class="nav__burger" type="button" aria-label="Open menu" aria-expanded="false" data-burger><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <a class="big" href="${url('index.html')}" style="transition-delay:.1s">Home</a>
        <a class="big" href="${url('strength.html')}" style="transition-delay:.16s"><em>Strength</em> · Team</a>
        <a class="big" href="${url('skill.html')}" style="transition-delay:.22s"><em>Skill</em> · Services</a>
        <a class="big" href="${url('value.html')}" style="transition-delay:.28s"><em>Value</em> · Approach</a>
        <a class="big" href="${url('insights.html')}" style="transition-delay:.34s">Insights</a>
        <a class="big" href="${url('planning-lab.html')}" style="transition-delay:.4s">Planning Lab</a>
        <a class="big" href="${url('contact.html')}" style="transition-delay:.46s">Contact</a>
        <div class="sub"><a href="${url('client-login.html')}">Client Login</a><a href="${K.firm.phoneHref}">${K.firm.phone}</a><a href="${K.firm.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a href="${url('disclosures.html')}">Disclosures</a></div>
      </div>
      <div class="progress" id="progress" aria-hidden="true"></div>`;

    const nav = $('#nav');
    let lastY = window.scrollY, ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('nav--scrolled', y > 40);
      if (!document.body.classList.contains('nav-open')) nav.classList.toggle('nav--hidden', y > lastY && y > 400 && Math.abs(y - lastY) > 4);
      lastY = y;
      const prog = $('#progress');
      if (prog) { const max = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();

    const burger = $('[data-burger]');
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(open));
      $('#mobile-menu').setAttribute('aria-hidden', String(!open));
      if (window.lenis) open ? window.lenis.stop() : window.lenis.start();
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ------------------------------------------------------------- footer */
  function renderFooter() {
    const mount = $('#site-footer');
    if (!mount) return;
    const latest = K.articles.slice(0, 3);
    mount.outerHTML = `
      <footer class="footer">
        <span class="footer__watermark">${I.trident}</span>
        <div class="container">
          <div class="footer__grid">
            <div class="footer__brand">
              <a class="brand" href="${url('index.html')}"><span class="brand__icon">${I.trident}</span><span class="brand__text"><span class="brand__name">TRIDENT</span><span class="brand__sub">Wealth Management Group</span></span></a>
              <p class="mt-3">${K.firm.address}<br>${K.firm.city}<br><a href="${K.firm.phoneHref}">${K.firm.phone}</a></p>
              <div class="flex mt-2"><a class="chip" href="${K.firm.linkedin}" target="_blank" rel="noopener">${I.linkedin} LinkedIn</a><a class="chip" href="${K.firm.brokercheck}" target="_blank" rel="noopener">${I.shield} BrokerCheck</a></div>
            </div>
            <div><h4>About Us</h4><ul>${K.pages.slice(0, 4).map((p) => `<li><a href="${url(p.href)}">${h(p.title)}</a></li>`).join('')}<li><a href="${url('contact.html')}">Contact</a></li></ul></div>
            <div><h4>Latest Resources</h4><ul>${latest.map((a) => `<li><a href="${url('insights/' + a.slug + '.html')}">${h(a.title)}</a></li>`).join('')}<li><a href="${url('insights.html')}">All insights →</a></li></ul></div>
            <div><h4>Tools & Access</h4><ul><li><a href="${url('planning-lab.html')}">Planning Lab</a></li><li><a href="${url('client-login.html')}">Client Login</a></li><li><a href="#" data-open-assistant>Ask Navigator</a></li><li><a href="${url('disclosures.html')}">Site Disclosures</a></li><li><a href="${K.firm.andpartnersDisclosures}" target="_blank" rel="noopener">Legal Disclosures (&amp;Partners)</a></li></ul></div>
          </div>
          <div class="footer__legal">${K.firm.legal.map((p) => `<p>${h(p).replace('&amp;Partners', '&amp;Partners')}</p>`).join('')}<p>${h(K.firm.forbes)}</p></div>
          <div class="footer__bottom"><span>© <span id="year"></span> ${K.firm.name}. All Rights Reserved.</span><span>Redesign concept · Navigator AI assistant is informational only and does not provide personalized advice.</span></div>
        </div>
      </footer>`;
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------- page transitions */
  function initTransitions() {
    const curtain = document.createElement('div');
    curtain.className = 'curtain'; curtain.setAttribute('aria-hidden', 'true'); curtain.innerHTML = I.trident;
    document.body.appendChild(curtain);
    document.body.classList.add('page-enter');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/.test(href) || a.hasAttribute('data-open-assistant')) return;
      const dest = new URL(a.href, location.href);
      if (dest.origin !== location.origin || (dest.pathname === location.pathname && dest.hash)) return;
      e.preventDefault();
      curtain.classList.remove('is-out'); curtain.classList.add('is-in');
      setTimeout(() => { location.href = dest.href; }, 650);
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) { curtain.classList.remove('is-in'); } });
  }

  /* ------------------------------------------------------ command palette */
  function initPalette() {
    const box = document.createElement('div');
    box.className = 'palette'; box.id = 'palette'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Site search');
    box.innerHTML = `<div class="palette__box"><div class="palette__input">${I.search}<input type="text" placeholder="Search pages, people, insights, tools… or ask Navigator" autocomplete="off" aria-label="Search"><kbd>esc</kbd></div><div class="palette__list" id="palette-list"></div></div>`;
    document.body.appendChild(box);
    const input = $('input', box), list = $('#palette-list');
    const items = [
      ...K.pages.map((p) => ({ ...p, href: url(p.href) })),
      ...K.team.map((t) => ({ title: t.name, desc: t.title, href: url('strength.html#' + t.slug), icon: 'user', kind: 'Advisor' })),
      ...K.articles.map((a) => ({ title: a.title, desc: a.category + ' · ' + fmtDate(a.date), href: url('insights/' + a.slug + '.html'), icon: 'doc', kind: 'Insight' })),
      { title: 'Retirement Readiness Score', desc: 'A 2-minute pulse check', href: url('planning-lab.html#readiness'), icon: 'flask', kind: 'Tool' },
      { title: 'Scenario Lab · Monte Carlo', desc: 'Model a retirement plan across 1,000 market paths', href: url('planning-lab.html#scenario'), icon: 'chart', kind: 'Tool' },
      { title: 'Social Security Timing', desc: 'Compare claiming at 62, 67 or 70', href: url('planning-lab.html#social-security'), icon: 'calendar', kind: 'Tool' },
      { title: 'Call the office', desc: K.firm.phone, href: K.firm.phoneHref, icon: 'phone', kind: 'Action' },
      { title: 'Ask Navigator', desc: 'Open the AI concierge', action: 'assistant', icon: 'spark', kind: 'Action' }
    ];
    let idx = 0, results = [];
    const render = (q) => {
      const s = q.trim().toLowerCase();
      results = s ? items.filter((it) => (it.title + ' ' + it.desc + ' ' + it.kind).toLowerCase().includes(s)) : items.slice(0, 12);
      if (!results.length) { list.innerHTML = `<div class="palette__empty">No matches. <a href="#" data-ask="${h(q)}" style="color:var(--navy-700);font-weight:600">Ask Navigator “${h(q)}” →</a></div>`; return; }
      let html = '', lastKind = '';
      results.forEach((it, i) => {
        if (it.kind !== lastKind) { html += `<div class="palette__group">${it.kind}s</div>`; lastKind = it.kind; }
        html += `<div class="palette__item${i === idx ? ' is-active' : ''}" data-i="${i}"><span class="ico">${I[it.icon] || I.doc}</span><span><strong>${h(it.title)}</strong><span>${h(it.desc || '')}</span></span><span class="kind">${it.kind}</span></div>`;
      });
      list.innerHTML = html;
    };
    const go = (it) => {
      close();
      if (it.action === 'assistant') { window.Navigator && window.Navigator.open(); return; }
      location.href = it.href;
    };
    const open = () => { box.classList.add('is-open'); idx = 0; input.value = ''; render(''); input.focus({ preventScroll: true }); setTimeout(() => input.focus({ preventScroll: true }), 120); if (window.lenis) window.lenis.stop(); };
    const close = () => { box.classList.remove('is-open'); if (window.lenis) window.lenis.start(); };
    window.TWM.palette = { open, close };
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); box.classList.contains('is-open') ? close() : open(); }
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
    input.addEventListener('input', () => { idx = 0; render(input.value); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(results.length - 1, idx + 1); render(input.value); }
      if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); render(input.value); }
      if (e.key === 'Enter') { e.preventDefault(); if (results[idx]) go(results[idx]); else if (input.value.trim()) { close(); window.Navigator && window.Navigator.open(input.value.trim()); } }
    });
    list.addEventListener('click', (e) => {
      const ask = e.target.closest('[data-ask]');
      if (ask) { e.preventDefault(); close(); window.Navigator && window.Navigator.open(ask.dataset.ask); return; }
      const it = e.target.closest('.palette__item'); if (it) go(results[+it.dataset.i]);
    });
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open-palette]')) { e.preventDefault(); open(); } });
  }

  /* ------------------------------------------------------- home behaviours */
  function initConsole() {
    const feed = $('#console-feed');
    if (!feed) return;
    const items = [
      { icon: 'doc', txt: 'Reading the latest insight', sub: 'The Retirement Expenses Nobody Warns You About', st: 'Done', done: true },
      { icon: 'chart', txt: 'Scenario Lab ready', sub: '1,000-path retirement simulation, in your browser', st: 'Ready' },
      { icon: 'calendar', txt: 'Introduction requests', sub: 'Collects your details and routes them to the team', st: 'Live' },
      { icon: 'shield', txt: 'Fraud awareness brief', sub: 'How to spot and stop today’s scams', st: 'Done', done: true },
      { icon: 'user', txt: 'Advisor match', sub: 'Which advisor fits your situation', st: 'Ready' }
    ];
    let i = 0;
    const push = () => {
      const it = items[i % items.length]; i++;
      const el = document.createElement('div');
      el.className = 'console__item';
      el.innerHTML = `<span class="ico">${I[it.icon]}</span><span class="txt">${h(it.txt)}<span>${h(it.sub)}</span></span><span class="st${it.done ? ' done' : ''}">${it.st}</span>`;
      feed.prepend(el);
      requestAnimationFrame(() => el.classList.add('is-in'));
      while (feed.children.length > 4) feed.lastElementChild.remove();
    };
    push(); setTimeout(push, 700); setTimeout(push, 1400);
    setInterval(push, 3800);
  }

  function initPersona() {
    const wrap = $('#persona');
    if (!wrap) return;
    const data = {
      retire: { title: 'You can see retirement from here.', lead: 'The paychecks will stop; the plan can’t. We specialize in turning a lifetime of savings into a reliable, tax-aware income that keeps pace with inflation — and in holding steady when markets don’t.', items: ['Retirement income strategy built by an RICP® advisor', 'Hedged or buffered portfolios to soften volatility', 'Social Security and withdrawal sequencing', 'A flexible budget for the expenses nobody warns you about'] },
      family: { title: 'Wealth that outlasts you — on purpose.', lead: 'Multi-generational families need more than a portfolio. We help decide when to give, how to teach the next generation and how to keep digital and physical assets protected.', items: ['Lifetime gifting versus traditional inheritance', 'Custodial and education accounts for children and grandchildren', 'Digital asset and estate coordination with your attorney', 'One relationship across generations'] },
      owner: { title: 'Your business is the plan. Let’s build the rest.', lead: 'Business owners carry concentrated risk and complex taxes. We bring decades of experience with owners, plus tax alpha strategies for non-qualified assets.', items: ['Comprehensive planning for individuals, families and owners', 'Tax-loss harvesting and disciplined buy/sell strategies', 'Risk management for concentrated positions', 'Retirement and estate planning that works together'] },
      nextgen: { title: 'Building wealth, not just saving it.', lead: 'Whether you’re inheriting, earning fast or starting early, an institutional-grade approach and a transparent fee conversation matter from day one.', items: ['Institutional-grade market experience on the team', 'Transparent fees, upfront', 'Custodial accounts and new account types explained plainly', 'A plan that adapts as life changes'] }
    };
    const title = $('#persona-title'), lead = $('#persona-lead'), list = $('#persona-list');
    const apply = (key) => {
      const d = data[key];
      [title, lead, list].forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(8px)'; });
      setTimeout(() => {
        title.textContent = d.title; lead.textContent = d.lead;
        list.innerHTML = d.items.map((t) => `<li>${I.check}<span>${h(t)}</span></li>`).join('');
        [title, lead, list].forEach((el, i) => { el.style.transition = 'opacity .5s var(--ease-out), transform .6s var(--ease-out)'; el.style.transitionDelay = i * 80 + 'ms'; el.style.opacity = 1; el.style.transform = 'none'; });
      }, 200);
    };
    $$('[data-persona]', wrap).forEach((b) => b.addEventListener('click', () => { $$('[data-persona]', wrap).forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); apply(b.dataset.persona); }));
    apply('retire');
  }

  function initDemoChat() {
    const box = $('#demo-msgs');
    if (!box) return;
    const script = [
      { t: 'user', m: 'I’m 61 with about $1.4M saved. Can I retire at 65?' },
      { t: 'tool', m: 'Running retirement projection' },
      { t: 'bot', m: 'Here’s an illustrative look: at a 4% starting withdrawal, $1.4M supports roughly $56,000 a year before Social Security. Want me to model it across 1,000 market paths in the Scenario Lab?' },
      { t: 'user', m: 'Yes — and what happens if the market drops early?' },
      { t: 'tool', m: 'Searching Insights library' },
      { t: 'bot', m: 'Sequence-of-returns risk is exactly why our retirement income approach differs from accumulation. I found “What to Do When the Stock Market Drops” — and I can connect you with Peter Noto, RICP®, who specializes in this.' },
      { t: 'user', m: 'Let’s set up a call.' },
      { t: 'bot', m: 'Great. I’ll collect a few details and the team will reach out. What’s the best number to reach you?' }
    ];
    let i = 0;
    const step = () => {
      if (i >= script.length) { setTimeout(() => { box.innerHTML = ''; i = 0; step(); }, 5000); return; }
      const s = script[i++];
      const el = document.createElement('div');
      el.className = 'demo-msg demo-msg--' + s.t;
      el.innerHTML = s.t === 'tool' ? `<i></i>${h(s.m)}…` : h(s.m);
      box.appendChild(el);
      requestAnimationFrame(() => el.classList.add('is-in'));
      while (box.children.length > 6) box.firstElementChild.remove();
      setTimeout(step, s.t === 'tool' ? 1200 : 2200 + s.m.length * 12);
    };
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); step(); } }, { threshold: 0.3 });
    io.observe(box);
  }

  function initTimeline() {
    const tl = $('.timeline');
    if (!tl) return;
    const steps = $$('.timeline__step', tl), line = $('.timeline__line', tl);
    const io = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return; io.disconnect();
      steps.forEach((s, i) => setTimeout(() => s.classList.add('is-lit'), 300 + i * 450));
      if (line) { line.style.transition = 'width 2.2s var(--ease-out)'; requestAnimationFrame(() => (line.style.width = '100%')); }
    }, { threshold: 0.4 });
    io.observe(tl);
  }

  /* --------------------------------------------------------- insights index */
  function initInsights() {
    const grid = $('#insights-grid');
    if (!grid) return;
    const search = $('#insights-search'), filters = $('#insights-filters');
    const cats = ['All', ...new Set(K.articles.map((a) => a.category))];
    filters.innerHTML = cats.map((c, i) => `<button class="chip${i === 0 ? ' is-active' : ''}" data-cat="${h(c)}">${h(c)}</button>`).join('');
    let cat = 'All', q = '';
    const card = (a) => `
      <article class="card article-card" data-reveal>
        <span class="card__spot"></span>
        <div class="article-card__meta"><span class="badge">${h(a.category)}</span><span>${fmtDate(a.date)}</span>${a.external ? `<span class="badge badge--aqua">${h(a.source)} resource</span>` : ''}</div>
        <a href="${url('insights/' + a.slug + '.html')}" data-cursor="Read"><h3>${h(a.title)}</h3></a>
        <p>${h(a.summary)}</p>
        <div class="article-card__foot"><span class="read">${a.readMin} min read</span><button class="ai-btn" type="button" data-summarize="${a.slug}">${I.spark} AI takeaways</button></div>
        <div class="ai-summary" id="sum-${a.slug}"><div class="lbl">${I.spark} Navigator summary</div><div class="ai-summary__txt"></div></div>
      </article>`;
    const render = () => {
      const s = q.toLowerCase();
      const rows = K.articles.filter((a) => (cat === 'All' || a.category === cat) && (!s || (a.title + ' ' + a.summary + ' ' + a.keywords.join(' ')).toLowerCase().includes(s)));
      grid.innerHTML = rows.length ? rows.map(card).join('') : `<div class="empty">Nothing matches “${h(q)}”. <a href="#" data-open-assistant style="color:var(--navy-700);font-weight:600">Ask Navigator instead →</a></div>`;
      window.Motion && window.Motion.refresh(grid);
      $('#insights-count').textContent = `${rows.length} of ${K.articles.length}`;
    };
    filters.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b) return; $$('.chip', filters).forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); cat = b.dataset.cat; render(); });
    search.addEventListener('input', () => { q = search.value; render(); });
    render();
  }

  function initSummaries() {
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-summarize]'); if (!b) return;
      const a = K.articles.find((x) => x.slug === b.dataset.summarize); if (!a) return;
      const box = $('#sum-' + a.slug); if (!box) return; const txt = $('.ai-summary__txt', box);
      if (box.classList.contains('is-open')) { box.classList.remove('is-open'); return; }
      box.classList.add('is-open'); txt.innerHTML = '';
      const ul = document.createElement('ul'); txt.appendChild(ul);
      a.takeaways.forEach((t, i) => setTimeout(() => { const li = document.createElement('li'); ul.appendChild(li); typeInto(li, t, 12); }, i * 900));
      const more = document.createElement('div'); more.className = 'mt-2';
      more.innerHTML = `<a href="#" class="ai-btn" data-ask-article="${a.slug}">${I.spark} Ask Navigator about this</a>`;
      setTimeout(() => txt.appendChild(more), a.takeaways.length * 900);
    });
  }

  function typeInto(el, text, speed) {
    let i = 0; el.textContent = '';
    const cur = document.createElement('span'); cur.className = 'cursor'; el.appendChild(cur);
    const tick = () => { i += 2; el.textContent = text.slice(0, i); if (i < text.length) { el.appendChild(cur); setTimeout(tick, speed); } };
    tick();
  }
  window.TWM.typeInto = typeInto;

  /* ----------------------------------------------------------- article page */
  function initArticle() {
    const body = $('.article-body');
    if (!body) return;
    const slug = document.body.dataset.slug;
    const a = K.articles.find((x) => x.slug === slug);
    // Table of contents
    const toc = $('#toc');
    const heads = $$('h2', body);
    if (toc && heads.length) {
      heads.forEach((hd, i) => { hd.id = hd.id || 'sec-' + i; });
      toc.innerHTML = heads.map((hd) => `<a href="#${hd.id}">${h(hd.textContent)}</a>`).join('');
      const links = $$('a', toc);
      const io = new IntersectionObserver((en) => { en.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)); } }); }, { rootMargin: '-20% 0px -70% 0px' });
      heads.forEach((hd) => io.observe(hd));
    } else if (toc) { toc.closest('.aside-card').remove(); }
    // Key takeaways
    const tk = $('#takeaways');
    if (tk && a) tk.innerHTML = a.takeaways.map((t) => `<li>${h(t)}</li>`).join('');
    // Listen (Web Speech synthesis)
    const listen = $('#listen');
    if (listen) {
      if (!('speechSynthesis' in window)) { listen.closest('.aside-card').style.display = 'none'; }
      else {
        const btn = $('.listen__btn', listen), status = $('small', listen);
        let utter = null, playing = false;
        const stop = () => { speechSynthesis.cancel(); playing = false; listen.classList.remove('is-playing'); btn.innerHTML = I.play; status.textContent = 'Listen to this article'; };
        btn.addEventListener('click', () => {
          if (playing) { stop(); return; }
          const text = $$('p, h2, li', body).map((e) => e.textContent).join('. ');
          utter = new SpeechSynthesisUtterance(text); utter.rate = 1;
          const voices = speechSynthesis.getVoices(); const v = voices.find((x) => /en-US/i.test(x.lang) && /female|samantha|aria|jenny/i.test(x.name)) || voices.find((x) => /en/i.test(x.lang)); if (v) utter.voice = v;
          utter.onend = stop; speechSynthesis.speak(utter);
          playing = true; listen.classList.add('is-playing'); btn.innerHTML = I.pause; status.textContent = 'Playing · tap to stop';
        });
        window.addEventListener('beforeunload', () => speechSynthesis.cancel());
      }
    }
    // Related articles
    const rel = $('#related');
    if (rel && a) {
      const others = K.articles.filter((x) => x.slug !== slug).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3);
      rel.innerHTML = others.map((o) => `<a class="card article-card" href="${url('insights/' + o.slug + '.html')}" data-reveal data-cursor="Read"><span class="card__spot"></span><div class="article-card__meta"><span class="badge">${h(o.category)}</span><span>${fmtDate(o.date)}</span></div><h3>${h(o.title)}</h3><p>${h(o.summary)}</p></a>`).join('');
    }
  }

  /* ------------------------------------------------------------ contact form */
  function initForms() {
    $$('form[data-demo-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let ok = true;
        $$('.field', form).forEach((f) => {
          const inp = $('input, textarea, select', f); if (!inp) return;
          const valid = inp.checkValidity() && (inp.type !== 'email' || /.+@.+\..+/.test(inp.value));
          f.classList.toggle('is-invalid', !valid); if (!valid) ok = false;
        });
        if (!ok) { form.querySelector('.is-invalid input, .is-invalid textarea')?.focus(); return; }
        const data = Object.fromEntries(new FormData(form).entries());
        try { const log = JSON.parse(localStorage.getItem('twm_inquiries') || '[]'); log.push({ ...data, at: new Date().toISOString(), page: location.pathname }); localStorage.setItem('twm_inquiries', JSON.stringify(log)); } catch (_) {}
        const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Sending…';
        setTimeout(() => {
          form.style.display = 'none';
          const s = $('.form__success', form.parentElement); if (s) { s.classList.add('is-shown'); $('[data-name]', s) && ($('[data-name]', s).textContent = data.first || ''); }
        }, 900);
      });
    });
  }

  /* ------------------------------------------------------------- assistant hooks */
  function initAssistantHooks() {
    document.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open-assistant]');
      if (open) { e.preventDefault(); window.Navigator && window.Navigator.open(open.dataset.openAssistant || ''); return; }
      const ask = e.target.closest('[data-ask-article]');
      if (ask) { e.preventDefault(); const a = K.articles.find((x) => x.slug === ask.dataset.askArticle); window.Navigator && window.Navigator.open(`Tell me more about “${a.title}”`); }
    });
  }

  /* -------------------------------------------------------------------- init */
  document.documentElement.classList.add('js');
  renderNav(); renderFooter(); initTransitions(); initPalette(); initAssistantHooks();
  initSummaries(); initConsole(); initPersona(); initDemoChat(); initTimeline(); initInsights(); initArticle(); initForms();
})();
