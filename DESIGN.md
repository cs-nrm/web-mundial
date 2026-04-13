# DESIGN.md — Mundial Radio

Design system reference for AI-assisted development. Use these tokens consistently across all UI components.

---

## Brand

**Project:** Mundial Radio  
**Tagline:** Música. Noticias. Deporte.  
**Personality:** Bold, energetic, modern. Sports + music culture. Confident but accessible.

---

## Color Palette

### Primary
| Name | Hex | Usage |
|------|-----|-------|
| Lime | `#c5e513` | Primary accent, CTAs, highlights, active states, badges |
| Black | `#0a0a0a` | Backgrounds (dark), text on light, headers |
| White | `#ffffff` | Page backgrounds, card backgrounds, text on dark |

### Secondary / UI
| Name | Hex | Usage |
|------|-----|-------|
| Gray 50 | `#f9fafb` | Subtle backgrounds, alternating rows |
| Gray 100 | `#f3f4f6` | Borders, dividers, input backgrounds |
| Gray 400 | `#9ca3af` | Placeholder text, muted labels |
| Gray 700 | `#374151` | Secondary body text |
| Gray 900 | `#111827` | Primary body text on white |

### Semantic
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#22c55e` | Confirmations, added to playlist |
| Error | `#ef4444` | Errors, delete actions |
| Warning | `#f59e0b` | Alerts |

### Station Colors (badges only)
| Station | Hex |
|---------|-----|
| Oye | `#3b82f6` |
| Beat | `#f97316` |
| Stereocien | `#8b5cf6` |
| Sabrosita | `#ec4899` |
| Enfoque | `#14b8a6` |

### Do's and Don'ts
- **DO** use `#c5e513` on black or dark backgrounds for maximum contrast
- **DO** use `#c5e513` as background with `#0a0a0a` text
- **DON'T** use `#c5e513` on white — contrast is insufficient for text
- **DON'T** combine lime with red — use lime as the single accent

---

## Typography

### Fonts
| Role | Family | Import |
|------|--------|--------|
| Display / Headings | **Syne** | `weights: 400, 600, 700, 800` |
| Body / UI | **Inter** | `weights: 400, 500, 600` |

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
```

### Scale
| Token | Size | Weight | Family | Usage |
|-------|------|--------|--------|-------|
| `display` | 3rem / 48px | 800 | Syne | Hero titles |
| `h1` | 2.25rem / 36px | 700 | Syne | Page titles |
| `h2` | 1.75rem / 28px | 700 | Syne | Section headers |
| `h3` | 1.25rem / 20px | 600 | Syne | Card titles, subsections |
| `body-lg` | 1rem / 16px | 400 | Inter | Default body |
| `body-sm` | 0.875rem / 14px | 400 | Inter | Secondary text, captions |
| `label` | 0.75rem / 12px | 600 | Inter | Badges, tags, uppercase labels |
| `micro` | 0.625rem / 10px | 500 | Inter | Tiny metadata |

### Rules
- Headings always use Syne
- Body, inputs, buttons use Inter
- Labels and badges use Inter Semibold, often uppercase with `letter-spacing: 0.05em`
- Line height: headings `1.1`, body `1.6`

---

## Spacing

Base unit: `4px`

| Token | Value | Tailwind |
|-------|-------|---------|
| `xs` | 4px | `p-1` |
| `sm` | 8px | `p-2` |
| `md` | 16px | `p-4` |
| `lg` | 24px | `p-6` |
| `xl` | 32px | `p-8` |
| `2xl` | 48px | `p-12` |
| `3xl` | 64px | `p-16` |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 6px | Badges, small tags |
| `md` | 12px | Buttons, inputs |
| `lg` | 16px | Cards |
| `xl` | 20px | Panels, modals |
| `full` | 9999px | Pills, avatar |

---

## Shadows

```css
/* Card */
box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);

/* Panel / Modal */
box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);

/* Elevated (player, sticky) */
box-shadow: 0 16px 48px rgba(0,0,0,0.22);
```

---

## Components

### Button — Primary
```
Background: #c5e513
Text: #0a0a0a
Font: Inter 600, 14px, uppercase, letter-spacing 0.04em
Padding: 12px 24px
Border radius: 12px
Hover: brightness(0.92)
No box-shadow on primary buttons
```

### Button — Secondary
```
Background: transparent
Border: 2px solid #e5e7eb
Text: #374151
Hover border: #0a0a0a
Hover text: #0a0a0a
Border radius: 12px
```

### Button — Destructive
```
Background: transparent
Border: 2px solid #fca5a5
Text: #ef4444
Hover border: #ef4444
```

### Button — Ghost (icon)
```
Background: transparent
Text: #9ca3af
Hover text: #0a0a0a
No border, no padding
```

### Input
```
Background: #ffffff
Border: 1.5px solid #e5e7eb
Text: #111827
Placeholder: #9ca3af
Border radius: 12px
Padding: 12px 16px
Font: Inter 400, 14px
Focus border: #c5e513
Focus outline: none
```

### Card
```
Background: #ffffff
Border radius: 16px
Shadow: card shadow above
Padding: 24px
No border
```

### Card — Dark
```
Background: #0a0a0a
Text: #ffffff
Border radius: 16px
Accent details: #c5e513
```

### Badge / Tag
```
Background: color at 15% opacity (e.g. rgba(197,229,19,0.15))
Text: base color at full opacity
Font: Inter 600, 11px, uppercase
Padding: 2px 8px
Border radius: 6px
```

### Active / Selected state
```
Background: #c5e513
Text: #0a0a0a
```

---

## Layout

- Max content width: `1200px`, centered
- Page horizontal padding: `16px` mobile, `32px` tablet, `64px` desktop
- Grid: 12-column, 24px gutter
- Common patterns: 1 col mobile → 2 col tablet → 3-4 col desktop

---

## Dark Sections

When a section has a black background:
- Primary text: `#ffffff`
- Secondary text: `#9ca3af`
- Accent: `#c5e513`
- Dividers: `rgba(255,255,255,0.08)`
- Cards inside dark: use slightly lighter bg `#1a1a1a`

---

## Motion

- Default transition: `150ms ease`
- Hover transitions: `color`, `background-color`, `border-color`, `opacity`
- No transitions on layout properties (width, height) unless intentional
- Entrance animations: subtle fade + translateY(8px), 200ms ease-out
- Player panel slide: `transform translateY` + `opacity`, 250ms ease

---

## Icons

- Library: inline SVG
- Style: filled (Material Icons style)
- Size: 16px (`w-4 h-4`) for inline, 20px (`w-5 h-5`) for buttons, 24px (`w-6 h-6`) for standalone
- Color: inherits from parent text color

---

## Voice & Copy

- Spanish (Mexico)
- Tone: direct, energetic, friendly — never formal
- CTAs: short imperative verbs ("Agregar", "Reproducir", "Ver más")
- No emojis in UI chrome — only in content when appropriate
- Sentence case for body, uppercase for labels/badges
