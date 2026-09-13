/* MLX main.js: Lenis + GSAP ScrollTrigger wiring */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  var reduced = false;
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { reduced = false; }

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -70 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }
  document.querySelectorAll('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id && id.charAt(0) === '#') {
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); scrollToEl(el); closeMobile(); }
      }
    });
  });

  /* ---------- nav state + mobile menu ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.getElementById('nav-burger');
  var mobile = document.getElementById('nav-mobile');
  function onScrollNav() { nav.classList.toggle('is-scrolled', (window.scrollY || document.documentElement.scrollTop) > 40); }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  function closeMobile() { mobile.classList.remove('is-open'); }
  burger.addEventListener('click', function () { mobile.classList.toggle('is-open'); });
  mobile.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobile);
  });

  /* ---------- video background slot ----------
   * If assets/videos/MLX-scroll-background.mp4 is present, swap it in and
   * scrub playback with scroll. Otherwise the procedural canvas stays.
   */
  var video = document.getElementById('bg-video');
  var canvas = document.getElementById('bg-canvas');
  var VIDEO_SRC = 'assets/videos/MLX-scroll-background.mp4';
  fetch(VIDEO_SRC, { method: 'HEAD' })
    .then(function (r) { return r.ok; })
    .catch(function () { return false; })
    .then(function (ok) {
      if (!ok) return;
      video.src = VIDEO_SRC;
      video.addEventListener('loadedmetadata', function onMeta() {
        video.removeEventListener('loadedmetadata', onMeta);
        video.classList.add('is-active');
        canvas.classList.add('is-hidden');
        var dur = video.duration || 14;
        ScrollTrigger.create({
          trigger: document.body,
          start: 0,
          end: function () { return document.documentElement.scrollHeight - window.innerHeight; },
          scrub: 0.5,
          onUpdate: function (self) {
            video.currentTime = self.progress * dur * 0.999;
          }
        });
      });
    });

  /* ---------- scroll reveals ---------- */
  if (!reduced) {
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    /* subtle parallax on section heads */
    gsap.utils.toArray('.section-head').forEach(function (el) {
      gsap.fromTo(el, { y: 40 }, {
        y: -20, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.style.opacity = 1; el.style.transform = 'none';
    });
  }

  /* ---------- engine: pinned six-stage reveal ---------- */
  var stages = gsap.utils.toArray('.stage');
  var bars = gsap.utils.toArray('.engine__funnel-bar');
  function setStage(idx) {
    stages.forEach(function (s, i) {
      var on = i === idx;
      s.classList.toggle('is-active', on);
      gsap.to(s, {
        opacity: on ? 1 : 0, y: on ? 0 : (i < idx ? -28 : 28),
        duration: 0.55, ease: 'power3.out', overwrite: 'auto'
      });
    });
    bars.forEach(function (b, i) { b.classList.toggle('is-active', i <= idx); });
  }
  setStage(0);

  ScrollTrigger.create({
    trigger: '#engine',
    start: 'top top',
    end: '+=' + (stages.length * 480),
    pin: '#engine-pin',
    scrub: true,
    anticipatePin: 1,
    onUpdate: function (self) {
      var idx = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
      setStage(idx);
    }
  });

  /* fade hero content slightly as it leaves */
  if (!reduced) {
    gsap.to('.hero__inner', {
      opacity: 0.15, y: -60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: 1 }
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
