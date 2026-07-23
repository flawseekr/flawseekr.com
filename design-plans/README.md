# design-plans

Implementation plans produced by an `improve-ui` audit of the Flawseekr Jekyll
theme. Each plan is self-contained and can be executed independently.

- **Repo state at audit:** not a git repository — no commit hash. Plans reference
  files under `_sass/` by path and by the exact current line content, so they
  remain valid as long as those strings are present.
- **These plans do not modify source.** An executor applies them.

## Build & verify (any plan)

Ruby 3.3 + Bundler are installed for this project. From the repo root:

```bash
export PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
bundle exec jekyll build          # compiles _sass -> _site/assets/css/main.css
```

The compiled, minified stylesheet is `_site/assets/css/main.css`. Verification
greps in each plan run against that file.

## Plans

| # | File | Problem | Confidence |
|---|------|---------|------------|
| 1 | `01-theme-aware-card-hover-shadow.md` | Article-card hover shadow is a hard-coded black value, not the theme-aware `--shadow` token | High |
| 2 | `02-cta-button-hover-token.md` | CTA button hover hard-codes `#fff`; off-palette and fails AA contrast in dark theme | High |
| 3 | `03-radius-literals-to-tokens.md` | Border-radius literals bypass the `--radius` / `--radius-sm` token scale | Medium |
