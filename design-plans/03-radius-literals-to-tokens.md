# Plan 03 — Snap border-radius literals onto the radius token scale

## Problem
Several elements set `border-radius` with raw pixel values instead of the defined
radius tokens. One of them (`.feature__icon`) uses `12px`, which is *exactly*
`--radius` written as a literal — a magic number that should be the token. The
others (`7px`, `6px`) are off-scale values where `--radius-sm` (`8px`) is the
intended small step.

Out of scope / intentionally NOT changed: `border-radius: 50%` (circular avatars)
and `border-radius: 999px` (pills). Those are shape choices, not scale steps.

## Contract (binding decision this contradicts)
`_sass/_variables.scss` defines the entire radius scale as two tokens:
```scss
--radius: 12px;
--radius-sm: 8px;
```
No sub-8px radius token exists, so `6px`/`7px` literals are off-scale, and a `12px`
literal duplicates `--radius`.

## Runtime (each occurrence + where it renders)

| File & rule | Current | Renders on |
|---|---|---|
| `_sass/_components.scss` — `.feature__icon` | `border-radius: 12px;` | home "What we do" icons |
| `_sass/_layout.scss` — `.brand__mark` | `border-radius: 7px;` | header, every page |
| `_sass/_prose.scss` — inline code (`.prose :not(pre) > code`) | `border-radius: 6px;` | every article body |
| `_sass/_components.scss` — `.searchbar__kbd` | `border-radius: 6px;` | `/articles/`, `/search/` |

## Change
Four exact string replacements. Each `old` string is unique within its file.

1. `_sass/_components.scss`, in the `.feature__icon` rule (its declaration block
   also contains `width: 48px; height: 48px;` and `background: var(--surface-2);`):
   - old: `  border-radius: 12px;`
   - new: `  border-radius: var(--radius);`

2. `_sass/_layout.scss`, in the `.brand__mark` rule (block also contains
   `color: var(--accent);` and `padding: 0.1rem 0.4rem;`):
   - old: `  border-radius: 7px;`
   - new: `  border-radius: var(--radius-sm);`

3. `_sass/_prose.scss`, in the inline-code rule (block also contains
   `color: var(--accent-2);` and `padding: 0.12em 0.4em;`):
   - old: `  border-radius: 6px;`
   - new: `  border-radius: var(--radius-sm);`

4. `_sass/_components.scss`, in the `.searchbar__kbd` rule (block also contains
   `color: var(--muted);` and `padding: 0.1rem 0.4rem;`):
   - old: `  border-radius: 6px;`
   - new: `  border-radius: var(--radius-sm);`

> `border-radius: 6px;` appears once per file (`_prose.scss` and
> `_components.scss`), so a file-scoped exact replace is unambiguous. If applying
> a repo-wide replace, scope by file to avoid crossing the two occurrences.

## Reusable primitive
The two radius tokens are the only allowed radii besides `50%` and `999px`. New
components must reference `var(--radius)` / `var(--radius-sm)`. If a genuinely
smaller step is ever needed, add a named token (e.g. `--radius-xs`) to
`_variables.scss` rather than re-introducing literals.

## Affected surfaces
- Header brand mark (all pages)
- Home "What we do" feature icons
- Inline `code` in every article
- Search `kbd` hint on `/articles/` and `/search/`

## Verification
```bash
export PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
bundle exec jekyll build
# No stray 6px/7px radii remain in source:
grep -rn 'border-radius: [67]px' _sass/ || echo "OK: no off-scale radius literals"
# feature icon no longer uses the 12px literal (source check):
grep -n 'border-radius: 12px' _sass/_components.scss || echo "OK: feature icon uses token"
```
Manual: brand mark, feature icons, inline code, and the kbd chip should look
unchanged except for the kbd/brand/inline-code corners being marginally rounder
(6/7px -> 8px). No layout shift expected.
