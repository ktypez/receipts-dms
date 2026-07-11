# Design Revamp: Lovable for receipts-dms

## Source Reference

Lovable design system from https://needmcp.com/styles/lovable

> "Warm, approachable humanist design for developer tools with cream/parchment tones, soft inset shadows, and minimal borders"

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Border Radius](#5-border-radius)
6. [Elevation & Depth](#6-elevation--depth)
7. [Component Specifications](#7-component-specifications)
8. [Current Project Context](#8-current-project-context)
9. [Implementation Notes](#9-implementation-notes)

---

## 1. Design Philosophy

### The Warmth Principle
The system rejects pure white (`#ffffff`) backgrounds in favor of cream/parchment (`#f7f4ed`). Pure white creates a harsh, high-contrast reading environment. The cream tone reduces contrast just enough to feel warm and paper-like while maintaining excellent readability.

### The Opacity Principle
Every shade of gray on the page derives from **`#1c1c1c` at varying opacities**. This creates visual coherence — every gray is the same hue, just more or less transparent. No arbitrary hex values for grays.

### The Restraint Principle (Borders Over Shadows)
Cards don't float above the surface with drop-shadows. They are **contained by 1px solid borders**. Elevation is communicated through borders, not color shifts or shadows.

### The Two-Weight Principle
Only two primary font weights: **400 (regular)** and **600 (semibold)**. Hierarchy comes from size and letter-spacing, not weight variation.

---

## 2. Color System

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#f7f4ed` | Warm parchment page background |
| `--foreground` | `#1c1c1c` | Body copy, headings — warm near-black |
| `--card` | `#f7f4ed` | Same as background (no elevation color shift) |
| `--card-foreground` | `#1c1c1c` | |
| `--popover` | `#f7f4ed` | |
| `--popover-foreground` | `#1c1c1c` | |
| `--primary` | `#1c1c1c` | Primary action (dark button) |
| `--primary-foreground` | `#fcfbf8` | Warm white text on dark buttons |
| `--secondary` | `#5f5f5d` | |
| `--secondary-foreground` | `#fcfbf8` | |
| `--muted` | `rgba(28,28,28,0.04)` | Hover state bg |
| `--muted-foreground` | `#5f5f5d` | |
| `--accent` | `rgba(28,28,28,0.04)` | |
| `--accent-foreground` | `#1c1c1c` | |
| `--destructive` | `#ef4444` | |
| `--destructive-foreground` | `#fcfbf8` | |
| `--border` | `#eceae4` | 1px card/input borders |
| `--input` | `#eceae4` | Input borders |
| `--ring` | `rgba(59,130,246,0.5)` | Focus ring — soft blue glow |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#1a1916` | Dark warm parchment |
| `--foreground` | `#e8e5de` | Warm off-white text |
| `--card` | `#1a1916` | Same as background |
| `--card-foreground` | `#e8e5de` | |
| `--popover` | `#1a1916` | |
| `--popover-foreground` | `#e8e5de` | |
| `--primary` | `#1c1c1c` | **Same as light mode** |
| `--primary-foreground` | `#fcfbf8` | |
| `--secondary` | `#9a9a98` | |
| `--secondary-foreground` | `#1a1916` | |
| `--muted` | `rgba(232,229,222,0.04)` | |
| `--muted-foreground` | `#9a9a98` | |
| `--accent` | `rgba(232,229,222,0.04)` | |
| `--accent-foreground` | `#e8e5de` | |
| `--destructive` | `#ef4444` | Same as light |
| `--destructive-foreground` | `#fcfbf8` | |
| `--border` | `#2e2c28` | |
| `--input` | `#2e2c28` | |
| `--ring` | `rgba(59,130,246,0.5)` | Same as light |

### Key Rules

- **Never use `#ffffff`** as a page background
- **Never use `#000000`** as text — use `#1c1c1c` instead
- **Semantic colors** (success/warning/danger/info) stay as standard web colors
- All neutral grays are `#1c1c1c` at various opacities

---

## 3. Typography

### Font Stack

```
'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif
```

**Why DM Sans:** A humanist sans-serif with slightly rounded terminals and organic curves. Geometric sans-serifs communicate "tech company"; DM Sans communicates "craft."

Load via Google Fonts or Bunny Fonts (Bunny is used on needmcp.com):
```html
<link href="https://fonts.bunny.net/css?family=dm-sans:400,600&display=swap" rel="stylesheet" />
```

### Type Scale

| Role | Size | Weight | Line Ht | Letter Spacing | Use |
|------|------|--------|---------|----------------|-----|
| Display | 48px | 600 | 1.00 | -1.2px | Page titles (not used in DMS) |
| H1 | 36px | 600 | 1.10 | normal | Section titles |
| H2 | 20px | 400 | 1.25 | normal | Card headings |
| Body | 16px | 400 | 1.50 | normal | Main text |
| Caption | 14px | 400 | 1.50 | normal | Metadata |
| Small | 13px | 400 | 1.50 | normal | Table cells, badges |

### Key Rules

- **Only weights 400 and 600** — no 500, no 700
- Headlines at display sizes use aggressive negative letter-spacing for editorial impact
- Body text maintains normal tracking (0) for comfortable reading
- No font-weight 700 (bold) — 600 is the maximum

---

## 4. Spacing & Layout

Based on an 8px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 4px (0.25rem) | Micro spacing |
| `--spacing-sm` | 8px (0.5rem) | Tight spacing, icon gaps |
| `--spacing-md` | 16px (1rem) | Standard spacing |
| `--spacing-lg` | 24px (1.5rem) | Section internal |
| `--spacing-xl` | 32px (2rem) | Section gaps |

### Layout Notes for this Project

- Sidebar: 224px (w-56) — keep as-is
- Content padding: `p-4 lg:p-6` — keep as-is
- Topbar height: 56px (h-14) — keep as-is
- Bottom nav: 64px (h-16) — keep as-is

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Small buttons, micro elements |
| md | 6px | Buttons, inputs, navigation |
| lg | 8px | Compact cards |
| xl | 12px | Standard cards, images |
| full | 9999px | Action pills, icon buttons |

**Implementation:** Set `--radius: 0.5rem` (8px) as base. Use the Tailwind calc pattern:
- `rounded-sm` = `calc(var(--radius) - 4px)` = 4px
- `rounded-md` = `calc(var(--radius) - 2px)` = 6px
- `rounded-lg` = `var(--radius)` = 8px
- `rounded-xl` = `calc(var(--radius) + 4px)` = 12px

**Full pill radius (9999px) is reserved for:**
- Action pills
- Icon buttons
- **Never** on rectangular action buttons

---

## 6. Elevation & Depth

Lovable's depth system is intentionally shallow. No drop-shadows on cards.

| Level | Treatment | Light | Dark | Use |
|-------|-----------|-------|------|-----|
| Level 0 | None | — | — | Page surface |
| Level 1 | Border | 1px solid `#eceae4` | 1px solid `#2e2c28` | Cards, inputs, tables |
| Level 2 | Inset shadow | Multi-layer inset | Multi-layer inset | Dark buttons |
| Level 3 | Focus shadow | `rgba(0,0,0,0.1) 0 4px 12px` | Same | Focused elements |
| Level 4 | Ring | `0 0 0 2px rgba(59,130,246,0.5)` | Same | Accessibility focus |

### Inset Shadow Technique (Dark Buttons)

The signature Lovable detail. Dark buttons get a tactile, pressed-into-surface appearance:

```css
box-shadow: inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.2),
            0 1px 2px rgba(0,0,0,0.1);
```

This creates: white highlight on top edge, dark ring on bottom edge, subtle outer shadow.

---

## 7. Component Specifications

### 7.1 Buttons

#### Primary Dark (Default)
```
Background:   #1c1c1c
Text:         #fcfbf8
Radius:       6px (rounded-md)
Shadow:       inset 0 1px 0 rgba(255,255,255,0.15),
              inset 0 -1px 0 rgba(0,0,0,0.2),
              0 1px 2px rgba(0,0,0,0.1)
Hover:        opacity 0.9
Active:       opacity 0.8
Padding:      0 16px, height 36px
Font:         14px, 600
```

#### Outline
```
Background:   transparent
Border:       1px solid rgba(28,28,28,0.4)
Text:         #1c1c1c
Radius:       6px (rounded-md)
Hover:        background rgba(28,28,28,0.04)
```

#### Cream Surface (Secondary/Ghost)
```
Background:   #f7f4ed (same as page)
Text:         #1c1c1c
Radius:       6px (rounded-md)
Border:       none
Hover:        background rgba(28,28,28,0.04)
```

#### Pill / Icon Button
```
Background:   #f7f4ed
Radius:       9999px (rounded-full)
Shadow:       inset 0 1px 0 rgba(255,255,255,0.8),
              inset 0 -1px 0 rgba(0,0,0,0.05)
```

### 7.2 Cards

```
Background:   #f7f4ed (matches page — no elevation color shift)
Border:       1px solid #eceae4
Radius:       12px (rounded-xl)
Shadow:       NONE — no drop-shadow
Padding:      24px (header), 24px (content)
```

**No box-shadow on any card.** Use borders for containment.

### 7.3 Inputs & Forms

```
Background:   #f7f4ed
Border:       1px solid #eceae4
Radius:       6px (rounded-md)
Padding:      0 12px, height 36px
Font:         14px, 400
Focus ring:   0 0 0 2px rgba(59,130,246,0.5) — soft blue glow
```

### 7.4 Badges

```
Background:   #f7f4ed (cream surface)
Border:       1px solid #eceae4
Radius:       4px (rounded-sm)
Font:         12px, 600
Padding:      2px 8px
```

**No shadow on badges.** Remove the `shadow` class from default/destructive variants.

### 7.5 Dialogs

```
Overlay:      rgba(0,0,0,0.5) (or 0.8)
Content bg:   #f7f4ed
Border:       1px solid #eceae4
Radius:       12px (rounded-xl)
Shadow:       NONE — border only
```

### 7.6 Select / Dropdown

```
Trigger bg:   #f7f4ed
Border:       1px solid #eceae4
Radius:       6px
Shadow:       NONE — border only
Content:      same as trigger, no drop-shadow
```

### 7.7 Sidebar Navigation

```
Active item:
  Background: rgba(28,28,28,0.04) (muted)
  Border:     left border 2px solid #1c1c1c
  Text:       #1c1c1c (foreground)

Inactive item:
  Background: transparent
  Text:       #5f5f5d (muted-foreground)
  Hover:      background rgba(28,28,28,0.04)
```

### 7.8 Tables

```
Background:   transparent (inherits page bg)
Border:       1px solid #eceae4 (wrapper)
Row divider:  1px solid #eceae4
Hover row:    background rgba(28,28,28,0.02)
Header cell:  font 13px 600, color #5f5f5d
```

---

## 8. Current Project Context

### Tech Stack
- **Framework**: React 19 + TypeScript 7
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS 3.4 via CSS variables
- **UI Library**: shadcn/ui-style components (Radix primitives + CVA)
- **Icons**: lucide-react
- **Routing**: react-router 7

### Current Theme System
- `src/index.css` — CSS custom properties (`:root` and `.dark`) with OKLCH color values
- `tailwind.config.js` — Maps `var(--*)` to Tailwind semantic color names
- Dark mode via `.dark` class on `<html>`, toggled by `ThemeProvider`

### All Pages
1. **Login** `/login` — Password form
2. **Dashboard** `/` — Stat cards + recent receipts
3. **Receipts** `/receipts` — Table/card views, search, filter, pagination
4. **Receipt Detail** `/receipts/:id` — Preview, edit, delete
5. **Upload** `/upload` — Drag/drop with WebP compression
6. **Categories** `/categories` — CRUD with receipt counts
7. **Settings** `/settings` — Theme, storage info, sign out

### Navigation
- Desktop: Fixed sidebar (224px) with 5 links + brand
- Mobile: Bottom nav bar (64px) with 5 tabs

### Files Requiring Changes
| File | Change |
|------|--------|
| `index.html` | Add DM Sans font CDN link |
| `src/index.css` | Replace OKLCH with Lovable hex palette |
| `tailwind.config.js` | Add DM Sans font family |
| `src/components/ui/button.tsx` | Redesign 4 variants (default, outline, secondary/ghost, icon) |
| `src/components/ui/card.tsx` | Remove `shadow-sm` class |
| `src/components/ui/input.tsx` | Remove `shadow-sm`, add `bg-background` |
| `src/components/ui/select.tsx` | Remove `shadow-sm` from trigger, remove `shadow-md` from content |
| `src/components/ui/dialog.tsx` | Remove `shadow-lg`, use border `shadow-none` |
| `src/components/ui/badge.tsx` | Remove `shadow` from default/destructive variants |
| `src/components/ui/table.tsx` | Subtle border adjustments |
| `src/components/sidebar.tsx` | Nav active state: muted bg + left border |
| `src/components/topbar.tsx` | Border-bottom emphasis, remove backdrop blur |
| `src/components/bottom-nav.tsx` | Match cream palette |
| `src/components/layout.tsx` | Minor adjustments |
| All 7 page files | Update class names to match new system |

---

## 9. Implementation Notes

### How to Approach

1. **CSS variables first** — Update `index.css` with the Lovable palette. Everything downstream inherits automatically.
2. **Tailwind config** — Add font family. No other config changes needed.
3. **UI components** — Edit the 6 shared UI components (button, card, input, select, dialog, badge).
4. **Layout components** — Sidebar, topbar, bottom-nav.
5. **Pages** — Touch up class names across all 7 pages.

### CSS Variable Conversion (for `index.css`)

Use hex colors directly in CSS variables since Tailwind references `var(--background)`, etc.

```css
:root {
  --background: #f7f4ed;
  --foreground: #1c1c1c;
  --card: #f7f4ed;
  --card-foreground: #1c1c1c;
  --popover: #f7f4ed;
  --popover-foreground: #1c1c1c;
  --primary: #1c1c1c;
  --primary-foreground: #fcfbf8;
  --secondary: #5f5f5d;
  --secondary-foreground: #fcfbf8;
  --muted: rgba(28,28,28,0.04);
  --muted-foreground: #5f5f5d;
  --accent: rgba(28,28,28,0.04);
  --accent-foreground: #1c1c1c;
  --destructive: #ef4444;
  --destructive-foreground: #fcfbf8;
  --border: #eceae4;
  --input: #eceae4;
  --ring: rgba(59,130,246,0.5);
  --radius: 0.5rem;
}

.dark {
  --background: #1a1916;
  --foreground: #e8e5de;
  --card: #1a1916;
  --card-foreground: #e8e5de;
  --popover: #1a1916;
  --popover-foreground: #e8e5de;
  --primary: #1c1c1c;
  --primary-foreground: #fcfbf8;
  --secondary: #9a9a98;
  --secondary-foreground: #1a1916;
  --muted: rgba(232,229,222,0.04);
  --muted-foreground: #9a9a98;
  --accent: rgba(232,229,222,0.04);
  --accent-foreground: #e8e5de;
  --destructive: #ef4444;
  --destructive-foreground: #fcfbf8;
  --border: #2e2c28;
  --input: #2e2c28;
  --ring: rgba(59,130,246,0.5);
}
```

### Button Variant CVA Spec

```ts
// Lovable-styled button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#1c1c1c] text-[#fcfbf8] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] hover:opacity-90 active:opacity-80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)] hover:opacity-90",
        outline:
          "border border-[rgba(28,28,28,0.4)] bg-transparent text-foreground hover:bg-[rgba(28,28,28,0.04)]",
        secondary:
          "bg-background text-foreground hover:bg-[rgba(28,28,28,0.04)]",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-[rgba(28,28,28,0.04)]",
        link:
          "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Visual Reference

Reference URL: https://needmcp.com/styles/lovable

The design is described visually as:
- Warm cream/parchment page background (like a well-crafted notebook)
- Dark buttons with a tactile inset shadow (pressed-in look)
- Cards contained by delicate warm borders, not shadows
- DM Sans typeface for a humanist, crafted feel
- Generous spacing with clean hierarchy

---

*Spec v1.0 — Generated from Lovable design system at needmcp.com*
