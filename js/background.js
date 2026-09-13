/* ============ MLX procedural scroll-scrubbed background ============
 * Three visual phases blended by global scroll progress:
 *   0.00-0.33  HERO: dusk dam and reservoir, layered ridges, water, amber horizon signal
 *   0.33-0.66  SIGNAL: abstract flowing data light, contour waves in the accent color
 *   0.66-1.00  ENVIRONMENT: perspective grid with glowing nodes, energy-infrastructure feel
 * If assets/videos/MLX-scroll-background.mp4 exists, main.js swaps to the video
 * and this canvas is hidden. Rendering continues either way.
 */
(function () {
  var canvas = document.getElementById('bg-canvas');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var reduced = false;
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { reduced = false; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var ACCENT = '232,162,60';
  function smooth(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }
  function progress() {
    var sy = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? smooth(Math.min(1, Math.max(0, sy / max))) : 0;
  }

  /* ---- phase weights ---- */
  function weights(p) {
    var w0 = 1 - smooth((p - 0.20) / 0.18);   // hero fades out  .20–.38
    var w2 = smooth((p - 0.62) / 0.18);       // env fades in    .62–.80
    var w1 = Math.max(0, 1 - w0 - w2);        // signal between
    return [w0, w1, w2];
  }

  /* ---- deterministic pseudo-random ---- */
  function prand(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ================= PHASE 0: hero, dusk dam and reservoir ================= */
  function drawHero(t, a) {
    if (a <= 0.004) return;
    ctx.save(); ctx.globalAlpha = a;
    // dusk sky
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#070A0E'); sky.addColorStop(0.55, '#0B1119');
    sky.addColorStop(0.78, '#17202B'); sky.addColorStop(1, '#0A0D10');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // amber horizon glow
    var hy = H * 0.66;
    var glow = ctx.createRadialGradient(W * 0.62, hy, 0, W * 0.62, hy, W * 0.55);
    glow.addColorStop(0, 'rgba(' + ACCENT + ',0.20)'); glow.addColorStop(1, 'rgba(' + ACCENT + ',0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    // layered ridge silhouettes (drift slowly)
    var layers = [
      { base: 0.60, amp: 0.055, f: 1.6, col: 'rgba(24,31,40,0.85)' },
      { base: 0.655, amp: 0.045, f: 2.3, col: 'rgba(17,22,29,0.92)' },
      { base: 0.71, amp: 0.038, f: 3.1, col: 'rgba(12,16,21,0.96)' }
    ];
    layers.forEach(function (L, li) {
      ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 8) {
        var u = x / W;
        var y = H * (L.base - Math.abs(Math.sin(u * Math.PI * L.f + li * 2.1 + t * 0.008)) * L.amp
          - Math.sin(u * 19 + li * 7) * L.amp * 0.22);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath();
      ctx.fillStyle = L.col; ctx.fill();
    });
    // water band
    var wy = H * 0.72;
    var wat = ctx.createLinearGradient(0, wy, 0, H);
    wat.addColorStop(0, 'rgba(20,27,35,0.9)'); wat.addColorStop(1, 'rgba(7,9,12,1)');
    ctx.fillStyle = wat; ctx.fillRect(0, wy, W, H - wy);
    // reflected signal shimmer
    for (var i = 0; i < 26; i++) {
      var ry = wy + 6 + i * (H - wy) / 26;
      var rw = (26 + prand(i) * 90) * (1 - i / 34);
      var cx = W * 0.62 + Math.sin(t * 0.0004 + i) * 10;
      ctx.fillStyle = 'rgba(' + ACCENT + ',' + (0.10 * (1 - i / 26)) + ')';
      ctx.fillRect(cx - rw / 2, ry, rw, 1);
    }
    // contour prediction lines over the ridges (data as light)
    ctx.strokeStyle = 'rgba(' + ACCENT + ',0.16)'; ctx.lineWidth = 1;
    for (var c = 0; c < 5; c++) {
      ctx.beginPath();
      var base = H * (0.52 + c * 0.045);
      for (var x2 = 0; x2 <= W; x2 += 10) {
        var u2 = x2 / W;
        var y2 = base + Math.sin(u2 * 7 + c * 1.7 + t * 0.0012) * 8 + Math.sin(u2 * 23 + c) * 3;
        x2 === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ================= PHASE 1: signal, flowing data light ================= */
  function drawSignal(t, a) {
    if (a <= 0.004) return;
    ctx.save(); ctx.globalAlpha = a;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#06080B'); g.addColorStop(0.5, '#0A0E13'); g.addColorStop(1, '#07090C');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // flowing horizontal signal lines
    var N = 34;
    for (var i = 0; i < N; i++) {
      var p = prand(i), p2 = prand(i + 100);
      var yBase = H * (0.12 + 0.76 * p);
      var speed = 0.00018 + p2 * 0.00025;
      var alpha = 0.05 + p2 * 0.16;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 14) {
        var u = x / W;
        var y = yBase
          + Math.sin(u * 5 + t * speed * 6 + i * 1.9) * (10 + p * 26)
          + Math.sin(u * 17 + t * speed * 11 + i) * 6;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      var hot = p2 > 0.86;
      ctx.strokeStyle = hot ? 'rgba(' + ACCENT + ',' + (alpha + 0.18) + ')'
                            : 'rgba(' + ACCENT + ',' + alpha * 0.55 + ')';
      ctx.lineWidth = hot ? 1.4 : 1;
      ctx.stroke();
    }
    // travelling pulse dots
    for (var j = 0; j < 9; j++) {
      var q = prand(j + 55);
      var yB = H * (0.15 + 0.7 * q);
      var u3 = ((t * (0.00002 + q * 0.00003) + q) % 1);
      var x3 = u3 * W;
      var y3 = yB + Math.sin(u3 * 5 + t * 0.001 + j * 1.9) * (10 + q * 26);
      var rg = ctx.createRadialGradient(x3, y3, 0, x3, y3, 26);
      rg.addColorStop(0, 'rgba(' + ACCENT + ',0.5)'); rg.addColorStop(1, 'rgba(' + ACCENT + ',0)');
      ctx.fillStyle = rg; ctx.fillRect(x3 - 26, y3 - 26, 52, 52);
    }
    ctx.restore();
  }

  /* ================= PHASE 2: environment, infrastructure grid ================= */
  function drawEnvironment(t, a) {
    if (a <= 0.004) return;
    ctx.save(); ctx.globalAlpha = a;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080B0F'); g.addColorStop(1, '#0A0D10');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var horizon = H * 0.42;
    // perspective ground grid
    ctx.strokeStyle = 'rgba(140,155,170,0.10)'; ctx.lineWidth = 1;
    var drift = (t * 0.012) % 44;
    for (var i = 0; i < 22; i++) {
      var z = i * 44 + drift;
      var y = horizon + Math.pow(z / (H * 0.7), 2.2) * (H - horizon);
      if (y > H) continue;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (var k = -14; k <= 14; k++) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + k * W * 0.02, horizon);
      ctx.lineTo(W / 2 + k * W * 0.11, H);
      ctx.strokeStyle = 'rgba(140,155,170,0.07)'; ctx.stroke();
    }
    // horizon glow line
    var hl = ctx.createLinearGradient(0, 0, W, 0);
    hl.addColorStop(0, 'rgba(' + ACCENT + ',0)'); hl.addColorStop(0.55, 'rgba(' + ACCENT + ',0.28)'); hl.addColorStop(1, 'rgba(' + ACCENT + ',0)');
    ctx.fillStyle = hl; ctx.fillRect(0, horizon - 1, W, 2);
    // glowing grid nodes (substation / tower feel)
    for (var n = 0; n < 12; n++) {
      var q = prand(n + 200);
      var x = W * prand(n + 300);
      var depth = (t * 0.008 + q) % 1;
      var y = horizon + Math.pow(depth, 2.2) * (H - horizon);
      var s = 1 + depth * 2.4;
      var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0012 + n * 2.3));
      ctx.fillStyle = 'rgba(' + ACCENT + ',' + (0.5 * tw * depth) + ')';
      ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
      if (depth > 0.6) {
        var rg = ctx.createRadialGradient(x, y, 0, x, y, s * 8);
        rg.addColorStop(0, 'rgba(' + ACCENT + ',' + 0.22 * tw + ')'); rg.addColorStop(1, 'rgba(' + ACCENT + ',0)');
        ctx.fillStyle = rg; ctx.fillRect(x - s * 8, y - s * 8, s * 16, s * 16);
      }
    }
    ctx.restore();
  }

  /* ================= loop ================= */
  var last = 0;
  function frame(now) {
    if (!reduced || now - last > 250) {
      last = now;
      var p = progress();
      var w = weights(p);
      ctx.clearRect(0, 0, W, H);
      // base darkness
      ctx.fillStyle = '#07090C'; ctx.fillRect(0, 0, W, H);
      drawHero(now, w[0]);
      drawSignal(now, w[1]);
      drawEnvironment(now, w[2]);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
