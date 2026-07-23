// Disqus, lazy-loaded: only fetches embed.js once #disqus_thread nears the
// viewport (IntersectionObserver), and only after consent is granted (see
// consent.js) — visitors who never scroll to comments never load Disqus at
// all, and visitors who haven't opted in get a button instead of a silent
// third-party request.
(function () {
  var el = document.getElementById('disqus_thread');
  if (!el) return;

  var shortname = el.getAttribute('data-disqus-shortname');
  var pageUrl = el.getAttribute('data-page-url');
  var pageId = el.getAttribute('data-page-id');
  var loaded = false;

  function inject() {
    if (loaded) return;
    loaded = true;
    el.innerHTML = '';
    window.disqus_config = function () {
      this.page.url = pageUrl;
      this.page.identifier = pageId;
    };
    var s = document.createElement('script');
    s.src = 'https://' + shortname + '.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (document.head || document.body).appendChild(s);
  }

  function showConsentPrompt() {
    el.innerHTML =
      '<p class="comments__prompt muted">Comments are hosted by Disqus, a third party that sets its own cookies.</p>' +
      '<button type="button" class="btn btn--ghost" id="comments-enable">Load comments</button>';
    document.getElementById('comments-enable').addEventListener('click', function () {
      if (window.__consent) window.__consent.set('granted');
      inject();
    });
  }

  function onVisible() {
    if (window.__consent && window.__consent.get() === 'granted') {
      inject();
    } else {
      showConsentPrompt();
    }
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          onVisible();
          io.disconnect();
        }
      });
    }, { rootMargin: '200px 0px' });
    io.observe(el);
  } else {
    onVisible();
  }
})();
