# Sacramental Order Dark & Tinted — Design System Specification

## Metadata & Tokens

```yaml
name: Sacramental Order Dark & Tinted
colors:
  surface: '#0c141b'
  surface-dim: '#0c141b'
  surface-bright: '#323a42'
  surface-container-lowest: '#070f16'
  surface-container-low: '#151c24'
  surface-container: '#192028'
  surface-container-high: '#232b32'
  surface-container-highest: '#2e363d'
  on-surface: '#dbe3ee'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dbe3ee'
  inverse-on-surface: '#293139'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#0c141b'
  on-background: '#dbe3ee'
  surface-variant: '#2e363d'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Source Serif 4
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
```

---

## Brand & Style

This design system evokes a sense of quiet authority, intellectual depth, and timeless ritual. It is tailored for environments requiring high focus and a scholarly or liturgical atmosphere—such as academic publishing, theological archives, or premium editorial platforms.

The style is **Modern Corporate with a Classical Soul**. It leans on high-contrast typography and structured layouts, utilizing a dual-mode approach:

-   **Dark Mode (Default):** A "Deep Night" aesthetic that minimizes eye strain while maintaining a regal, serious tone through charcoal and navy depths.
-   **Tinted Light Mode:** A "Scholar’s Parchment" aesthetic that moves away from sterile white, using subtle background tints to provide a softer, more historical feel for long-form reading and data entry.

---

## Colors

The palette is rooted in a deep, nocturnal foundation.

### Dark Mode (Primary)

The core background is `#0c141b` (Deep Charcoal Blue / Surface), providing a stable, low-light environment. Primary accents use a vibrant but professional selection to guide the eye toward actions. Secondary elements use muted slates to maintain hierarchy without competing for attention.

### Tinted Light Mode

In the light variation, the system rejects pure white (`#ffffff`) for surfaces. Instead, it utilizes a "Parchment Tint" (`#f8fafc` or custom light-parchment tint like `#f5f7fa` / `#edf1f5`). Input fields and text areas are further distinguished with a subtle cool-grey/blue background to create clear "wells" of interaction, improving visual comfort and preventing the "floating text" effect common in minimalist designs.

-   **Parchment Surface Background:** `#f5f7fa`
-   **Parchment Cards & Sheets:** `#ffffff` (with subtle cool boundaries)
-   **Parchment Input Wells:** `#edf2f7`

---

## Typography

The design system relies exclusively on **Source Serif 4**. This typeface provides the necessary gravitas and readability for dense information.

Hierarchy is established through weight and scale rather than font switching. Display and Headline styles use tighter tracking and heavier weights to feel "set in stone," while body text maintains generous line height for maximum legibility. Labels are set in uppercase with slight letter spacing to differentiate them from prose content.

---

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to preserve the "manuscript" feel, centering content with wide, breathable margins.

-   **Grid:** 12-column system for desktop, 4-column for mobile.
-   **Rhythm:** An 8px base unit governs all padding and margins.
-   **Alignment:** Strong vertical axes. Elements should align strictly to the left edge of the grid to maintain an organized, archival structure.
-   **Responsiveness:** On mobile, margins shrink to 16px, and typography scales down according to the mobile-specific tokens defined in the typography section.

---

## Elevation & Depth

Depth is communicated through **Tonal Layers** rather than shadows.

-   **Dark Mode:** Higher-priority elements (like cards or modals) use slightly lighter fills (`#192028` or `#232b32`) against the base background `#0c141b`. This creates a beautiful "stacked" effect.
-   **Light Mode:** Elevation is achieved through "Inverted Depth": interactive areas (inputs) are slightly darker/tented compared to the page background, making them feel recessed and tactile. Subtle, low-opacity 1px borders are preferred over shadows to define boundaries.

---

## Shapes

The design system utilizes **Rounded** geometry. With a base corner radius of 0.5rem (8px), the UI feels modern and accessible without becoming overly playful or "bubbly." Larger components like cards or containers use `rounded-lg` (16px / 1rem) or `rounded-xl` (24px / 1.5rem) to soften the overall composition of the page.

---

## Components Reference

### Buttons

-   **Primary Button:** Solid primary-themed representation with high-contrast text. In Dark Mode, it uses a rich tint (`#adc6ff`) with deep blue on-primary text (`#002e6a`).
-   **Secondary Button:** Ghost style with subtle border or lightweight container tint.
-   **Geometry:** 8px base corner radius (`rounded`).

### Input Fields

-   **Light Mode:** Interactive cool-blue or gray tinted background to stand out from the canvas.
-   **Dark Mode:** Slightly darker/higher contrast than the container surface, outlined with a 1px slate-like border (`#424754` outline-variant).
-   **Focus Sensation:** Always applies a 2px primary focus ring.

### Cards

-   Defined strictly by their background color shift.
-   **Dark Mode Card:** Elevated fill, typically `#192028` or `#232b32` against `#0c141b`.
-   **Light Mode Card:** Elevated flat white surface `#ffffff` against the tinted parchment background `#f5f7fa`.

### Lists & Tables

-   Features crisp, micro hairline dividers (`1px`) in a muted outline color (`#424754` or dynamic equivalent).
-   Row hovering triggers a subtle tonal shift for interactive feedback.

### Chips

-   Small badges used for categories or metadata tags.
-   **Dark Mode:** Dark slate/indigo base with lighter text.
-   **Light Mode:** Saturated light tint of primary with dark text.