/* ==========================================================================
   Hero canvas: an interactive "current" field. Thousands of particles drift
   along a slowly evolving noise field in navy, gold and aqua; the pointer
   bends the current. Pauses off-screen and honours reduced motion.
   ========================================================================== */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- compact 3D simplex noise (Gustavson) --- */
  const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  const p = new Uint8Array(256); for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = perm[i] % 12; }
  const F3 = 1 / 3, G3 = 1 / 6;
  function noise3(xin, yin, zin) {
    let n0, n1, n2, n3;
    const s = (xin + yin + zin) * F3; const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
    const t = (i + j + k) * G3; const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) { if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; } else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; } }
    else { if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; } else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; } else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3, x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3, x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    const gi0 = permMod12[ii + perm[jj + perm[kk]]], gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]], gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]], gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0; if (t0 < 0) n0 = 0; else { t0 *= t0; n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0 + grad3[gi0][2] * z0); }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1; if (t1 < 0) n1 = 0; else { t1 *= t1; n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1 + grad3[gi1][2] * z1); }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2; if (t2 < 0) n2 = 0; else { t2 *= t2; n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2 + grad3[gi2][2] * z2); }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3; if (t3 < 0) n3 = 0; else { t3 *= t3; n3 = t3 * t3 * (grad3[gi3][0] * x3 + grad3[gi3][1] * y3 + grad3[gi3][2] * z3); }
    return 32 * (n0 + n1 + n2 + n3);
  }

  /* --- particles --- */
  let W = 0, H = 0, dpr = 1, parts = [], running = false, t = 0;
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
  const palette = [
    { c: '235,185,116', w: 0.55 },  // gold
    { c: '90,209,214', w: 0.15 },   // aqua
    { c: '160,196,224', w: 0.30 }   // pale navy
  ];
  const pick = () => { const r = Math.random(); let acc = 0; for (const p of palette) { acc += p.w; if (r <= acc) return p.c; } return palette[0].c; };

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect(); W = Math.max(1, Math.floor(r.width)); H = Math.max(1, Math.floor(r.height));
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(1600, Math.floor((W * H) / 900));
    parts = Array.from({ length: n }, spawn);
    ctx.fillStyle = 'rgba(4,16,28,1)'; ctx.fillRect(0, 0, W, H);
  }
  function spawn() { return { x: Math.random() * W, y: Math.random() * H, px: 0, py: 0, life: Math.random() * 240, c: pick(), a: 0.25 + Math.random() * 0.55, s: 0.6 + Math.random() * 1.2 }; }

  function step() {
    if (!running) return;
    t += 0.0022;
    ctx.fillStyle = 'rgba(4,16,28,0.075)'; ctx.fillRect(0, 0, W, H);
    ctx.lineCap = 'round';
    const scale = 0.0016;
    for (const q of parts) {
      q.px = q.x; q.py = q.y;
      let ang = noise3(q.x * scale, q.y * scale, t) * Math.PI * 2.2;
      // pointer bends the current
      const dx = q.x - mouse.x, dy = q.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 48000) { const d = Math.sqrt(d2) + 0.001; const f = (1 - d / 220); ang += Math.atan2(dy, dx) * f * 0.9; q.x += (dx / d) * f * 2.2; q.y += (dy / d) * f * 2.2; }
      q.x += Math.cos(ang) * q.s; q.y += Math.sin(ang) * q.s;
      q.life -= 1;
      if (q.x < -10 || q.x > W + 10 || q.y < -10 || q.y > H + 10 || q.life < 0) { Object.assign(q, spawn(), { life: 160 + Math.random() * 240 }); continue; }
      ctx.strokeStyle = `rgba(${q.c},${q.a})`; ctx.lineWidth = q.s * 0.9;
      ctx.beginPath(); ctx.moveTo(q.px, q.py); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    requestAnimationFrame(step);
  }

  function start() { if (running) return; running = true; requestAnimationFrame(step); }
  function stop() { running = false; }

  resize();
  window.addEventListener('resize', () => { clearTimeout(window.__hr); window.__hr = setTimeout(resize, 150); });
  canvas.parentElement.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  canvas.parentElement.addEventListener('touchmove', (e) => { const r = canvas.getBoundingClientRect(); const tt = e.touches[0]; mouse.x = tt.clientX - r.left; mouse.y = tt.clientY - r.top; }, { passive: true });

  if (reduce) { // draw a single static frame set
    running = true; for (let i = 0; i < 90; i++) { t += 0.0022; ctx.fillStyle = 'rgba(4,16,28,0.075)'; ctx.fillRect(0, 0, W, H); for (const q of parts) { q.px = q.x; q.py = q.y; const ang = noise3(q.x * 0.0016, q.y * 0.0016, t) * Math.PI * 2.2; q.x += Math.cos(ang) * q.s; q.y += Math.sin(ang) * q.s; ctx.strokeStyle = `rgba(${q.c},${q.a})`; ctx.lineWidth = q.s * 0.9; ctx.beginPath(); ctx.moveTo(q.px, q.py); ctx.lineTo(q.x, q.y); ctx.stroke(); } } running = false; return;
  }
  const io = new IntersectionObserver((en) => { en[0].isIntersecting ? start() : stop(); }, { threshold: 0.05 });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : (io.takeRecords(), start()); });
})();
