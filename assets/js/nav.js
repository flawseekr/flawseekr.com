// Mobile nav toggle — a real button (not the old hidden-checkbox + <label>
// trick, which a keyboard user could never reach or open).
(function () {
  var btn = document.getElementById('nav-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
  });
})();
