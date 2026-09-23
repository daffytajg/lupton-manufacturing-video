/* ==========================================================================
   Planning Lab: Retirement Readiness pulse, Monte Carlo Scenario Lab and
   Social Security timing. All maths runs in the browser; nothing is sent
   anywhere. Charts follow one-hue sequential bands + a single accent line,
   with a legend, hover crosshair tooltips and a table view.
   ========================================================================== */
(function () {
  const K = window.TWM, I = K.icons; const { $, $$, h } = K.util;
  if (!$('#lab')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt$ = (n) => (Math.abs(n) >= 1e6 ? '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : Math.abs(n) >= 1e3 ? '$' + Math.round(n / 1e3) + 'k' : '$' + Math.round(n));
  const full$ = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ------------------------------------------------------------- tabs */
  const tabs = $$('.lab-tab'), panels = $$('.lab-panel');
  function showTab(id, push) {
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle('is-active', p.id === 'panel-' + id));
    if (push) history.replaceState(null, '', '#' + id);
    if (id === 'scenario') runScenario(); if (id === 'social-security') runSS();
  }
  tabs.forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab, true)));
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (['readiness', 'scenario', 'social-security'].includes(id)) { showTab(id, false); const el = $('#lab'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
  const initial = ['readiness', 'scenario', 'social-security'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'readiness';

  /* ----------------------------------------------------------- ranges */
  function bindRange(id, fmt) {
    const el = $('#' + id), out = $(`[data-out="${id}"]`);
    const upd = () => { const p = ((el.value - el.min) / (el.max - el.min)) * 100; el.style.setProperty('--pct', p + '%'); if (out) out.textContent = fmt ? fmt(+el.value) : el.value; };
    el.addEventListener('input', upd); upd(); return el;
  }

  /* ------------------------------------------------------ chart helper */
  function makeChart(id) {
    const wrap = $('#' + id), cv = $('canvas', wrap), tip = $('.chart__tip', wrap), ctx = cv.getContext('2d');
    const st = { series: [], bands: [], xs: [], marker: null, yfmt: fmt$, hover: null, labelX: 'Age' };
    const pad = { l: 64, r: 20, t: 16, b: 34 };
    function size() { const dpr = devicePixelRatio || 1; const r = wrap.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); st.w = r.width; st.h = r.height; }
    function scales() {
      const all = [].concat(...st.bands.map((b) => b.hi.concat(b.lo)), ...st.series.map((s) => s.data));
      const ymax = Math.max(1, ...all) * 1.06, ymin = Math.min(0, ...all);
      st.x = (i) => pad.l + (i / (st.xs.length - 1)) * (st.w - pad.l - pad.r);
      st.y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (st.h - pad.t - pad.b);
      st.ymax = ymax; st.ymin = ymin;
    }
    function nice(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
    function draw(progress = 1) {
      size(); scales(); ctx.clearRect(0, 0, st.w, st.h);
      // grid
      const step = nice((st.ymax - st.ymin) / 5); ctx.font = '11px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let v = Math.ceil(st.ymin / step) * step; v <= st.ymax; v += step) { const y = st.y(v); ctx.strokeStyle = '#e8e3d8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(st.w - pad.r, y); ctx.stroke(); ctx.fillStyle = '#6b7684'; ctx.fillText(st.yfmt(v), pad.l - 8, y); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const every = Math.ceil(st.xs.length / 8);
      st.xs.forEach((x, i) => { if (i % every === 0 || i === st.xs.length - 1) { ctx.fillStyle = '#6b7684'; ctx.fillText(x, st.x(i), st.h - pad.b + 10); } });
      // bands (one hue, lighter = wider)
      st.bands.forEach((b) => { ctx.beginPath(); b.hi.forEach((v, i) => (i ? ctx.lineTo(st.x(i), st.y(v)) : ctx.moveTo(st.x(i), st.y(v)))); for (let i = b.lo.length - 1; i >= 0; i--) ctx.lineTo(st.x(i), st.y(b.lo[i])); ctx.closePath(); ctx.fillStyle = b.color; ctx.fill(); });
      // marker
      if (st.marker != null) { const x = st.x(st.marker); ctx.strokeStyle = '#d9a057'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, st.h - pad.b); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#b9803a'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(st.markerLabel || '', x + 6, pad.t); }
      // lines
      st.series.forEach((s) => { const n = Math.max(2, Math.round(s.data.length * progress)); ctx.beginPath(); s.data.slice(0, n).forEach((v, i) => (i ? ctx.lineTo(st.x(i), st.y(v)) : ctx.moveTo(st.x(i), st.y(v)))); ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (s.dash) ctx.setLineDash(s.dash); ctx.stroke(); ctx.setLineDash([]);
        if (progress >= 1) { const i = s.data.length - 1; ctx.beginPath(); ctx.arc(st.x(i), st.y(s.data[i]), 4, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); } });
      // hover crosshair
      if (st.hover != null) { const i = st.hover, x = st.x(i); ctx.strokeStyle = 'rgba(0,38,62,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, st.h - pad.b); ctx.stroke(); st.series.forEach((s) => { ctx.beginPath(); ctx.arc(x, st.y(s.data[i]), 5, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); }); }
    }
    function animate() { if (reduce) { draw(1); return; } const t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / 1100); draw(1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
    wrap.addEventListener('mousemove', (e) => { const r = wrap.getBoundingClientRect(); const mx = e.clientX - r.left; const i = Math.round(((mx - pad.l) / (st.w - pad.l - pad.r)) * (st.xs.length - 1)); if (i < 0 || i >= st.xs.length) { st.hover = null; tip.classList.remove('is-on'); draw(1); return; } st.hover = i; draw(1); tip.innerHTML = `<b>${st.labelX} ${st.xs[i]}</b><br>` + st.tipRows(i).join('<br>'); tip.style.left = st.x(i) + 'px'; tip.style.top = (st.y(st.series[0].data[i]) - 8) + 'px'; tip.classList.add('is-on'); });
    wrap.addEventListener('mouseleave', () => { st.hover = null; tip.classList.remove('is-on'); draw(1); });
    window.addEventListener('resize', () => draw(1));
    return { st, draw, animate };
  }

  /* --------------------------------------------------------- PRNG */
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(rnd) { let u = 0, v = 0; while (u === 0) u = rnd(); while (v === 0) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ================================================== Scenario Lab */
  const ALLOC = { conservative: { mu: 0.045, sd: 0.07, label: 'Conservative' }, balanced: { mu: 0.06, sd: 0.11, label: 'Balanced' }, growth: { mu: 0.075, sd: 0.15, label: 'Growth' } };
  const qs = new URLSearchParams(location.search);
  const scAge = bindRange('sc-age'), scRet = bindRange('sc-retire'), scSav = bindRange('sc-savings', fmt$), scCon = bindRange('sc-contrib', fmt$), scSpend = bindRange('sc-spend', fmt$), scSS = bindRange('sc-ss', fmt$), scInf = bindRange('sc-infl', (v) => v.toFixed(1) + '%');
  ['age', 'retire', 'savings', 'spend'].forEach((k) => { if (qs.get(k)) { const el = $('#sc-' + k); el.value = Math.min(el.max, Math.max(el.min, +qs.get(k))); el.dispatchEvent(new Event('input')); } });
  let alloc = 'balanced', seed = 42;
  $$('[data-seg="alloc"] button').forEach((b) => b.addEventListener('click', () => { $$('[data-seg="alloc"] button').forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); alloc = b.dataset.val; runScenario(); }));
  const scChart = makeChart('sc-chart');
  let scTimer;
  [scAge, scRet, scSav, scCon, scSpend, scSS, scInf].forEach((el) => el.addEventListener('input', () => { clearTimeout(scTimer); scTimer = setTimeout(() => runScenario(false), 60); }));
  $('#sc-run').addEventListener('click', () => { seed = Math.floor(Math.random() * 1e6); runScenario(true); });
  $('#sc-table-toggle').addEventListener('click', () => { const t = $('#sc-table'); t.classList.toggle('is-open'); $('#sc-table-toggle').textContent = t.classList.contains('is-open') ? 'Hide table' : 'Show table'; });

  function runScenario(animate = true) {
    const age = +scAge.value, ret = Math.max(+scRet.value, age + 1), sav = +scSav.value, con = +scCon.value, spend = +scSpend.value, ss = +scSS.value, inf = +scInf.value / 100;
    if (+scRet.value <= age) { scRet.value = age + 1; scRet.dispatchEvent(new Event('input')); }
    const { mu, sd } = ALLOC[alloc]; const END = 95, N = 1000, years = END - age; const rnd = mulberry32(seed);
    const paths = new Array(N); let successes = 0; const depleted = [];
    for (let n = 0; n < N; n++) {
      let bal = sav; const p = new Float64Array(years + 1); p[0] = bal; let dead = null;
      for (let y = 1; y <= years; y++) {
        const a = age + y; const infl = Math.pow(1 + inf, y);
        const r = Math.exp((Math.log(1 + mu) - 0.5 * sd * sd) + sd * gauss(rnd)) - 1;
        if (a <= ret) { bal = bal * (1 + r) + con * infl; }
        else { const need = spend * infl - (a >= 67 ? ss * infl : 0); bal = (bal - Math.max(0, need)) * (1 + r); }
        if (bal < 0) { bal = 0; if (dead === null) dead = a; }
        p[y] = bal;
      }
      if (bal > 0) successes++; else depleted.push(dead);
      paths[n] = p;
    }
    const pct = (q, y) => { const arr = new Float64Array(N); for (let n = 0; n < N; n++) arr[n] = paths[n][y]; arr.sort(); return arr[Math.min(N - 1, Math.floor(q * N))]; };
    const P = { 10: [], 25: [], 50: [], 75: [], 90: [] };
    for (let y = 0; y <= years; y++) for (const q of Object.keys(P)) P[q].push(pct(q / 100, y));
    const xs = Array.from({ length: years + 1 }, (_, i) => age + i);
    const st = scChart.st; st.xs = xs; st.marker = ret - age; st.markerLabel = 'Retire ' + ret; st.labelX = 'Age';
    st.bands = [{ hi: P[90], lo: P[10], color: 'rgba(0,38,62,0.10)' }, { hi: P[75], lo: P[25], color: 'rgba(0,38,62,0.20)' }];
    st.series = [{ data: P[50], color: '#00263e', width: 2.5 }];
    st.tipRows = (i) => [`90th: ${fmt$(P[90][i])}`, `75th: ${fmt$(P[75][i])}`, `<b>Median: ${fmt$(P[50][i])}</b>`, `25th: ${fmt$(P[25][i])}`, `10th: ${fmt$(P[10][i])}`];
    animate ? scChart.animate() : scChart.draw(1);
    const prob = successes / N; const probEl = $('#sc-prob');
    countTo(probEl, Math.round(prob * 100), '%');
    probEl.closest('.tile').style.setProperty('--tone', prob >= 0.8 ? 'var(--good)' : prob >= 0.6 ? 'var(--warning)' : 'var(--critical)');
    $('#sc-prob-sub').textContent = prob >= 0.85 ? 'Strong — most market paths keep the plan funded to 95' : prob >= 0.7 ? 'Reasonable — worth stress-testing spending and timing' : prob >= 0.5 ? 'Fragile — small changes to spending or retirement age matter a lot' : 'At risk — this is the conversation to have with an advisor';
    $('#sc-median-ret').textContent = fmt$(P[50][ret - age]);
    $('#sc-p10-95').textContent = fmt$(P[10][years]);
    const medDep = depleted.length ? depleted.sort((a, b) => a - b)[Math.floor(depleted.length / 2)] : null;
    $('#sc-deplete').textContent = medDep ? `In failing paths, funds typically run out around age ${medDep}` : 'Funds last to 95 in every simulated path';
    const tb = $('#sc-table tbody'); tb.innerHTML = xs.map((x, i) => (i % 5 === 0 || i === years ? `<tr><td>${x}${x === ret ? ' (retire)' : ''}</td><td>${full$(P[10][i])}</td><td>${full$(P[25][i])}</td><td>${full$(P[50][i])}</td><td>${full$(P[75][i])}</td><td>${full$(P[90][i])}</td></tr>` : '')).join('');
    $('#sc-summary').textContent = `${ALLOC[alloc].label} mix (${(mu * 100).toFixed(1)}% avg return, ${(sd * 100).toFixed(0)}% volatility), ${N.toLocaleString()} paths, ${inf * 100}% inflation.`;
    window.__labScenario = { age, ret, sav, con, spend, ss, prob, medianRet: P[50][ret - age], alloc };
  }
  function countTo(el, end, suf) { if (reduce) { el.textContent = end + suf; return; } const start = parseInt(el.textContent) || 0; const t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / 700); el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

  /* ============================================ Social Security */
  const ssBen = bindRange('ss-benefit', full$), ssClaim = bindRange('ss-claim');
  const ssChart = makeChart('ss-chart');
  [ssBen, ssClaim].forEach((el) => el.addEventListener('input', () => runSS(false)));
  $('#ss-table-toggle').addEventListener('click', () => { const t = $('#ss-table'); t.classList.toggle('is-open'); $('#ss-table-toggle').textContent = t.classList.contains('is-open') ? 'Hide table' : 'Show table'; });
  function ssFactor(claimAge, fra = 67) {
    const months = Math.round((claimAge - fra) * 12);
    if (months < 0) { const m = -months; return 1 - Math.min(m, 36) * (5 / 900) - Math.max(0, m - 36) * (5 / 1200); }
    return 1 + Math.min(months, 36) * (2 / 300);
  }
  function runSS(animate = true) {
    const fra = +ssBen.value, claim = +ssClaim.value; const ages = Array.from({ length: 95 - 62 + 1 }, (_, i) => 62 + i);
    const cum = (c) => { let tot = 0; const f = ssFactor(c); return ages.map((a) => { if (a >= c) tot += fra * f * 12; return tot; }); };
    const scenarios = [62, 67, 70]; if (!scenarios.includes(claim)) scenarios.push(claim);
    scenarios.sort((a, b) => a - b);
    const colors = { 62: '#9ec5f4', 67: '#2a78d6', 70: '#0d366b' };
    const st = ssChart.st; st.xs = ages; st.marker = null; st.labelX = 'Age';
    st.bands = []; st.series = scenarios.map((c) => ({ data: cum(c), color: c === claim && ![62, 67, 70].includes(c) ? '#d9a057' : colors[c], width: c === claim ? 3 : 2, dash: c === claim ? null : [6, 4], label: `Claim at ${c}` }));
    st.tipRows = (i) => st.series.map((s) => `${s.label}: ${fmt$(s.data[i])}`);
    animate ? ssChart.animate() : ssChart.draw(1);
    $('#ss-legend').innerHTML = st.series.map((s) => `<span><i style="background:${s.color}"></i>${s.label}${s.width === 3 ? ' (selected)' : ''}</span>`).join('');
    const f = ssFactor(claim); $('#ss-monthly').textContent = full$(fra * f); $('#ss-pct').textContent = (f >= 1 ? '+' : '') + ((f - 1) * 100).toFixed(0) + '%';
    $('#ss-pct-sub').textContent = f >= 1 ? 'more than the full retirement age benefit' : 'less than the full retirement age benefit';
    const me = cum(claim), base = cum(claim < 67 ? 67 : 67); let be = null;
    if (claim !== 67) { for (let i = 0; i < ages.length; i++) { const ahead = claim < 67 ? base[i] > me[i] : me[i] > base[i]; if (ahead) { be = ages[i]; break; } } }
    $('#ss-breakeven').textContent = claim === 67 ? '—' : be ? 'Age ' + be : 'After 95';
    $('#ss-breakeven-sub').textContent = claim === 67 ? 'Claiming at full retirement age' : claim < 67 ? `Claiming at 67 catches up around age ${be || '95+'}` : `Waiting overtakes claiming at 67 around age ${be || '95+'}`;
    const tb = $('#ss-table tbody'); $('#ss-table thead').innerHTML = `<tr><th>Age</th>${st.series.map((s) => `<th>${s.label}</th>`).join('')}</tr>`;
    tb.innerHTML = ages.map((a, i) => (i % 5 === 0 || a === 95 ? `<tr><td>${a}</td>${st.series.map((s) => `<td>${full$(s.data[i])}</td>`).join('')}</tr>` : '')).join('');
  }

  /* ================================================ Readiness quiz */
  const QUESTIONS = [
    { q: 'Where are you in the journey?', opts: [['Building — 20s to 40s', 0], ['Peak earning years', 0], ['Within 10 years of retirement', 0], ['Already retired', 0]], key: 'stage', weight: 0 },
    { q: 'Roughly how much have you saved for retirement, relative to your annual income?', sub: 'Include 401(k)s, IRAs and investment accounts.', opts: [['Less than 1× my income', 1], ['1–3×', 2], ['3–6×', 3], ['6–10×', 4], ['More than 10×', 5]], key: 'saved', weight: 25 },
    { q: 'What share of your income do you save each year?', opts: [['Under 5%', 1], ['5–10%', 2], ['10–15%', 3], ['15% or more', 5]], key: 'rate', weight: 15 },
    { q: 'How many months of expenses could you cover from cash if income stopped?', opts: [['Less than one', 1], ['1–3 months', 2], ['3–6 months', 4], ['6 months or more', 5]], key: 'cash', weight: 15 },
    { q: 'Do you have a written plan for turning savings into income in retirement?', opts: [['No plan yet', 1], ['A rough idea', 2], ['Yes, but not reviewed recently', 4], ['Yes, reviewed in the last two years', 5]], key: 'plan', weight: 20 },
    { q: 'Are your estate basics in place — a will, powers of attorney and up-to-date beneficiaries?', opts: [['None of these', 1], ['Some of them', 3], ['All, but not reviewed in years', 4], ['All current', 5]], key: 'estate', weight: 12 },
    { q: 'When markets fell 20%, what did you do — or what would you do?', opts: [['Sell to stop the losses', 1], ['Worry, but hold', 3], ['Hold to the plan', 5], ['Add to investments', 5]], key: 'behavior', weight: 13 }
  ];
  const quiz = $('#quiz'); let qi = 0; const answers = {};
  function renderQuiz() {
    quiz.innerHTML = `<div class="quiz__progress"><i style="width:${(qi / QUESTIONS.length) * 100}%"></i></div>` + QUESTIONS.map((Q, i) => `<div class="quiz__q${i === qi ? ' is-active' : ''}"><span class="eyebrow">Question ${i + 1} of ${QUESTIONS.length}</span><h3>${h(Q.q)}</h3>${Q.sub ? `<p class="muted small">${h(Q.sub)}</p>` : ''}<div class="quiz__opts">${Q.opts.map((o, j) => `<button type="button" class="quiz__opt${answers[Q.key] === j ? ' is-selected' : ''}" data-q="${i}" data-o="${j}"><span>${h(o[0])}</span>${I.arrow}</button>`).join('')}</div><div class="quiz__nav"><button type="button" class="btn btn--ghost btn--sm" data-prev ${i === 0 ? 'disabled style="opacity:.3"' : ''}>Back</button><span class="muted small" style="align-self:center">Select an answer to continue</span></div></div>`).join('');
  }
  quiz.addEventListener('click', (e) => {
    const o = e.target.closest('.quiz__opt'); if (o) { answers[QUESTIONS[+o.dataset.q].key] = +o.dataset.o; o.classList.add('is-selected'); setTimeout(() => { qi++; if (qi >= QUESTIONS.length) showResult(); else renderQuiz(); }, 260); return; }
    if (e.target.closest('[data-prev]')) { qi = Math.max(0, qi - 1); renderQuiz(); }
  });
  function showResult() {
    let score = 0, wsum = 0; const weak = [];
    QUESTIONS.forEach((Q) => { if (!Q.weight) return; const v = Q.opts[answers[Q.key]][1]; score += (v / 5) * Q.weight; wsum += Q.weight; if (v <= 2) weak.push(Q.key); });
    score = Math.round((score / wsum) * 100);
    const stage = QUESTIONS[0].opts[answers.stage][0];
    const notes = {
      saved: { t: 'Savings are below common benchmarks for your stage', d: 'Rules of thumb are only starting points, but a savings gap is easier to close early. A written plan turns “how much is enough” into a number.', link: ['Estimate my retirement income', 'planning-lab.html#scenario', 'Model it in the Scenario Lab'] },
      rate: { t: 'Your savings rate has room to grow', d: 'Small automatic increases each year compound quietly. Tax-aware account selection can make each dollar saved go further.', link: ['Tax alpha strategies', 'skill.html#tax-alpha', 'How we think about taxes'] },
      cash: { t: 'A thin cash cushion makes every surprise a portfolio decision', d: 'Three to six months of expenses in cash keeps a bad month from becoming a forced sale in a bad market.', link: ['The retirement expenses nobody warns you about', 'insights/the-retirement-expenses-nobody-warns-you-about.html', 'Read the insight'] },
      plan: { t: 'No written income plan yet', d: 'Turning savings into a paycheck is a different discipline from accumulating it. This is the core of our retirement income work.', link: ['Retirement income specialists', 'skill.html#retirement-income', 'See how it works'] },
      estate: { t: 'Estate basics need attention', d: 'Beneficiary designations override wills, and digital assets are easy to forget. A short review with your attorney closes most gaps.', link: ['Protecting your digital assets', 'insights/protecting-your-digital-assets.html', 'Read the insight'] },
      behavior: { t: 'Market drops are your biggest risk — not the market itself', d: 'Investors who react to downturns have historically accumulated far less wealth. Hedged or buffered portfolios and a steady advisor both help.', link: ['What to do when the stock market drops', 'insights/what-to-do-when-the-stock-market-drops.html', 'Read the insight'] }
    };
    const strengths = QUESTIONS.filter((Q) => Q.weight && Q.opts[answers[Q.key]][1] >= 4).map((Q) => Q.key);
    const strengthNotes = { saved: 'Solid savings relative to income', rate: 'A healthy savings rate', cash: 'A real cash cushion', plan: 'A written retirement income plan', estate: 'Estate basics in place', behavior: 'Steady hands when markets fall' };
    const root = document.body.dataset.root || '';
    quiz.innerHTML = `<div class="result">
      <div class="gauge"><svg viewBox="0 0 200 120"><defs><linearGradient id="gaugeGrad" x1="0" x2="1"><stop offset="0" stop-color="#d9a057"/><stop offset="1" stop-color="#2fb1b8"/></linearGradient></defs><path class="gauge__track" d="M20 110 A80 80 0 0 1 180 110"/><path class="gauge__fill" id="gauge-fill" d="M20 110 A80 80 0 0 1 180 110"/></svg><div class="gauge__val"><strong id="gauge-num">0</strong><span>Readiness pulse</span></div></div>
      <div>
        <span class="eyebrow">${h(stage)}</span>
        <h3>${score >= 80 ? 'You’re in strong shape — now protect it.' : score >= 60 ? 'A good foundation with a few gaps worth closing.' : 'There’s real work to do — and a clear place to start.'}</h3>
        <div class="result__items">
          ${strengths.slice(0, 2).map((k) => `<div class="result__item good"><span class="ico">${I.check}</span><div><strong>${strengthNotes[k]}</strong></div></div>`).join('')}
          ${weak.slice(0, 3).map((k) => `<div class="result__item warn"><span class="ico">${I.spark}</span><div><strong>${h(notes[k].t)}</strong>${h(notes[k].d)} <a href="${root + notes[k].link[1]}" style="color:var(--navy-700);font-weight:600">${h(notes[k].link[2])} →</a></div></div>`).join('')}
          ${!weak.length ? `<div class="result__item good"><span class="ico">${I.check}</span><div><strong>No major gaps flagged</strong>The next step is stress-testing the plan against bad market sequences and taxes.</div></div>` : ''}
        </div>
        <div class="btn-row mt-3"><button type="button" class="btn btn--gold" data-open-assistant="I just completed the readiness pulse and scored ${score}/100. Can you arrange an introduction with an advisor?">Discuss with an advisor</button><button type="button" class="btn btn--ghost" id="quiz-restart">Start over</button></div>
        <p class="small muted mt-2">This pulse is educational and illustrative. It is not financial advice and does not consider your complete situation.</p>
      </div></div>`;
    requestAnimationFrame(() => { $('#gauge-fill').style.strokeDashoffset = 251 - (251 * score) / 100; countTo($('#gauge-num'), score, ''); });
    $('#quiz-restart').addEventListener('click', () => { qi = 0; Object.keys(answers).forEach((k) => delete answers[k]); renderQuiz(); });
  }
  renderQuiz();
  showTab(initial, false);
})();
