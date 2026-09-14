# frozen_string_literal: true
#
# slug_from_title.rb
# --------------------------------------------------------------------------
# _config.yml sets the `blog` collection's permalink to `/blog/:slug/`.
# Jekyll's `:slug` placeholder reads `data["slug"]` — but the `blog`
# collection isn't Jekyll's special `posts` collection, so that field is
# never derived from the post's `title:`; it just falls back to the
# filename. This sets it explicitly from the title instead, so the URL
# always matches what the post is actually titled (lowercased,
# dash-separated), not what the file happens to be named.
#
# Runs as a :highest-priority generator — before archive_generator.rb,
# jekyll-sitemap, or anything else reads a post's `url`.
# --------------------------------------------------------------------------

module Flawseekr
  class SlugFromTitle < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      posts = site.collections["blog"]&.docs || []
      posts.each do |post|
        next if post.data["title"].to_s.empty?

        post.data["slug"] = Jekyll::Utils.slugify(post.data["title"])
      end
    end
  end
end
