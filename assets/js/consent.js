// Minimal consent gate for the two third-party, cookie-setting embeds on
// this site (Google Analytics, Disqus). Nothing analytics/comments-related
// loads until the visitor opts in here — see analytics.js and comments.js.
(function () {
  var KEY = 'flawseekr-consent';

  window.__consent = {
    get: function () {
      try { return localStorage.getItem(KEY); } catch (e) { return null; }
    },
    set: function (value) {
      try { localStorage.setItem(KEY, value); } catch (e) {}
      document.dispatchEvent(new CustomEvent('consentchange', { detail: value }));
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('consent-banner');
    if (!banner || window.__consent.get()) return;

    banner.hidden = false;
    var accept = document.getElementById('consent-accept');
    var decline = document.getElementById('consent-decline');
    if (accept) accept.addEventListener('click', function () {
      window.__consent.set('granted');
      banner.hidden = true;
    });
    if (decline) decline.addEventListener('click', function () {
      window.__consent.set('denied');
      banner.hidden = true;
    });
  });
})();
