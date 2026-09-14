# frozen_string_literal: true

require "set"

#
# archive_generator.rb
# --------------------------------------------------------------------------
# Generates archive pages that Jekyll cannot produce on its own:
#
#   /@:username       -> author profile + their articles   (layout: author)
#   /category/:cat    -> articles in a category            (layout: category)
#   /tag/:tag         -> articles with a tag               (layout: tag)
#
# It scans the `blog` collection, collects every distinct author,
# category and tag, and emits one page each. Runs at build time, so it works
# locally and on any CI (e.g. GitHub Actions). Note: GitHub Pages' default
# build does NOT run custom plugins — build with Actions or `jekyll build`.
# --------------------------------------------------------------------------

module Flawseekr
  # Base class for a generated archive page.
  class ArchivePage < Jekyll::Page
    def initialize(site, dir, layout, basename, front)
      @site = site
      @base = site.source
      @dir  = dir
      @name = "index.html"

      process(@name)
      @data = {}                # we skip read_yaml, so seed the data hash
      data.merge!(front)
      data["layout"] = layout
      # Explicit permalink so the output path never depends on how Jekyll
      # interprets an "@" in the directory name.
      data["permalink"] ||= "#{dir}/"

      # No physical source file — everything comes from `front` + the layout.
      @content = ""
      Jekyll::Hooks.trigger :pages, :post_init, self
    end
  end

  class ArchiveGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      posts = site.collections["blog"]&.docs || []
      return if posts.empty?

      # Every path we've already committed to producing this build — seeded
      # with real pages/static files so a generated slug can never silently
      # shadow one, and grown as we go so authors/categories/tags can't
      # collide with each other either.
      @claimed_paths = (site.pages + site.static_files).map { |p| clean_path(p.url) }.to_set

      generate_authors(site, posts)
      generate_categories(site, posts)
      generate_tags(site, posts)
    end

    private

    # Normalizes a page/dir path for collision comparisons: strips a
    # trailing "index.html" and any trailing slash.
    def clean_path(path)
      path.to_s.sub(%r{/?index\.html\z}, "").sub(%r{/\z}, "")
    end

    # Registers `dir` as claimed and adds the page, unless something
    # (a real page, or an earlier author/category/tag) already claimed the
    # same path — in which case we log and skip rather than silently
    # duplicating/shadowing it.
    def add_page(site, dir, layout, basename, front)
      key = clean_path(dir)
      if @claimed_paths.include?(key)
        Jekyll.logger.warn "ArchiveGenerator:", "skipping #{dir}/ — already claimed by another page"
        return
      end
      @claimed_paths << key
      site.pages << ArchivePage.new(site, dir, layout, basename, front)
    end

    def generate_authors(site, articles)
      usernames = articles.map { |a| a.data["author"] }.compact.uniq
      # Also include authors defined in _data/authors.yml even with 0 posts.
      (site.data["authors"] || {}).each_key { |u| usernames << u }

      usernames.uniq.each do |username|
        author = (site.data["authors"] || {})[username] || {}
        name   = author["name"] || username
        add_page(
          site, "/@#{username}", "author", username,
          "username" => username,
          "title"    => "@#{username}",
          "description" => "Articles by #{name} (@#{username}) on #{site.config['title']}."
        )
      end
    end

    # Dedup by SLUG, not raw string — "Web Security" and "web security" would
    # otherwise both survive `.uniq` yet slugify to the same output path,
    # colliding silently and dropping one post's category page.
    def generate_categories(site, articles)
      categories = articles.map { |a| a.data["category"] }.compact
                           .uniq { |cat| Jekyll::Utils.slugify(cat) }
      categories.each do |cat|
        add_page(
          site, "/category/#{Jekyll::Utils.slugify(cat)}", "category", cat,
          "category" => cat,
          "title"    => "#{cat}",
          "description" => "Articles in the #{cat} category on #{site.config['title']}."
        )
      end
    end

    def generate_tags(site, articles)
      tags = articles.flat_map { |a| a.data["tags"] || [] }.compact
                     .uniq { |tag| Jekyll::Utils.slugify(tag) }
      tags.each do |tag|
        add_page(
          site, "/tag/#{Jekyll::Utils.slugify(tag)}", "tag", tag,
          "tag"   => tag,
          "title" => "##{tag}",
          "description" => "Articles tagged ##{tag} on #{site.config['title']}."
        )
      end
    end
  end
end
