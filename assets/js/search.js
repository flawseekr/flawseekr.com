// Client-side article search. Fetches /search.json once, filters on input.
// Reads an initial query from the ?q= param (so the /blog search bar can
// deep-link here) and keeps the URL in sync as you type.
(function () {
  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var count   = document.getElementById('search-count');
  var empty   = document.getElementById('search-empty');
  if (!input || !results) return;

  var data = [];
  var BASE = window.BASEURL || '';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function slug(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  }

  function haystack(a) {
    return [a.title, a.description, a.author, a.author_name, a.category]
      .concat(a.tags || [])
      .join(' ')
      .toLowerCase();
  }

  function card(a) {
    var tags = (a.tags || []).map(function (t) {
      return '<a class="tagchip" href="' + BASE + '/tag/' + slug(t) + '/">#' + esc(t) + '</a>';
    }).join('');
    var cat = a.category
      ? '<a class="tagchip tagchip--cat" href="' + BASE + '/category/' + slug(a.category) + '/">' + esc(a.category) + '</a>'
      : '';
    var byline = a.author
      ? '<a class="byline" href="' + BASE + '/@' + esc(a.author) + '/">@' + esc(a.author) + '</a><span class="dot">·</span>'
      : '';
    return '' +
      '<article class="card article-card">' +
        cat +
        '<h3 class="article-card__title"><a href="' + esc(a.url) + '">' + esc(a.title) + '</a></h3>' +
        '<p class="article-card__excerpt">' + esc(a.description) + '</p>' +
        '<div class="article-card__meta">' + byline +
          '<time>' + esc(a.date) + '</time>' +
          (a.read_time ? '<span class="dot">·</span><span>' + a.read_time + ' min</span>' : '') +
        '</div>' +
        (tags ? '<div class="taglist">' + tags + '</div>' : '') +
      '</article>';
  }

  function render(q) {
    var query = q.trim().toLowerCase();
    var matches = query
      ? data.filter(function (a) { return haystack(a).indexOf(query) !== -1; })
      : data;

    results.innerHTML = matches.map(card).join('');
    empty.hidden = matches.length !== 0;

    if (count) {
      count.textContent = query
        ? matches.length + ' result' + (matches.length === 1 ? '' : 's') + ' for "' + q.trim() + '"'
        : data.length + ' article' + (data.length === 1 ? '' : 's');
    }
  }

  function syncUrl(q) {
    var url = new URL(window.location);
    if (q.trim()) url.searchParams.set('q', q.trim());
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  var initial = new URLSearchParams(window.location.search).get('q') || '';

  fetch(window.SEARCH_JSON_URL)
    .then(function (r) { return r.json(); })
    .then(function (json) {
      data = json;
      if (initial) input.value = initial;
      render(input.value);
    })
    .catch(function () {
      if (count) count.textContent = 'Search index failed to load.';
    });

  var t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { render(input.value); syncUrl(input.value); }, 120);
  });
})();
