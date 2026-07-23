---
layout: default
title: Search
permalink: /search/
description: Search all Flawseekr articles.
---
<div class="wrap archive">
  <header class="archive__header archive__header--articles">
    <p class="eyebrow">// search</p>
    <h1 class="archive__title">Search articles</h1>
    <p class="muted">Filter by title, summary, author, category or tag.</p>

    <form class="searchbar" id="search-form" role="search" onsubmit="return false;">
      <svg class="searchbar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="search" id="search-input" class="searchbar__input" placeholder="Type to search…" aria-label="Search articles" autocomplete="off">
    </form>
  </header>

  <p class="search-count muted" id="search-count" aria-live="polite"></p>
  <div class="card-grid" id="search-results"></div>
  <p class="muted" id="search-empty" hidden>No articles match your search.</p>
</div>

<script>
  window.SEARCH_JSON_URL = "{{ '/search.json' | relative_url }}";
  window.BASEURL = "{{ site.baseurl }}";
</script>
<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>
