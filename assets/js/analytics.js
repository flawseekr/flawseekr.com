// Loads Google Analytics only after consent is granted (see consent.js).
// Nothing here runs at all unless site.google_analytics is set AND the
// visitor has accepted — no script tag, no cookie, no request to Google.
(function () {
  if (!window.GA_MEASUREMENT_ID) return;
  var loaded = false;

  function load() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', window.GA_MEASUREMENT_ID);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
    document.head.appendChild(s);
  }

  if (window.__consent && window.__consent.get() === 'granted') load();
  document.addEventListener('consentchange', function (e) {
    if (e.detail === 'granted') load();
  });
})();
