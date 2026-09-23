/* ==========================================================================
   Navigator — the Trident AI concierge.
   A floating assistant with a local agent engine (intent routing, retrieval
   over the site knowledge base, slot-filling introduction requests and
   educational calculators) and an optional Claude-connected mode via a
   server endpoint (see api/chat.js). Streams replies, shows the tool steps it
   takes, supports voice input and remembers the session.
   ========================================================================== */
(function () {
  const K = window.TWM, I = K.icons, U = K.util;
  const { $, $$, h, url, fmtDate } = U;
  const ROOT = document.body.dataset.root || '';
  const CTX = document.body.dataset.assistantContext || '';
  const ENDPOINT = (document.querySelector('meta[name="twm-ai-endpoint"]') || {}).content || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SS = window.sessionStorage;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const moneyK = (n) => (n >= 1e6 ? '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'k' : money(n));

  /* ------------------------------------------------------------------ DOM */
  const launcher = document.createElement('button');
  launcher.className = 'assistant-launch'; launcher.type = 'button'; launcher.setAttribute('aria-label', 'Open Navigator, the AI concierge');
  launcher.innerHTML = `<span class="console__avatar">${I.trident}</span><span><strong>Ask Navigator</strong><span><i class="live-dot"></i> AI concierge · online</span></span><span class="unread" id="nav-unread">1</span>`;
  const nudge = document.createElement('div'); nudge.className = 'assistant-nudge'; nudge.setAttribute('role', 'status');
  const panel = document.createElement('section');
  panel.className = 'assistant'; panel.setAttribute('aria-label', 'Navigator AI concierge'); panel.setAttribute('data-lenis-prevent', '');
  panel.innerHTML = `
    <div class="assistant__head">
      <span class="console__avatar">${I.trident}</span>
      <div><strong>Navigator</strong><span><i class="live-dot"></i> <span id="nav-status">Trident AI concierge</span></span></div>
      <div class="assistant__actions">
        <button type="button" data-act="expand" aria-label="Expand">${I.expand}</button>
        <button type="button" data-act="reset" aria-label="Start over">${I.refresh}</button>
        <button type="button" data-act="close" aria-label="Close">${I.close}</button>
      </div>
    </div>
    <div class="assistant__body" id="nav-body" aria-live="polite"></div>
    <div class="assistant__chips" id="nav-chips"></div>
    <form class="assistant__input" id="nav-form">
      <button type="button" class="assistant__mic" id="nav-mic" aria-label="Speak your question">${I.mic}</button>
      <textarea id="nav-input" rows="1" placeholder="Ask about retirement income, fees, the team…" aria-label="Message Navigator"></textarea>
      <button type="submit" class="assistant__send" id="nav-send" aria-label="Send">${I.send}</button>
    </form>
    <div class="assistant__foot"><span class="assistant__mode" id="nav-mode"></span> · Navigator shares general information about Trident Wealth Management Group and educational content. It does not provide personalized investment, tax or legal advice. <a href="${url('disclosures.html')}">Disclosures</a></div>`;
  document.body.append(launcher, nudge, panel);
  const body = $('#nav-body'), chipsEl = $('#nav-chips'), form = $('#nav-form'), input = $('#nav-input'), sendBtn = $('#nav-send'), micBtn = $('#nav-mic');
  $('#nav-mode').textContent = ENDPOINT ? 'Claude-connected' : 'On-site knowledge mode';

  /* ---------------------------------------------------------------- state */
  const state = { open: false, busy: false, flow: null, lead: {}, history: [], greeted: false, lastArticle: null, lastCtx: '' };
  try { const saved = JSON.parse(SS.getItem('twm_nav') || 'null'); if (saved) { state.history = saved.history || []; state.lead = saved.lead || {}; state.greeted = !!saved.greeted; state.lastCtx = saved.lastCtx || ''; } } catch (_) {}
  const persist = () => { try { SS.setItem('twm_nav', JSON.stringify({ history: state.history.slice(-40), lead: state.lead, greeted: state.greeted, lastCtx: state.lastCtx })); } catch (_) {} };

  /* ------------------------------------------------------------ rendering */
  function md(text) {
    let s = h(text);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[(.+?)\]\((.+?)\)/g, (m, t, u) => `<a href="${u.startsWith('http') || u.startsWith('tel') ? u : ROOT + u}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
    const lines = s.split('\n'); let out = '', inList = false;
    for (const ln of lines) {
      if (/^\s*[-•]\s+/.test(ln)) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${ln.replace(/^\s*[-•]\s+/, '')}</li>`; }
      else { if (inList) { out += '</ul>'; inList = false; } if (ln.trim()) out += `<p>${ln}</p>`; }
    }
    if (inList) out += '</ul>';
    return out;
  }
  const scroll = () => { body.scrollTop = body.scrollHeight; };
  function addUser(text) {
    const el = document.createElement('div'); el.className = 'msg msg--user';
    el.innerHTML = `<div class="msg__bubble">${h(text)}</div>`; body.appendChild(el); scroll();
  }
  function card(c) {
    if (c.type === 'article') { const a = K.articles.find((x) => x.slug === c.slug); if (!a) return ''; return `<a class="mcard" href="${url('insights/' + a.slug + '.html')}"><span class="mcard__img">${I.doc}</span><span><strong>${h(a.title)}</strong><span>${h(a.category)} · ${a.readMin} min read · ${fmtDate(a.date)}</span></span></a>`; }
    if (c.type === 'team') { const t = K.team.find((x) => x.slug === c.slug); if (!t) return ''; return `<a class="mcard" href="${url('strength.html#' + t.slug)}"><span class="mcard__img">${t.img ? `<img src="${t.img}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('${t.initials}'))">` : t.initials}</span><span><strong>${h(t.name)}</strong><span>${h(t.title)}${t.years ? ' · ' + h(t.years) : ''}</span></span></a>`; }
    if (c.type === 'service') { const s = K.services.find((x) => x.id === c.id); if (!s) return ''; return `<a class="mcard" href="${url('skill.html#' + s.id)}"><span class="mcard__img">${I[s.icon]}</span><span><strong>${h(s.title)}</strong><span>${h(s.sub)}</span></span></a>`; }
    if (c.type === 'portal') { const p = K.portals.find((x) => x.id === c.id); if (!p) return ''; return `<a class="mcard" href="${p.href}" target="_blank" rel="noopener"><span class="mcard__img">${I.lock}</span><span><strong>${h(p.name)}</strong><span>${h(p.by)} · opens in a new tab</span></span></a>`; }
    if (c.type === 'contact') return `<a class="mcard" href="${K.firm.phoneHref}"><span class="mcard__img">${I.phone}</span><span><strong>${K.firm.phone}</strong><span>${h(K.firm.address)}, ${h(K.firm.city)}</span></span></a>`;
    if (c.type === 'link') return `<a class="mcard" href="${c.href.startsWith('http') ? c.href : ROOT + c.href}"><span class="mcard__img">${I[c.icon] || I.arrow}</span><span><strong>${h(c.title)}</strong><span>${h(c.desc || '')}</span></span></a>`;
    if (c.type === 'stat') return `<div class="mcard mcard--stat"><span class="sub">${h(c.label)}</span><span class="big">${h(c.value)}</span><span class="sub">${h(c.sub || '')}</span>${c.series ? `<canvas data-spark='${JSON.stringify(c.series)}'></canvas>` : ''}</div>`;
    if (c.type === 'summary') return `<div class="mcard mcard--wide"><strong>${h(c.title)}</strong><ul style="margin:6px 0 0;padding-left:18px">${c.items.map((t) => `<li>${h(t)}</li>`).join('')}</ul></div>`;
    return '';
  }
  function drawSparks(scope) {
    $$('canvas[data-spark]', scope).forEach((cv) => {
      const data = JSON.parse(cv.dataset.spark); const dpr = devicePixelRatio || 1; const w = cv.clientWidth || 300, hh = 70; cv.width = w * dpr; cv.height = hh * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr);
      const max = Math.max(...data), min = Math.min(...data); const x = (i) => 6 + (i / (data.length - 1)) * (w - 12), y = (v) => hh - 8 - ((v - min) / (max - min || 1)) * (hh - 16);
      c.beginPath(); data.forEach((v, i) => (i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v)))); c.strokeStyle = '#00263e'; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
      c.lineTo(x(data.length - 1), hh); c.lineTo(x(0), hh); c.closePath(); c.fillStyle = 'rgba(0,38,62,0.08)'; c.fill();
      c.beginPath(); c.arc(x(data.length - 1), y(data[data.length - 1]), 4, 0, Math.PI * 2); c.fillStyle = '#d9a057'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke();
    });
  }
  async function addBot(res, opts = {}) {
    const el = document.createElement('div'); el.className = 'msg msg--bot';
    const tools = document.createElement('div'); tools.className = 'msg__tools'; el.appendChild(tools);
    body.appendChild(el); scroll();
    // tool steps
    for (const t of res.tools || []) {
      const step = document.createElement('div'); step.className = 'tool-step'; step.innerHTML = `<span class="spin"></span><span class="tick">${I.check}</span>${h(t)}`; tools.appendChild(step); scroll();
      await wait(420 + Math.random() * 380); step.classList.add('done');
    }
    if (!(res.tools || []).length) tools.remove();
    // typing indicator
    const typing = document.createElement('div'); typing.className = 'typing-ind'; typing.innerHTML = '<i></i><i></i><i></i>'; el.appendChild(typing); scroll();
    await wait(opts.instant ? 0 : 350 + Math.min(900, (res.text || '').length * 4));
    typing.remove();
    const bubble = document.createElement('div'); bubble.className = 'msg__bubble'; el.appendChild(bubble);
    if (res.stream) { await res.stream(bubble); }
    else await streamText(bubble, res.text || '');
    if (res.cards && res.cards.length) { const cs = document.createElement('div'); cs.className = 'msg__cards'; cs.innerHTML = res.cards.map(card).join(''); el.appendChild(cs); drawSparks(cs); }
    if (res.chips && res.chips.length) { const ch = document.createElement('div'); ch.className = 'msg__chips'; ch.innerHTML = res.chips.map((c) => `<button type="button" class="chip" data-chip="${h(typeof c === 'string' ? c : c.send)}">${h(typeof c === 'string' ? c : c.label)}</button>`).join(''); el.appendChild(ch); }
    const meta = document.createElement('div'); meta.className = 'msg__meta'; meta.textContent = 'Navigator · ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); el.appendChild(meta);
    scroll();
    if (!state.open) { const u = $('#nav-unread'); u.textContent = '1'; u.classList.add('is-on'); }
  }
  async function streamText(bubble, text) {
    const html = md(text);
    if (reduce) { bubble.innerHTML = html; return; }
    // stream by revealing the rendered text progressively (word by word)
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const words = text.split(/(\s+)/).filter(Boolean); let shown = '';
    const cur = '<span class="cursor"></span>';
    for (let i = 0; i < words.length; i++) {
      shown += words[i];
      if (i % 2 === 0) { bubble.innerHTML = md(shown) + cur; scroll(); await wait(14 + Math.random() * 26); }
    }
    bubble.innerHTML = html;
  }
  function setChips(list) { chipsEl.innerHTML = (list || []).map((c) => `<button type="button" class="chip" data-chip="${h(typeof c === 'string' ? c : c.send)}">${h(typeof c === 'string' ? c : c.label)}</button>`).join(''); }
  const defaultChips = ['What does Trident do?', 'Who is on the team?', 'Summarize the latest insight', 'Estimate my retirement income', 'Request an introduction', 'How do I log in?'];

  /* --------------------------------------------------------------- engine */
  const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9$%.,&' \-]/g, ' ').replace(/\s+/g, ' ').trim();
  const has = (s, ...rx) => rx.some((r) => r.test(s));
  const tokens = (s) => norm(s).split(/[^a-z0-9$%&']+/).filter((w) => w.length > 2 && !STOP.has(w));
  const STOP = new Set(['the', 'and', 'for', 'you', 'your', 'with', 'what', 'how', 'can', 'about', 'tell', 'more', 'this', 'that', 'are', 'does', 'have', 'from', 'when', 'should', 'would', 'could', 'will', 'want', 'need', 'like', 'know', 'please', 'help', 'get', 'any', 'our', 'their', 'there', 'who', 'why', 'where', 'which', 'into']);

  function parseMoney(s) {
    const m = s.match(/\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(m|mm|million|k|thousand)?\b/gi) || [];
    const vals = m.map((x) => { const mm = x.match(/(\d[\d,]*(?:\.\d+)?)\s*(m|mm|million|k|thousand)?/i); let v = parseFloat(mm[1].replace(/,/g, '')); const u = (mm[2] || '').toLowerCase(); if (u.startsWith('m')) v *= 1e6; else if (u) v *= 1e3; return v; });
    return vals;
  }
  function parseAges(s) {
    const cur = s.match(/(?:i'?m|i am|\bam|age|aged|turning|currently)\s+(\d{2})\b/i) || s.match(/\b(\d{2})\s*(?:years? old|yo|y\/o)\b/i);
    const ret = s.match(/retir\w*\s+(?:at|by|when i'?m|when i am)\s+(\d{2})\b/i) || s.match(/\bat\s+(\d{2})\b/i);
    return { age: cur ? +cur[1] : null, retire: ret ? +ret[1] : null };
  }

  function retrieve(q) {
    const toks = tokens(q); if (!toks.length) return [];
    const hit = (text, t) => new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9])').test(text);
    const scoreOf = (fields) => { let s = 0; const hits = new Set(); toks.forEach((t) => fields.forEach(([text, w]) => { if (hit(text, t)) { s += w; hits.add(t); } })); return { s, hits: hits.size }; };
    const res = [];
    K.faqs.forEach((f) => { const { s } = scoreOf([[f.tags.join(' '), 3], [norm(f.q), 2], [norm(f.a), 0.4]]); if (s >= 3) res.push({ kind: 'faq', s, ref: f }); });
    K.articles.forEach((a) => { const { s, hits } = scoreOf([[a.keywords.join(' '), 3], [norm(a.title), 2.5], [norm(a.summary), 0.6]]); if (hits >= 2 || s >= 4) res.push({ kind: 'article', s, ref: a }); });
    K.services.forEach((sv) => { const { s, hits } = scoreOf([[sv.keywords.join(' '), 3], [norm(sv.title), 2], [norm(sv.body), 0.5]]); if (hits >= 2 || s >= 4) res.push({ kind: 'service', s, ref: sv }); });
    K.team.forEach((t) => { const { s } = scoreOf([[norm(t.short + ' ' + t.name), 6], [t.tags.join(' '), 2]]); if (s >= 6) res.push({ kind: 'team', s, ref: t }); });
    return res.sort((a, b) => b.s - a.s);
  }

  const say = (text, extra = {}) => ({ text, ...extra });

  /* Introduction-request flow (slot filling) */
  const flowSteps = ['name', 'email', 'phone', 'topic', 'timing', 'confirm'];
  function startFlow(prefill) {
    state.flow = { step: 0 }; Object.assign(state.lead, prefill || {});
    return nextFlowPrompt('Happy to arrange that. The team reaches out personally — I just collect a few details so they can prepare.\n\n');
  }
  function nextFlowPrompt(prefix = '') {
    const L = state.lead;
    while (state.flow.step < flowSteps.length && L[flowSteps[state.flow.step]] && flowSteps[state.flow.step] !== 'confirm') state.flow.step++;
    const step = flowSteps[state.flow.step];
    if (step === 'name') return say(prefix + 'First, who should the team ask for? (Your first and last name.)', { chips: [{ label: 'Cancel', send: 'cancel' }] });
    if (step === 'email') return say(prefix + `Thanks, ${L.name.split(' ')[0]}. What’s the best **email address** for a confirmation?`, { chips: [{ label: 'Cancel', send: 'cancel' }] });
    if (step === 'phone') return say(prefix + 'And a **phone number** the team can reach you at?', { chips: [{ label: 'Skip for now', send: 'skip' }, { label: 'Cancel', send: 'cancel' }] });
    if (step === 'topic') return say(prefix + 'What would you like to talk about? Pick one or describe it.', { chips: ['Retirement income', 'Investment review', 'Estate & legacy', 'Second opinion on my plan', 'Tax strategies', 'Something else'] });
    if (step === 'timing') return say(prefix + 'When are you generally easiest to reach?', { chips: ['Mornings', 'Afternoons', 'Evenings', 'Any time'] });
    if (step === 'confirm') return say(prefix + `Here’s what I’ll pass along:\n- **Name:** ${L.name}\n- **Email:** ${L.email}\n- **Phone:** ${L.phone || 'not provided'}\n- **Topic:** ${L.topic}\n- **Best time:** ${L.timing}\n\nShall I send it?`, { chips: [{ label: 'Yes, send it', send: 'yes send it' }, { label: 'Change something', send: 'change' }, { label: 'Cancel', send: 'cancel' }] });
    return finishFlow();
  }
  function finishFlow() {
    const L = state.lead; state.flow = null;
    try { const log = JSON.parse(localStorage.getItem('twm_inquiries') || '[]'); log.push({ ...L, source: 'navigator', at: new Date().toISOString(), page: location.pathname, context: CTX }); localStorage.setItem('twm_inquiries', JSON.stringify(log)); } catch (_) {}
    return say(`Sent. ${L.name.split(' ')[0]}, a member of the Trident team will reach out ${L.timing && L.timing !== 'Any time' ? 'in the ' + L.timing.toLowerCase() : 'soon'} about **${L.topic.toLowerCase()}**. If it’s easier, you can also call the office directly.`, {
      tools: ['Validating contact details', 'Routing request to the Trident team'],
      cards: [{ type: 'contact' }, { type: 'link', title: 'While you wait: the Planning Lab', desc: 'Run a retirement scenario or check your readiness score', href: 'planning-lab.html', icon: 'flask' }],
      chips: ['Who will I be talking to?', 'What should I prepare?', 'Summarize the latest insight']
    });
  }
  function handleFlow(raw) {
    const q = norm(raw); const L = state.lead; const step = flowSteps[state.flow.step];
    if (has(q, /^(cancel|never ?mind|stop|forget it|no thanks)$/)) { state.flow = null; return say('No problem — I’ve cleared that. Anything else I can help with?', { chips: defaultChips }); }
    const em = raw.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); if (em) L.email = em[0];
    const ph = raw.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/); if (ph) L.phone = ph[0];
    if (step === 'name') { if (em || ph) { /* got other data */ } const nm = raw.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/, '').replace(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/, '').replace(/^(my name is|i'?m|it'?s|this is)\s+/i, '').trim(); if (nm.length > 1 && nm.length < 60) L.name = nm.replace(/[.,!]$/, ''); else if (!L.name) return say('Sorry — what name should I use?'); }
    else if (step === 'email') { if (!L.email) return say('That doesn’t look like an email address — could you retype it?'); }
    else if (step === 'phone') { if (has(q, /skip|later|no/)) L.phone = ''; else if (!L.phone) return say('I couldn’t read a phone number there. You can also say “skip”.', { chips: [{ label: 'Skip for now', send: 'skip' }] }); }
    else if (step === 'topic') { L.topic = raw.trim().replace(/[.!]$/, ''); }
    else if (step === 'timing') { L.timing = raw.trim().replace(/[.!]$/, ''); }
    else if (step === 'confirm') {
      if (has(q, /^(yes|yes send it|send|send it|confirm|correct|looks good|go ahead|sure|ok|okay)\b/)) return finishFlow();
      if (has(q, /change|edit|wrong|fix|update/)) { const which = ['name', 'email', 'phone', 'topic', 'timing'].find((k) => q.includes(k)); if (which) { L[which] = ''; state.flow.step = flowSteps.indexOf(which); return nextFlowPrompt('Sure. '); } return say('Which part should I change?', { chips: ['Change name', 'Change email', 'Change phone', 'Change topic', 'Change timing'] }); }
      return say('Should I send it as shown?', { chips: [{ label: 'Yes, send it', send: 'yes send it' }, { label: 'Change something', send: 'change' }] });
    }
    state.flow.step++;
    return nextFlowPrompt();
  }

  /* Calculators (educational, illustrative) */
  function retirementEstimate(raw) {
    const q = norm(raw); const amounts = parseMoney(raw.replace(/\b(\d{2})\b(?=\s*(years? old|yo)|$)/g, '')); const { age, retire } = parseAges(raw);
    const big = amounts.filter((v) => v >= 50000).sort((a, b) => b - a);
    const savings = big[0] || null; const spend = big.find((v) => v !== savings && v < 500000) || (raw.match(/(\d[\d,]*k?)\s*(?:a|per|\/)\s*(?:year|yr|month|mo)/i) ? parseMoney(raw.match(/(\d[\d,]*k?)\s*(?:a|per|\/)\s*(?:year|yr|month|mo)/i)[0])[0] : null);
    if (!savings) return say('I can run a quick, illustrative estimate. Tell me roughly how much you’ve saved, your age, and when you’d like to retire — for example: “I’m 58 with $1.2M and want to retire at 65 spending $80k a year.”', { chips: ['I’m 58 with $1.2M and want to retire at 65', 'I’m 45 with $600k, retiring at 67', 'Open the Scenario Lab'] });
    const yrs = age && retire && retire > age ? retire - age : 0;
    const growth = 0.05; const series = []; let bal = savings; for (let i = 0; i <= Math.max(yrs, 1); i++) { series.push(Math.round(bal)); bal *= 1 + growth; }
    const atRet = series[series.length - 1]; const income4 = atRet * 0.04;
    let text = `Here’s an illustrative, back-of-the-envelope view — not a plan or a recommendation:\n`;
    if (yrs) text += `- With **${moneyK(savings)}** today and **${yrs} years** until ${retire}, a hypothetical 5% annual return (no new contributions) would grow that to about **${moneyK(atRet)}**.\n`;
    text += `- Using the common 4% starting-withdrawal guideline, ${yrs ? moneyK(atRet) : moneyK(savings)} would support roughly **${money(income4)} a year** before Social Security or pensions.\n`;
    if (spend) { const rate = spend / atRet; text += `- Your target of **${money(spend)} a year** is a **${(rate * 100).toFixed(1)}%** withdrawal rate — ${rate <= 0.04 ? 'inside the guideline range' : rate <= 0.05 ? 'slightly above the guideline, which is common when Social Security starts later' : 'well above the guideline, which is exactly the kind of gap a retirement income plan is built to close'}.\n`; }
    text += `\nThe real answer depends on Social Security timing, taxes, inflation and the order of market returns. The Scenario Lab models 1,000 market paths in seconds, and Peter Noto, RICP® specializes in retirement income.`;
    const params = new URLSearchParams({ age: age || 60, retire: retire || 67, savings: savings, spend: spend || Math.round(income4) }).toString();
    return say(text, { tools: ['Parsing your numbers', 'Running retirement projection'], cards: [{ type: 'stat', label: yrs ? `Projected at ${retire} (5% hypothetical)` : 'Starting balance', value: moneyK(atRet), sub: `≈ ${money(income4)}/yr at a 4% withdrawal`, series }, { type: 'link', title: 'Open the Scenario Lab with these numbers', desc: '1,000-path Monte Carlo, in your browser', href: 'planning-lab.html?' + params + '#scenario', icon: 'chart' }, { type: 'team', slug: 'peter-noto' }], chips: ['Request an introduction', 'What happens if the market drops early in retirement?', 'How does Social Security timing work?'] });
  }
  function rmdAnswer() {
    return say('General rule of thumb under current law (SECURE 2.0):\n- If you were born **1951–1959**, required minimum distributions from traditional IRAs and most workplace plans begin at **age 73**.\n- If you were born **1960 or later**, they begin at **age 75**.\n- Roth IRAs have no lifetime RMD for the original owner.\n\nThe first RMD can be delayed until April 1 of the following year, but that means two distributions in one tax year. RMD planning ties directly into our tax alpha work — we’d coordinate with your CPA.', { tools: ['Checking retirement account rules'], cards: [{ type: 'service', id: 'tax-alpha' }], chips: ['How does Social Security timing work?', 'Request an introduction'] });
  }
  function ssAnswer() {
    return say('The basics, in general terms:\n- You can claim as early as **62**, with a permanent reduction of up to about **30%** versus your full retirement age (FRA) benefit.\n- FRA is **67** for anyone born in 1960 or later.\n- Every month you wait past FRA earns delayed credits worth about **8% per year**, until age 70 — roughly **24% more** than the FRA amount.\n\nWhether to claim early or late depends on health, spousal benefits, other income and taxes. The Planning Lab has a claiming-age visualizer that shows the break-even ages.', { tools: ['Loading Social Security rules'], cards: [{ type: 'link', title: 'Social Security timing tool', desc: 'Compare claiming at 62, 67 and 70', href: 'planning-lab.html#social-security', icon: 'calendar' }, { type: 'service', id: 'retirement-income' }], chips: ['Estimate my retirement income', 'Request an introduction'] });
  }

  function respondLocal(raw) {
    const q = norm(raw);
    if (state.flow) return handleFlow(raw);
    const ctxArticle = CTX.startsWith('article:') ? K.articles.find((a) => a.slug === CTX.slice(8)) : null;

    if (has(q, /^(hi|hello|hey|good (morning|afternoon|evening)|yo)\b/) && q.length < 30) return say('Hello! I’m Navigator, the Trident Wealth Management Group concierge. I can explain how the team works, summarize our insights, run a quick retirement estimate, or arrange an introduction. What’s on your mind?', { chips: defaultChips });
    if (has(q, /^(thanks|thank you|thx|great|perfect|awesome)\b/)) return say('You’re welcome. I’m here whenever you need me.', { chips: ['Request an introduction', 'Summarize the latest insight'] });
    if (has(q, /are you (a |an )?(bot|ai|robot|human|real person)|who are you\b|what are you\b/)) return say('I’m Navigator — an AI concierge for Trident Wealth Management Group. I’m not a person and not an advisor. I can share general information and educational content, and I can hand you off to a real member of the team whenever you like.', { chips: ['Request an introduction', 'What can you do?'] });
    if (has(q, /what can you do|help me with|capabilit|how do you work|what do you know/)) return say('Here’s what I can do right now:\n- **Explain** the firm — the team, services, fees philosophy and how to get started\n- **Summarize** any article in our Insights library\n- **Estimate** retirement income, RMD ages or Social Security timing (educational only)\n- **Arrange** an introduction with the team\n- **Guide** you through the client portals\n\nAnything more specific is a conversation for an advisor — and I can set that up.', { chips: defaultChips });

    // Introduction / human handoff
    if (has(q, /(schedule|book|set ?up|arrange|request|want|like)\b.*\b(call|meeting|consult|appointment|introduction|intro|conversation|chat with)/, /talk to (a |an |someone|somebody|advisor|human|person|real)/, /speak (with|to)/, /call me|contact me|get in touch|reach out|human|real person|introduction/)) return startFlow();
    if (has(q, /^(yes|sure|ok|okay|please|let'?s do it)$/) && state.lastOffer === 'intro') return startFlow();

    // Article context
    if (ctxArticle && has(q, /this article|this piece|this post|summar|takeaway|tl;?dr|key points|shorter|30.second|what'?s it about/)) return say(`Here’s the short version of **${ctxArticle.title}**:`, { tools: ['Reading the article'], cards: [{ type: 'summary', title: 'Key takeaways', items: ctxArticle.takeaways }], chips: ['Related insights', 'Discuss this with an advisor', 'Listen to the article'] });
    if (ctxArticle && has(q, /listen|read it to me|audio/)) { const b = $('#listen .listen__btn'); if (b) b.click(); return say('Starting playback in the sidebar — tap the button again to stop.'); }
    if (ctxArticle && has(q, /related|similar|more like this/)) { const rel = K.articles.filter((a) => a.slug !== ctxArticle.slug && a.category === ctxArticle.category).slice(0, 3); return say(rel.length ? `More on **${ctxArticle.category}**:` : 'Here are a few other recent insights:', { tools: ['Searching Insights library'], cards: (rel.length ? rel : K.articles.slice(0, 3)).map((a) => ({ type: 'article', slug: a.slug })) }); }
    if (ctxArticle && has(q, /discuss|talk about this|advisor/)) return startFlow({ topic: 'Article: ' + ctxArticle.title });

    // Latest / summarize a specific article
    if (has(q, /latest|newest|most recent|new (article|insight|post)/)) { const a = K.articles[0]; state.lastArticle = a; return say(`The latest insight is **${a.title}** (${fmtDate(a.date)}). ${a.summary}`, { tools: ['Searching Insights library'], cards: [{ type: 'summary', title: 'Key takeaways', items: a.takeaways }, { type: 'article', slug: a.slug }], chips: ['Show more insights', 'Discuss this with an advisor'] }); }
    if (has(q, /summar|takeaway|tl;?dr|tell me (more )?about ["“]|key points/)) { const hit = retrieve(raw).find((r) => r.kind === 'article'); const a = hit ? hit.ref : state.lastArticle; if (a) { state.lastArticle = a; return say(`**${a.title}** — ${a.summary}`, { tools: ['Reading the article'], cards: [{ type: 'summary', title: 'Key takeaways', items: a.takeaways }, { type: 'article', slug: a.slug }], chips: ['Show more insights', 'Discuss this with an advisor'] }); } }
    if (has(q, /show (me )?(more |all |the )?(insights|articles|resources|library)|insights|articles|blog|what have you written|reading/)) return say('Here are the most recent pieces from the team. Ask me to summarize any of them.', { tools: ['Searching Insights library'], cards: K.articles.slice(0, 4).map((a) => ({ type: 'article', slug: a.slug })), chips: ['Summarize the latest insight', { label: 'Browse all insights', send: 'open insights' }] });
    if (has(q, /^open insights$/)) { location.href = url('insights.html'); return say('Opening the Insights library.'); }

    // Firm facts that broader intents would otherwise swallow
    if (has(q, /minimum|open an account|become a client|get started|getting started|sign up|new client|how do i start|first step/)) { const f = K.faqs.find((x) => x.id === 'become-client'); state.lastOffer = 'intro'; return say(f.a, { tools: ['Searching knowledge base'], cards: [{ type: 'contact' }], chips: ['Yes, request an introduction', 'How are you compensated?', 'Who is on the team?'] }); }
    if (has(q, /business owner|my business|my company|entrepreneur|sell(ing)? (my|the) business/)) return say('Yes. Mike Petix has spent more than 43 years working with individuals, families and business owners on comprehensive retirement and estate planning strategies, and the whole team is experienced with the concentrated-risk and tax questions that come with owning a business. Tax alpha strategies for non-qualified assets are a natural fit.', { tools: ['Matching specialists'], cards: [{ type: 'team', slug: 'mike-petix' }, { type: 'service', id: 'tax-alpha' }, { type: 'service', id: 'comprehensive' }], chips: ['Request an introduction', 'How do you help with taxes?'] });
    if (has(q, /estate|legacy|inherit|\bwill\b|\btrust\b|beneficiar|heirs?\b|generational/)) { const arts = ['when-should-you-start-giving-your-kids-their-inheritance', 'protecting-your-digital-assets', 'financial-values-that-grandparents-can-pass-along']; return say('Estate and legacy planning is woven into comprehensive wealth management here — Mike Petix in particular has spent decades on retirement and estate planning strategies, and the team coordinates with your attorney and CPA (we don’t provide legal or tax advice ourselves). A few pieces the team has written on the subject:', { tools: ['Searching Insights library'], cards: arts.map((slug) => ({ type: 'article', slug })).concat([{ type: 'team', slug: 'mike-petix' }]), chips: ['Request an introduction', 'Summarize “When Should You Start Giving Your Kids Their Inheritance?”'] }); }
    if (has(q, /assets? (are |is )?(held|kept|custod)|custod|fidelity|\bnfs\b|national financial|where (is|are) my (money|assets|accounts)/)) { const f = K.faqs.find((x) => x.id === 'custodian'); return say(f.a, { tools: ['Searching knowledge base'], cards: K.portals.map((p) => ({ type: 'portal', id: p.id })), chips: ['How do I log in?', 'What is &Partners?', 'Request an introduction'] }); }
    if (has(q, /&\s?partners|and ?partners|broker.?dealer|who (are you )?(registered|affiliated) with/)) { const f = K.faqs.find((x) => x.id === 'andpartners'); return say(f.a, { tools: ['Searching knowledge base'], cards: [{ type: 'link', title: 'Visit &Partners', desc: 'Platform, technology and disclosures', href: K.firm.andpartners, icon: 'shield' }], chips: ['Where are my assets held?', 'Who is on the team?'] }); }
    if (has(q, /hedg|buffer|protect (my|the) portfolio|downside|volatil/)) { const f = K.faqs.find((x) => x.id === 'buffered'); return say(f.a, { tools: ['Loading services'], cards: [{ type: 'service', id: 'hedging' }, { type: 'article', slug: 'what-to-do-when-the-stock-market-drops' }], chips: ['Request an introduction', 'What about taxes?'] }); }
    if (has(q, /\btax/) && !has(q, /tax document|1099/)) { const f = K.faqs.find((x) => x.id === 'tax'); return say(f.a, { tools: ['Loading services'], cards: [{ type: 'service', id: 'tax-alpha' }], chips: ['When do RMDs start?', 'Request an introduction'] }); }
    if (has(q, /rmd|required minimum/)) return rmdAnswer();
    if (has(q, /social security|claim(ing)? (age|early|late)|full retirement age|\bfra\b/)) return ssAnswer();
    if (has(q, /4 ?% rule|four percent/)) return say('The “4% rule” is a guideline, not a law: it suggests withdrawing about 4% of a balanced portfolio in the first year of retirement, then adjusting that dollar amount for inflation. It’s a useful starting point — and the reason a $1M portfolio maps to roughly $40,000 a year — but the right rate depends on your timeline, other income and how the plan responds when markets fall. Tell me your numbers and I’ll run an estimate.', { chips: ['I’m 60 with $1M and want to retire at 65', 'Open the Scenario Lab'] });
    if (has(q, /estimate|nest egg|enough to retire|how much (do i|will i|should i|would i) (need|have)|can i retire|retir\w*/) && (parseMoney(raw).some((v) => v >= 50000) || has(q, /estimate|enough|how much|can i retire/))) return retirementEstimate(raw);
    if (has(q, /market (is )?(down|drop|dropping|crash|crashing|fall|falling|tank)|sell everything|panic|correction|bear market|recession|volatile market/)) { const a = K.articles.find((x) => x.slug === 'what-to-do-when-the-stock-market-drops'); return say(`${a.summary}\n\nThe team’s view: the value of an advisor shows up most in the moment you want to act. I can’t tell you what to do with your portfolio — but I can connect you with someone who can look at the whole picture.`, { tools: ['Searching Insights library'], cards: [{ type: 'summary', title: 'Key takeaways', items: a.takeaways }, { type: 'article', slug: a.slug }, { type: 'service', id: 'hedging' }], chips: ['Request an introduction', 'What are buffered portfolios?'] }); }

    // Team
    const person = K.team.find((t) => q.includes(norm(t.short)) || q.includes(norm(t.short.split(' ')[1] || '')) && q.includes(norm(t.short.split(' ')[0])));
    if (person) return say(`**${person.name}** — ${person.title}${person.years ? ', ' + person.years + ' in the industry' : ''}.\n\n${person.focus}`, { tools: ['Looking up team profiles'], cards: [{ type: 'team', slug: person.slug }], chips: ['Who else is on the team?', `Request an introduction`] });
    if (has(q, /\bteam\b|advisor|advisors|who (is|are|works|runs)|people|staff|founder|meet the/)) return say('Trident is led by six advisors and partners, supported by three client service associates. Together the group spans multiple market cycles — from Paul Viel’s 47+ years to Peter V Noto’s institutional prime-brokerage background.', { tools: ['Looking up team profiles'], cards: K.team.map((t) => ({ type: 'team', slug: t.slug })), chips: ['Who specializes in retirement income?', 'Why the trident?', 'Request an introduction'] });
    if (has(q, /who .*retirement income|specializ|ricp|retirement income specialist/)) { return say('Retirement income is a core specialty. Peter Noto holds the Retirement Income Certified Professional® (RICP®) designation, and the team’s approach to the distribution phase differs deliberately from accumulation: after the paychecks stop, a risk-managed strategy balances the risk of loss with the need to outpace inflation.', { tools: ['Matching specialists'], cards: [{ type: 'team', slug: 'peter-noto' }, { type: 'service', id: 'retirement-income' }], chips: ['Estimate my retirement income', 'Request an introduction'] }); }

    // Services
    if (has(q, /what (do|does) (you|trident|the firm) do|services|what (do you|can you) offer|offerings|help with|specialt/)) return say('Our focus is helping clients **accumulate, distribute and protect** their wealth through four areas:', { tools: ['Loading services'], cards: K.services.map((s) => ({ type: 'service', id: s.id })), chips: ['How are you compensated?', 'Who is on the team?', 'Request an introduction'] });
    // Planning Lab
    if (has(q, /open (the )?(scenario|planning) lab|monte carlo|scenario lab|readiness|simulat/)) return say('The Planning Lab runs in your browser: a retirement readiness pulse, a 1,000-path Monte Carlo scenario lab and a Social Security timing visualizer. Nothing you enter leaves your device.', { cards: [{ type: 'link', title: 'Open the Planning Lab', desc: 'Readiness score · Scenario Lab · Social Security timing', href: 'planning-lab.html', icon: 'flask' }], chips: ['Estimate my retirement income', 'Request an introduction'] });

    // Login / portals
    if (has(q, /log ?in|login|portal|wealthscape|envestnet|password|statement|tax document|1099|account access|my account|edelivery/)) return say('Clients have two secure portals:\n- **Wealthscape** (Fidelity/NFS) for money movement, statements and tax documents, with real-time activity\n- **Envestnet** for a big-picture view of all advised accounts and performance (previous night’s close)\n\nIf you need help logging in, the client-login page has guides, or your advisor can reset access.', { tools: ['Loading portal information'], cards: K.portals.map((p) => ({ type: 'portal', id: p.id })), chips: [{ label: 'Client login page', send: 'open client login' }, 'Call the office'] });
    if (has(q, /^open client login$/)) { location.href = url('client-login.html'); return say('Opening the client login page.'); }

    // Contact
    if (has(q, /call the office|phone number|what'?s the number|how do i (call|reach)/)) return say(`You can reach the office at **${K.firm.phone}**.`, { cards: [{ type: 'contact' }], chips: ['Request an introduction'] });
    if (has(q, /where (are you|is (the|your) office|do i find you|can i (find|meet))|address|located|location|\boffice\b|directions|visit|hours/)) { const f = K.faqs.find((x) => x.id === 'location'); return say(f.a, { cards: [{ type: 'contact' }, { type: 'link', title: 'Contact page & map', desc: 'Directions and a message form', href: 'contact.html', icon: 'pin' }], chips: ['Request an introduction'] }); }

    // Advice guardrail
    if (has(q, /should i (buy|sell|invest|move|put)|is .* a good (investment|idea|buy)|what should i invest|stock pick|recommend (a|an|some) (stock|fund|etf)|which (stock|fund)|best (stock|fund|etf|investment)|bitcoin|crypto/)) { state.lastOffer = 'intro'; return say('That’s exactly the kind of question I shouldn’t answer — it depends on your whole picture, and I’m an AI concierge, not an advisor. What I can do is share how the team thinks about it: decisions are made inside a written plan, with risk management and taxes considered together, rather than one position at a time. Would you like me to arrange a conversation with an advisor?', { cards: [{ type: 'article', slug: 'what-to-do-when-the-stock-market-drops' }], chips: ['Yes, request an introduction', 'What does Trident do?'] }); }

    if (has(q, /my (parents|mother|father|mom|dad|friend|brother|sister|son|daughter|family)|family member|refer|second opinion for/)) { const f = K.faqs.find((x) => x.id === 'referral'); state.lastOffer = 'intro'; return say(f.a, { chips: ['Yes, request an introduction', 'What does Trident do?'] }); }

    // FAQ retrieval
    const hits = retrieve(raw);
    if (hits.length) {
      const top = hits[0];
      if (top.kind === 'faq') { const a = hits.filter((x) => x.kind === 'article').slice(0, 2).map((x) => ({ type: 'article', slug: x.ref.slug })); return say(top.ref.a, { tools: ['Searching knowledge base'], cards: a, chips: ['Request an introduction', 'What does Trident do?'] }); }
      if (top.kind === 'article') { const arts = hits.filter((x) => x.kind === 'article').slice(0, 3); state.lastArticle = arts[0].ref; return say(arts.length > 1 ? 'A few insights that speak to that:' : `This insight speaks to that — **${arts[0].ref.title}**: ${arts[0].ref.summary}`, { tools: ['Searching Insights library'], cards: arts.map((x) => ({ type: 'article', slug: x.ref.slug })), chips: [`Summarize “${arts[0].ref.title.slice(0, 40)}…”`, 'Request an introduction'] }); }
      if (top.kind === 'service') return say(`**${top.ref.title}** — ${top.ref.body}`, { tools: ['Loading services'], cards: [{ type: 'service', id: top.ref.id }], chips: ['Request an introduction', 'Who is on the team?'] });
      if (top.kind === 'team') return say(`**${top.ref.name}** — ${top.ref.title}. ${top.ref.focus}`, { cards: [{ type: 'team', slug: top.ref.slug }] });
    }
    state.lastOffer = 'intro';
    return say('I’m not certain I have that in my knowledge base. I can share how the team works, summarize our insights, run an educational estimate, or connect you with an advisor who can answer properly.', { chips: ['Request an introduction', 'What can you do?', 'Show me the insights', 'Call the office'] });
  }

  /* Remote (Claude-connected) mode with graceful fallback */
  async function respondRemote(raw) {
    const messages = state.history.slice(-12).map((m) => ({ role: m.role, content: m.text })).concat([{ role: 'user', content: raw }]);
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 25000);
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages, context: CTX, page: location.pathname }), signal: ctl.signal });
    clearTimeout(to);
    if (!r.ok || !r.body) throw new Error('bad response');
    return {
      tools: ['Thinking with Claude'],
      stream: async (bubble) => {
        const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '', text = '';
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n'); buf = lines.pop();
          for (const ln of lines) { if (!ln.startsWith('data:')) continue; const d = ln.slice(5).trim(); if (d === '[DONE]') continue; try { const j = JSON.parse(d); if (j.delta) { text += j.delta; bubble.innerHTML = md(text) + '<span class="cursor"></span>'; scroll(); } } catch (_) {} }
        }
        bubble.innerHTML = md(text); state.history.push({ role: 'assistant', text }); persist();
      }
    };
  }

  /* ---------------------------------------------------------------- send */
  async function send(raw) {
    raw = (raw || '').trim(); if (!raw || state.busy) return;
    state.busy = true; sendBtn.disabled = true; input.value = ''; autosize();
    addUser(raw); state.history.push({ role: 'user', text: raw }); persist(); setChips([]);
    let res;
    try { res = ENDPOINT && !state.flow && !has(norm(raw), /introduction|talk to|schedule|call me/) ? await respondRemote(raw) : null; } catch (_) { res = null; $('#nav-mode').textContent = 'On-site knowledge mode (offline)'; }
    if (!res) { res = respondLocal(raw); }
    await addBot(res);
    if (res.text) { state.history.push({ role: 'assistant', text: res.text }); persist(); }
    if (!res.chips || !state.flow) setChips(state.flow ? [] : (res.chips ? [] : defaultChips));
    state.busy = false; sendBtn.disabled = false; if (state.open) input.focus();
  }

  /* ------------------------------------------------------------- open/close */
  function open(prefill) {
    state.open = true; document.body.classList.add('assistant-open'); $('#nav-unread').classList.remove('is-on'); nudge.classList.remove('is-on');
    if (!state.greeted) { state.greeted = true; persist(); greet(); }
    else { if (!body.children.length) restore(); if (CTX && CTX !== state.lastCtx && !state.flow) contextNudge(); }
    setTimeout(() => input.focus(), 350);
    if (prefill) setTimeout(() => send(prefill), state.greeted && body.children.length > 1 ? 200 : 900);
  }
  function close() { state.open = false; document.body.classList.remove('assistant-open'); }
  function restore() { state.history.forEach((m) => { if (m.role === 'user') addUser(m.text); else { const el = document.createElement('div'); el.className = 'msg msg--bot'; el.innerHTML = `<div class="msg__bubble">${md(m.text)}</div>`; body.appendChild(el); } }); setChips(defaultChips); scroll(); }
  function contextCopy() {
    const ctxArticle = CTX.startsWith('article:') ? K.articles.find((a) => a.slug === CTX.slice(8)) : null;
    if (ctxArticle) return { text: `You’re reading **${ctxArticle.title}**. Want the 30-second version, related pieces, or to discuss it with an advisor?`, chips: ['Summarize this article', 'Related insights', 'Discuss this with an advisor', 'What does Trident do?'] };
    if (CTX === 'lab') return { text: 'Welcome to the Planning Lab. Everything here runs in your browser and nothing is stored. Ask me to explain what a result means, or tell me your numbers and I’ll run a quick estimate.', chips: ['What does “probability of success” mean?', 'Estimate my retirement income', 'How does Social Security timing work?', 'Request an introduction'] };
    if (CTX === 'contact') return { text: 'Prefer to skip the form? I can collect your details right here and route them to the team.', chips: ['Request an introduction', 'Where is the office?', 'Who will I be talking to?'] };
    if (CTX === 'login') return { text: 'Need a hand with the client portals? I can point you to the right one or explain what each does.', chips: ['Which portal has my tax documents?', 'I forgot my password', 'Call the office'] };
    if (CTX === 'strength') return { text: 'Meet the team. Ask me about any advisor, their background, or who specializes in what.', chips: ['Who specializes in retirement income?', 'Why the trident?', 'Request an introduction'] };
    if (CTX === 'skill') return { text: 'This is what the team does day to day. Ask about any of the four disciplines, or how they fit together in a plan.', chips: ['What are buffered portfolios?', 'How do you help with taxes?', 'Estimate my retirement income'] };
    if (CTX === 'value') return { text: 'Fees and how we work are fair questions — ask away.', chips: ['How are you compensated?', 'How often will I hear from you?', 'Request an introduction'] };
    if (CTX === 'insights') return { text: 'Looking for something specific? I can summarize any article in the library.', chips: ['Summarize the latest insight', 'Show me the insights', 'Request an introduction'] };
    return null;
  }
  async function contextNudge() {
    const c = contextCopy(); state.lastCtx = CTX; persist(); if (!c) return;
    await addBot({ text: c.text, chips: [] }, { instant: true }); setChips(c.chips);
    state.history.push({ role: 'assistant', text: c.text }); persist();
  }
  async function greet() {
    state.lastCtx = CTX;
    const ctxArticle = CTX.startsWith('article:') ? K.articles.find((a) => a.slug === CTX.slice(8)) : null;
    let text = 'Welcome to Trident Wealth Management Group. I’m **Navigator**, the team’s AI concierge. I can explain how the team works, summarize our insights, run a quick retirement estimate, or arrange an introduction with an advisor.';
    let chips = defaultChips;
    if (ctxArticle) { text = `You’re reading **${ctxArticle.title}**. Want the 30-second version, related pieces, or to discuss it with an advisor?`; chips = ['Summarize this article', 'Related insights', 'Discuss this with an advisor', 'What does Trident do?']; }
    else if (CTX === 'lab') { text = 'Welcome to the Planning Lab. Everything here runs in your browser and nothing is stored. Ask me to explain what a result means, or tell me your numbers and I’ll run a quick estimate.'; chips = ['What does “probability of success” mean?', 'Estimate my retirement income', 'How does Social Security timing work?', 'Request an introduction']; }
    else if (CTX === 'contact') { text = 'Prefer to skip the form? I can collect your details right here and route them to the team.'; chips = ['Request an introduction', 'Where is the office?', 'Who will I be talking to?']; }
    else if (CTX === 'login') { text = 'Need a hand with the client portals? I can point you to the right one or explain what each does.'; chips = ['Which portal has my tax documents?', 'I forgot my password', 'Call the office']; }
    else if (CTX === 'strength') { text = 'Meet the team. Ask me about any advisor, their background, or who specializes in what.'; chips = ['Who specializes in retirement income?', 'Why the trident?', 'Request an introduction']; }
    await addBot({ text, chips: [] }, { instant: false }); setChips(chips);
    state.history.push({ role: 'assistant', text }); persist();
  }
  window.Navigator = { open, close, send, engine: respondLocal };

  /* ---------------------------------------------------------------- events */
  launcher.addEventListener('click', () => open());
  panel.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]'); if (act) { const a = act.dataset.act; if (a === 'close') close(); if (a === 'expand') panel.classList.toggle('assistant--expanded'); if (a === 'reset') { body.innerHTML = ''; state.history = []; state.flow = null; state.lead = {}; state.greeted = false; persist(); greet(); state.greeted = true; } return; }
    const chip = e.target.closest('[data-chip]'); if (chip) { send(chip.dataset.chip); return; }
    const a = e.target.closest('a[href]'); if (a && a.getAttribute('href').startsWith('#')) e.preventDefault();
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; };
  input.addEventListener('input', autosize);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) close(); });

  // Voice input
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    let rec = null, listening = false;
    micBtn.addEventListener('click', () => {
      if (listening) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true;
      rec.onresult = (e) => { const t = Array.from(e.results).map((r) => r[0].transcript).join(''); input.value = t; autosize(); if (e.results[e.results.length - 1].isFinal) { rec.stop(); setTimeout(() => send(t), 200); } };
      rec.onend = () => { listening = false; micBtn.classList.remove('is-listening'); };
      rec.onerror = () => { listening = false; micBtn.classList.remove('is-listening'); };
      rec.start(); listening = true; micBtn.classList.add('is-listening');
    });
  } else micBtn.style.display = 'none';

  // Proactive nudge (once per session, per context)
  const nudgeKey = 'twm_nudge_' + (CTX || 'home');
  if (!SS.getItem(nudgeKey)) {
    const msgs = { home: 'Have a question about the team or how we work? I’m Navigator — ask me anything.', lab: 'Want me to explain what the Scenario Lab is showing?', contact: 'Prefer to skip the form? I can take your details right here.', login: 'Not sure which portal you need? I can help.', insights: 'Looking for something specific? I can summarize any article.' };
    const m = CTX.startsWith('article:') ? 'Want the 30-second version of this article?' : msgs[CTX || 'home'] || msgs.home;
    setTimeout(() => {
      if (state.open) return;
      nudge.innerHTML = `<button type="button" aria-label="Dismiss">×</button>${h(m)}<span class="act">Ask Navigator →</span>`; nudge.classList.add('is-on');
      $('#nav-unread').classList.add('is-on');
      nudge.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); nudge.classList.remove('is-on'); });
      nudge.querySelector('.act').addEventListener('click', () => open(CTX.startsWith('article:') ? 'Summarize this article' : ''));
      SS.setItem(nudgeKey, '1');
      setTimeout(() => nudge.classList.remove('is-on'), 14000);
    }, 16000);
  }
})();
