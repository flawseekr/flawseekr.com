# Plan 02 — Replace the `#fff` literal in the CTA button hover

## Problem
The hover state of the CTA's primary button hard-codes `background: #fff`. Two
consequences:

1. **Off-palette.** The theme's color system has no pure white; the lightest
   neutral is `#ECEDED` (`--surface` in light). `#fff` is outside the token set.
2. **Fails contrast in dark theme.** In dark mode the CTA panel is light teal and
   the button hover renders white with `--accent-strong` (`#7ABDBF`) text.
   Measured contrast: **2.13:1** — well below the WCAG AA minimum of 4.5:1 for
   normal text. (In light mode the same rule is `#013B3F` on white ≈ 12.4:1, so
   the defect is dark-theme-specific but the literal is wrong in both.)

## Contract (binding decision this contradicts)
All fills are tokenized. Buttons placed on an accent fill use `--on-accent`
(`_sass/_variables.scss`: `#ECEDED` in light, `#111111` in dark). No token in the
palette equals `#ffffff`. The base button already follows this:
```scss
.cta .btn--primary { background: var(--on-accent); color: var(--accent); }
```

## Runtime (where it reaches the surface)
`_sass/_components.scss`:
```scss
.cta .btn--primary:hover { background: #fff; color: var(--accent-strong); }
```
Rendered on: the "Want to collaborate?" CTA block on the home page (`/`).

## Change
In `_sass/_components.scss`, replace exactly:
```scss
.cta .btn--primary:hover { background: #fff; color: var(--accent-strong); }
```
with:
```scss
.cta .btn--primary:hover { background: var(--on-accent); opacity: 0.9; }
```

Rationale for the deterministic correction:
- Keeps the button on-palette in both themes (`--on-accent` is the same token the
  non-hover state uses).
- The hover feedback comes from a slight `opacity` reduction rather than a color
  swap, so the `color: var(--accent)` inherited from the base rule keeps its
  tested contrast against the button in both themes (no new color pairing to
  re-verify).
- Removes the failing `--accent-strong`-on-white pairing entirely.

> Note: `.cta .btn--primary` already sets `background` and `color`; this hover no
> longer needs to restate `color`. Confirm the base rule
> `.cta .btn--primary { background: var(--on-accent); color: var(--accent); }`
> remains directly above it so the inherited `color` still applies.

## Reusable primitive
Use `opacity` (or an existing token) for hover feedback on filled buttons instead
of swapping to a literal color. Never introduce raw hex (`#fff`, `#000`, …) in
component rules — the palette is fully tokenized.

## Affected surfaces
- `/` (home) — CTA primary button hover, light and dark themes.

## Verification
```bash
export PATH="$HOME/.local/share/gem/ruby/3.3.0/bin:$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
bundle exec jekyll build
# The CTA-hover white literal is gone (expect no match):
grep -o '.cta .btn--primary:hover{background:#fff' _site/assets/css/main.css || echo "OK: no #fff hover"
```
Manual: toggle to dark mode, hover the CTA button — the label must stay clearly
legible (teal text on the dark `--on-accent` button), not light teal on white.
