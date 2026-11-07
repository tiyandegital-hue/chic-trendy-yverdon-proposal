/* Chic & Trendy — site JS. No external requests. All state is local. */
(function () {
  'use strict';

  /* Business name — ONE swappable constant (also the build-time constant in build.py). */
  var SALON_NAME = 'Chic & Trendy';
  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-salon-name]').forEach(function (el) {
    el.textContent = SALON_NAME;
  });
  var yearEl = document.getElementById('foot-year');
  if (yearEl) yearEl.textContent = '2026';

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('main-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Reveal on scroll (content is visible without JS) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Cookie banner (essential-only; no trackers on this site) ---------- */
  var banner = document.getElementById('cookie-banner');
  var KEY = 'ct-cookie-consent';
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: banner simply reappears */ } }
  if (banner && !stored()) banner.classList.add('show');
  var accept = document.getElementById('cookie-accept');
  if (accept) accept.addEventListener('click', function () {
    store('accepted'); banner.classList.remove('show');
  });
  /* Cookie-preference toggles on /cookies.html */
  var prefToggle = document.getElementById('pref-cookies');
  if (prefToggle) {
    prefToggle.checked = stored() === 'accepted-prefs';
    prefToggle.addEventListener('change', function () {
      store(prefToggle.checked ? 'accepted-prefs' : 'essential-only');
    });
  }
  var savePrefs = document.getElementById('save-prefs');
  if (savePrefs) savePrefs.addEventListener('click', function () {
    store(prefToggle && prefToggle.checked ? 'accepted-prefs' : 'essential-only');
    savePrefs.textContent = 'Préférences enregistrées';
    setTimeout(function () { savePrefs.textContent = 'Enregistrer mes préférences'; }, 2500);
  });
  var revoke = document.getElementById('revoke-cookies');
  if (revoke) revoke.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (prefToggle) prefToggle.checked = false;
    if (banner) banner.classList.add('show');
  });

  /* ---------- Gallery filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var tiles = document.querySelectorAll('.g-tile');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var f = btn.getAttribute('data-filter');
      tiles.forEach(function (t) {
        t.hidden = !(f === 'toutes' || t.getAttribute('data-cat') === f);
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var ans = document.getElementById(q.getAttribute('aria-controls'));
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      if (ans) ans.hidden = open;
      var plus = q.querySelector('.plus');
      if (plus) plus.textContent = open ? '+' : '−';
    });
  });

  /* ---------- Forms: validation + front-end-only confirmation ---------- */
  function bindForm(formId, successId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var success = document.getElementById(successId);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var valid = true;
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var ok = true;
        if (input.type === 'checkbox') ok = input.checked;
        else if (input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        else if (input.type === 'date') ok = !!input.value;
        else ok = input.value.trim().length > 1;
        if (field) field.classList.toggle('invalid', !ok);
        if (!ok) { valid = false; if (!firstBad) firstBad = input; }
      });
      var consentErr = document.getElementById('consent-error');
      var consentBox = form.querySelector('input[type="checkbox"][required]');
      if (consentErr && consentBox) consentErr.style.display = consentBox.checked ? 'none' : 'block';
      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }
      form.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
    /* Clear the error state as the visitor corrects a field. */
    form.querySelectorAll('[required]').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
      input.addEventListener('change', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });
  }
  bindForm('booking-form', 'booking-success');
  bindForm('contact-form', 'contact-success');

  /* Prefill the booking form when a service link carries ?prestation=… */
  var params = new URLSearchParams(window.location.search);
  var pre = params.get('prestation');
  var sel = document.getElementById('prestation');
  if (pre && sel) {
    Array.prototype.forEach.call(sel.options, function (o) {
      if (o.value === pre) sel.value = pre;
    });
  }
  /* Minimum booking date = today. */
  var dateInput = document.getElementById('date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
})();
