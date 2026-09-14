# Plan 01 — Make the article-card hover shadow theme-aware

## Problem
`.article-card:hover` raises elevation with a hard-coded black box-shadow
(`rgba(0,0,0,.18)`) that is identical in light and dark themes. The theme's
elevation is otherwise tokenized and theme-aware via `--shadow` (separate light
and dark values). On the dark surface (`--bg: #111111`), a `rgba(0,0,0,.18)`
shadow is nearly invisible, so the hover lift effectively disappears in dark
mode while every non-hover elevated surface still reads correctly through the
token.

## Contract (binding decision this contradicts)
`_sass/_variables.scss` defines `--shadow` twice — once per theme — establishing
that elevation is a theme-aware token, not a fixed color:

- Light block (`:root, :root[data-theme="light"]`), lines ~60–63:
  ```scss
  --shadow:
    0 1px 2px -1px rgba(17,17,17,.10),
    0 2px 6px -1px rgba(17,17,17,.05),
    0 8px 24px -4px rgba(17,17,17,.06);
  ```
- Dark block (`:root[data-theme="dark"]`), lines ~87–90:
  ```scss
  --shadow:
    0 1px 2px -1px rgba(0,0,0,.6),
    0 4px 12px -2px rgba(0,0,0,.45),
    0 12px 32px -6px rgba(0,0,0,.35);
  ```

## Runtime (where it reaches the surface)
`_sass/_components.scss`, `.article-card:hover` rule:
```scss
.article-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
  box-shadow: 0 10px 34px rgba(0,0,0,.18);   /* <-- hard-coded, not theme-aware */
}
```
Rendered on: `/articles/` (every card) and the "Latest writing" grid on the home
page (`/`).

## Change

### Step 1 — add a `--shadow-lg` elevation token to BOTH theme blocks
Mirror the existing `--shadow` structure, one step stronger.

In `_sass/_variables.scss`, in the **light** block, immediately after the
`--shadow: … ;` declaration (after the line ending `rgba(17,17,17,.06);`), add:
```scss
  --shadow-lg:
    0 2px 4px -1px rgba(17,17,17,.10),
    0 8px 16px -4px rgba(17,17,17,.08),
    0 18px 40px -8px rgba(17,17,17,.12);
```

In the **dark** block, immediately after its `--shadow: … ;` declaration (after
the line ending `rgba(0,0,0,.35);`), add:
```scss
  --shadow-lg:
    0 2px 4px -1px rgba(0,0,0,.7),
    0 8px 20px -4px rgba(0,0,0,.55),
    0 20px 48px -8px rgba(0,0,0,.5);
```

### Step 2 — use the token in the hover rule
In `_sass/_components.scss`, replace exactly:
```scss
  box-shadow: 0 10px 34px rgba(0,0,0,.18);
```
with:
```scss
  box-shadow: var(--shadow-lg);
```

## Reusable primitive
`--shadow-lg` is a general elevation token. Any future "raised on hover / active
card" surface should use `var(--shadow-lg)` rather than a literal. Do not
introduce further one-off `box-shadow: … rgba(…)` literals.

## Affected surfaces
- `/articles/` — article card hover
- `/` (home) — "Latest writing" card hover
- Any element later styled with `var(--shadow-lg)` (none today)

## Verification
```bash
export PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
bundle exec jekyll build
# Token present for both themes (expect 2 matches):
grep -o -- '--shadow-lg:' _site/assets/css/main.css | wc -l
# The hard-coded hover shadow is gone (expect 0):
grep -c '0 10px 34px rgba(0,0,0,.18)' _site/assets/css/main.css
```
Manual: hover an article card in dark mode — the card should visibly lift, not
only shift its border color.
