source "https://rubygems.org"

# Jekyll core
gem "jekyll", "~> 4.3"

# Theme / site plugins
group :jekyll_plugins do
  gem "jekyll-seo-tag"     # <meta> tags for search engines & social cards
  gem "jekyll-sitemap"     # sitemap.xml
end

# Windows & JRuby helpers (harmless elsewhere)
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Ruby 3.4+ no longer ships these as default gems
gem "webrick", "~> 1.8"
gem "csv"
gem "base64"
gem "bigdecimal"
