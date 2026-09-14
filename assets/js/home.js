// Home landing behaviour: reveal-on-view, panel jump dots, and keyboard
// arrow navigation between full-page panels.
// Uses IntersectionObserver (async, no scroll listeners) and respects
// prefers-reduced-motion. All progressive: without JS the panels still scroll
// and snap, and the reveal elements are shown by the observer.
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Reveal panel-2 content as it enters the viewport (once each) ---
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);            // stop watching once shown
          }
        });
      }, { threshold: 0.2 });
      reveals.forEach(function (el) { revObs.observe(el); });
    }
  }

  // --- Panels + dots ---
  var dots = [].slice.call(document.querySelectorAll('.page-dot'));
  var panels = dots.map(function (d) { return document.getElementById(d.dataset.target); });
  var current = 0;

  function goTo(i) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    if (!panels[i]) return;
    panels[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    current = i;
  }

  // Dots reflect the active panel and jump on click.
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });

  if ('IntersectionObserver' in window && panels.length) {
    var activeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var i = panels.indexOf(e.target);
          if (i === -1) return;
          current = i;
          dots.forEach(function (d, j) {
            d.classList.toggle('is-active', j === i);
            if (j === i) d.setAttribute('aria-current', 'true');
            else d.removeAttribute('aria-current');
          });
        }
      });
    }, { threshold: 0.5 });
    panels.forEach(function (p) { if (p) activeObs.observe(p); });
  }

  // --- Keyboard: Arrow / Page keys move one panel at a time ---
  // Only while focus is on the page itself (or a dot) — never while focus is
  // on a link/button elsewhere, so this can't hijack a keyboard user's normal
  // Tab-driven navigation. Home/End are left alone entirely: they carry
  // strong native "jump to top/bottom of page" semantics that a two-panel
  // landing page has no business overriding.
  var locked = false;
  function step(dir) {
    if (locked) return;
    var next = current + dir;
    if (next < 0 || next >= panels.length) return;   // let the browser do its thing at the ends
    locked = true;
    goTo(next);
    setTimeout(function () { locked = false; }, reduce ? 120 : 650);
  }

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var scoped = t === document.body || dots.indexOf(t) !== -1;
    if (!scoped) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
  });
})();
