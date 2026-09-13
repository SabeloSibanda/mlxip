/* MLX contact page: navigation, reveals, form to hello@mlxip.com */
(function () {
  var reduced = false;
  try { reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { reduced = false; }

  /* ---------- nav state + mobile menu ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.getElementById('nav-burger');
  var mobile = document.getElementById('nav-mobile');
  function onScrollNav() { nav.classList.toggle('is-scrolled', (window.scrollY || document.documentElement.scrollTop) > 40); }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  function closeMobile() { mobile.classList.remove('is-open'); }
  burger.addEventListener('click', function () { mobile.classList.toggle('is-open'); });
  mobile.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobile); });

  document.querySelectorAll('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id && id.charAt(0) === '#' && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        closeMobile();
      }
    });
  });

  /* ---------- reveals ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(reveals).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  } else {
    reveals.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ---------- form: intent, validation, submit ---------- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var tech = document.getElementById('intent-tech');
  var chal = document.getElementById('intent-challenge');
  var msgLabel = document.getElementById('msg-label');
  var msgInput = document.getElementById('f-message');
  var INTENT_TEXT = { technology: 'Technology Submission', challenge: 'Infrastructure Challenge' };

  function applyIntent(intent, focus) {
    var on = intent === 'challenge';
    chal.checked = on;
    tech.checked = !on;
    msgLabel.textContent = on ? 'WHAT ARE YOU SOLVING? *' : 'WHAT ARE YOU BRINGING? *';
    msgInput.placeholder = on
      ? 'Describe the challenge: asset, context, and what better intelligence would change.'
      : 'Describe the technology, its stage, and what you are looking for.';
    if (focus) msgInput.focus();
  }

  document.querySelectorAll('[data-intent]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyIntent(btn.getAttribute('data-intent'), true);
      document.getElementById('mail-form').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  var qs = new URLSearchParams(window.location.search);
  applyIntent(qs.get('type') === 'challenge' ? 'challenge' : 'technology', false);

  function setStatus(msg, cls) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status show ' + cls;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
function mailtoFallback() {
    var lines = [
      'Name: ' + form.elements.name.value.trim(),
      'Email: ' + form.elements.email.value.trim(),
      'Company: ' + form.elements.company.value.trim(),
      'Reference: ' + form.elements.reference.value.trim(),
      'Type: ' + INTENT_TEXT[(tech.checked ? 'technology' : 'challenge')],
      '',
      form.elements.message.value.trim()
    ];
    var subject = INTENT_TEXT[(tech.checked ? 'technology' : 'challenge')] + ' | ' + (form.elements.name.value.trim() || 'Website');
    var a = document.createElement('a');
    a.href = 'mailto:hello@mlxip.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.className = 'form-status';

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    if (name.length < 2) { setStatus('Please add your name.', 'err'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('Please add a valid email address.', 'err'); return; }
    if (message.length < 10) { setStatus('Please write a few more words so we can act on it.', 'err'); return; }
    if (form.elements._honey.value) return;

    var intent = tech.checked ? 'technology' : 'challenge';
    var params = new URLSearchParams();
    params.set('name', name);
    params.set('email', email);
    params.set('company', form.elements.company.value.trim());
    params.set('reference', form.elements.reference.value.trim());
    params.set('intent', INTENT_TEXT[intent]);
    params.set('message', message);
    params.set('_replyto', email);
    params.set('_subject', INTENT_TEXT[intent] + ' | ' + name);
    params.set('_template', 'table');
    params.set('_captcha', 'false');
    params.set('_honey', '');

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    fetch('https://formsubmit.co/ajax/hello@mlxip.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: params
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var ok = d && (d.success === true || String(d.success).toLowerCase() === 'true');
        if (ok) {
          form.reset();
          applyIntent(intent, false);
          setStatus('Message sent. Thank you, we will come back to you at ' + email + '.', 'ok');
        } else {
          var reason = d && d.message ? ' (' + d.message + ')' : '';
          setStatus('Direct send unavailable right now' + reason + '. Opening your email client instead.', 'err');
          mailtoFallback();
        }
      })
      .catch(function () {
        setStatus('Could not connect to the form service. Opening your email client instead.', 'err');
        mailtoFallback();
      })
      .finally(function () { btn.disabled = false; btn.textContent = 'Send Message'; });
  });

  window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();