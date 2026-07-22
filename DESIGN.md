# Hallmark Hum — Design Reference

> Warm, alive, smart-but-joyful. Cream paper, multi-accent palette, rounded sans typography, generous radii, soft lifting shadows.

**Theme:** playful · Hum

The products don't take themselves too seriously — the interface feels like the room is warm and someone smart is smiling. Cream paper (never pure white), three accent colours that each own their own surface, rounded everything, and motion that makes every interaction feel alive.

## Tokens — Colors

| Name | OKLCH | Token | Role |
|------|-------|-------|------|
| Paper | `oklch(97% 0.012 95)` | `--color-paper` | Warm cream canvas — never pure white |
| Paper 2 | `oklch(94% 0.016 95)` | `--color-paper-2` | Tinted band (yellower) |
| Paper 3 | `oklch(91% 0.020 95)` | `--color-paper-3` | Deeper hover surface |
| Ink | `oklch(20% 0.012 250)` | `--color-ink` | Primary text — near-black with cool tilt, never pure black |
| Ink 2 | `oklch(34% 0.018 257)` | `--color-ink-2` | Secondary text |
| Accent (Pear) | `oklch(86% 0.18 95)` | `--color-accent` | Primary CTA, streaks, character mark |
| Accent Deep | `oklch(76% 0.20 95)` | `--color-accent-deep` | Button edge shadow |
| Accent 2 (Cyan) | `oklch(66% 0.18 235)` | `--color-accent-2` | Links, hover tints, illustrations |
| Accent 3 (Coral) | `oklch(68% 0.24 18)` | `--color-accent-3` | Pop — single high-energy moment per page |
| Mint | `oklch(80% 0.16 150)` | `--color-mint` | Occasional — success states |
| Lavender | `oklch(74% 0.16 305)` | `--color-lavender` | Occasional — tag chips |
| Graphite | `oklch(22% 0.016 260)` | `--color-graphite` | Dark code cards |
| Surface | `oklch(94% 0.016 95)` | `--color-surface` | Tinted sections |
| Rule | `oklch(88% 0.012 95)` | `--color-rule` | Soft dividers |

**Three-rule for accents:**
1. Each accent owns its own surface. Pear = primary action. Cyan = links/hover. Coral = single emphatic moment.
2. Accents never blend in gradients.
3. Mint and lavender are occasional — never more than one per page.

## Tokens — Typography

Three font families. Rounded sans throughout.

### Plus Jakarta Sans — Display headlines
- **Role:** Hero headlines, section headings, product names
- **Weights:** 500, 600, 700
- **Tracking:** -0.025em at display size
- **Token:** `--font-display`

### Inter — Body copy, navigation, buttons
- **Role:** Everything that isn't a headline or code
- **Weights:** 400, 500
- **Token:** `--font-body`

### JetBrains Mono — Labels, specs, code
- **Role:** Uppercase labels, spec values, tracking codes, status badges
- **Weights:** 400, 500
- **Tracking:** 0.10em uppercase
- **Token:** `--font-mono`

## Tokens — Shapes

| Element | Value | Token |
|---------|-------|-------|
| Cards | 20px | `--radius-card` |
| Buttons | 999px (pill) | `--radius-btn` |
| Inputs | 12px | `--radius-input` |

## Tokens — Shadows

| Name | Value | Usage |
|------|-------|-------|
| Card | `0 12px 32px -16px oklch(20% 0.012 250 / 0.12)` | Default card lift |
| Card Hover | `0 20px 40px -12px oklch(20% 0.012 250 / 0.18)` | Card on hover |
| Product | `0 16px 40px -12px oklch(20% 0.012 250 / 0.20)` | Product imagery |
| Button | `0 4px 0 0 accent-deep, 0 6px 12px -3px accent-cast` | Push button edge |

## Tokens — Motion

| Element | Motion |
|---------|--------|
| Primary CTA | Lift 2px on hover, press DOWN 3px on `:active` |
| Cards | Lift 4px + shadow brighten + tint deepen on hover (220ms spring) |
| Character mark | Pulse at rest (4s gentle scale 1 → 1.04 → 1) |
| Star-burst | 420ms on CTA click, fires once |

## Components

### Push Button (`.hum-btn`)
Solid colour edge + soft ground shadow. The press is the feedback — physically depresses on `:active`.

### Soft Button (`.hum-btn--soft`)
Flat lift, no colour edge. For secondary actions.

### Outline Button (`.hum-btn--outline`)
Hairline + accent fill sweeps up on hover.

### Color-shift Card (`.hum-card`)
Each card has a different accent tint at rest (~6%). On hover: tint deepens (~12%), card lifts 4px.

### Character Mark
One small CSS-only element that pulses at rest. Lives in pear-yellow by default.

## Layout

- **Max content width:** 980px
- **Section padding:** py-16 md:py-20
- **Section rhythm:** alternating bg-paper and bg-paper-2/bands with accent tints
- **Hero:** left-aligned title + lede + CTA, product image right

## Do's and Don'ts

### Do
- Use Plus Jakarta Sans for all display headlines
- Use three accent colours, each owning its own surface
- Give cards rounded corners (20px) and soft shadows
- Use push buttons with color edge + shadow for primary actions
- Add hover lift + tint deepen on cards
- Add one character moment per page (optional)

### Don't
- Don't use pure #000 or #fff — use oklch ink/paper tokens
- Don't use square corners anywhere
- Don't use gradients between accents
- Don't use serif fonts anywhere
- Don't use more than one character moment per page
- Don't use three identical accent cards in a row — vary the shape
