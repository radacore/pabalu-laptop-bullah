# Hallmark Cobalt — Design Reference

> Cool engineered canvas. Products are instruments; the interface is the control panel that frames them with precision.

**Theme:** modern-minimal · Cobalt

A cool near-white canvas with ruler-drawn hairlines, exactly ONE electric cobalt signal accent, and Space Grotesk display type. The page reads like good infrastructure: calm, precise, fast. Products are presented as technical instruments, not lifestyle objects. Depth comes from borders, not shadows.

## Tokens — Colors

| Name | OKLCH | Token | Role |
|------|-------|-------|------|
| Paper | `oklch(98.5% 0.004 250)` | `--color-paper` | Cool engineered near-white canvas — not pure #fff, slightly cool-tinted |
| Ink | `oklch(24% 0.02 258)` | `--color-ink` | Primary text, headings — cool charcoal, never pure #000 |
| Ink 2 | `oklch(34% 0.018 257)` | `--color-ink-2` | Body text, descriptions — one step lighter than Ink |
| Accent | `oklch(58% 0.20 256)` | `--color-accent` | Electric cobalt — links, CTAs, active states. Used sparingly (< 5%) |
| Rule | `oklch(88% 0.008 250)` | `--color-rule` | Hairline borders — 1px separators that define every surface |
| Graphite | `oklch(22% 0.016 260)` | `--color-graphite` | Dark code cards, terminal backgrounds — the one dark beat per page |
| Surface | `oklch(96% 0.006 250)` | `--color-surface` | Alternating section background — slightly tinted off-canvas |

## Tokens — Typography

Three font families. All sans; no serif anywhere.

### Space Grotesk — Display headlines
- **Role:** Hero headlines, section headings, product names
- **Weights:** 500, 600, 700
- **Tracking:** -0.025em at display size, -0.02em at heading size
- **Token:** `--font-display`

### Inter — Body copy, navigation, buttons
- **Role:** Everything that isn't a headline or code
- **Weights:** 400, 500
- **Token:** `--font-body`

### JetBrains Mono — Labels, specs, code
- **Role:** Uppercase labels, spec values, tracking codes, status badges
- **Weights:** 400, 500
- **Tracking:** 0.06em uppercase
- **Token:** `--font-mono`

### Type Scale

| Role | Size | Line Height | Letter Spacing | Weight | Token |
|------|------|-------------|----------------|--------|-------|
| caption | 12px | 1.33 | 0.06em | 500 | `cobalt-caption` |
| body-sm | 14px | 1.43 | — | 400 | `cobalt-body-sm` |
| body | 16px | 1.5 | -0.003em | 400 | `cobalt-body` |
| body-lg | 18px | 1.5 | -0.005em | 400 | `cobalt-body-lg` |
| subheading | 20px | 1.3 | -0.01em | 500 | `cobalt-subheading` |
| heading | clamp(1.5rem, 2vw+0.5rem, 2rem) | 1.2 | -0.015em | 600 | `cobalt-heading` |
| heading-lg | clamp(2rem, 3vw+0.5rem, 2.75rem) | 1.12 | -0.02em | 600 | `cobalt-heading-lg` |
| display | clamp(2.5rem, 5vw+0.5rem, 3.5rem) | 1.05 | -0.025em | 600 | `cobalt-display` |

## Tokens — Shapes

| Element | Value | Token |
|---------|-------|-------|
| Cards | 10px | `rounded-card` |
| Buttons | 6px | `rounded-btn` |
| Search inputs | 980px | `rounded-pill` |

## Tokens — Shadows

| Name | Value | Usage |
|------|-------|-------|
| Card | `0 1px 2px oklch(24% 0.02 258 / 0.05)` | Minimal lift on cards |
| Product | `0 12px 32px -16px oklch(24% 0.02 258 / 0.18)` | Product imagery only |

## Layout

- **Max content width:** 980px
- **Section padding:** py-16 md:py-20
- **Section rhythm:** alternating `bg-paper` and `bg-surface`
- **Hero:** left-aligned title + lede + CTA, product image right. NOT centred.

## Components

### Bordered Navigation
Flush full-width bar, single hairline bottom border, light blur on scroll. Wordmark + nav links left; CTA button right. Height 48px.

### Filled Button
Background `oklch(58% 0.20 256)`, text white, 6px radius. Hover: opacity 90%.

### Outlined Button
1px `border-rule`, text `ink`, 6px radius. Hover: border becomes accent, text becomes accent.

### Code/Terminal Card
Dark graphite background (`oklch(22% 0.016 260)`), 10px radius, 1px `border-rule` hairline. Used for specs display, status codes.

### Hairline Cards
1px `border-rule` border, 10px radius, no shadow. Depth from borders, not elevation.

## Design Principles

1. **Hairlines do the work.** 1px borders define every surface. No boxed cards with drop-shadows.
2. **One accent, used sparingly.** Electric cobalt marks links, CTAs, active states. Everything else is ink-on-cool-white.
3. **Code is the hero.** Specs, tracking codes, status badges use monospace. Technical precision is the brand.
4. **Left-aligned, not centred.** Hero text biases left. Centred-everything is an AI tell.
5. **Tight technical radii.** 6px buttons, 10px cards. "Drawn with a ruler."
6. **No gradients, no glassmorphism.** Cool paper + hairlines carry the page.

## Do's and Don'ts

### Do
- Use Space Grotesk for all display headlines with -0.025em tracking
- Use JetBrains Mono for specs, labels, status badges in uppercase
- Separate sections with 1px `border-rule` hairlines
- Keep accent usage under 5% of any viewport
- Left-align hero sections with title + lede + CTA

### Don't
- Don't use pure #000 or #fff — use oklch ink/paper tokens
- Don't use pill buttons on CTAs — 6px radius only
- Don't add shadows to UI elements — hairlines only
- Don't centre hero text — left-aligned is the Cobalt signature
- Don't use serif fonts anywhere
- Don't use Apple-style tokens (`bg-cloud`, `text-graphite`, `text-fog`, `apple-*`)

## Quick Color Reference

- Primary text: `oklch(24% 0.02 258)` (ink)
- Body text: `oklch(34% 0.018 257)` (ink-2)
- Link / accent: `oklch(58% 0.20 256)` (cobalt)
- Canvas: `oklch(98.5% 0.004 250)` (paper)
- Borders: `oklch(88% 0.008 250)` (rule)
- Dark card: `oklch(22% 0.016 260)` (graphite)
