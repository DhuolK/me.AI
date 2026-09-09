---
name: me.AI
description: Expert knowledge monetization and deterministic diagnostic evaluation platform
colors:
  primary: "#2b59d1"
  primary-hover: "#2144a4"
  neutral-bg: "#f6f3f1"
  neutral-surface: "#ffffff"
  neutral-border: "#cecac8"
  text-primary: "#242424"
  text-secondary: "#4e4d4d"
  text-muted: "#797776"
  accent-mist: "#cfdaf5"
  accent-sky: "#a0b5eb"
  accent-mint: "#a7fccd"
  accent-coral: "#ff9473"
typography:
  display:
    fontFamily: "'Untitled Serif', 'Newsreader', 'Playfair Display', Georgia, Cambria, serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.15
  headline:
    fontFamily: "'Untitled Serif', 'Newsreader', Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "'Untitled Serif', 'Newsreader', Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "'ABC Diatype Mono', 'JetBrains Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'ABC Diatype Mono', 'JetBrains Mono', monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "-0.033em"
rounded:
  card: "40px"
  pill: "100px"
  inner: "24px"
  tag: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
---

# Design System: me.AI

## Overview

**Creative North Star: "The Technical Monad Journal"**

me.AI is designed as an authoritative, physical research journal adapted for modern high-stakes evaluation. The visual language rejects sterile corporate SaaS templates, glowing cyberpunk accents, and generic AI chat interfaces. Instead, it treats the screen as warm parchment paper (`#f6f3f1`) holding archival typography and scientific evidence.

The interface combines two complementary typographic worlds: the literary, unhurried authority of **Untitled Serif** for titles and verdicts, paired with the forensic precision of **ABC Diatype Mono** for criteria metrics, citations, code blocks, and data tables. Interface surfaces feel tangible and physical—cards have a generous 40px radius with 1px ash hairline borders, buttons depress with realistic mechanical travel (`scale(0.97)`), and drawers glide with custom cubic-bezier deceleration curves.

**Key Characteristics:**
- **Warm Parchment Canvas**: Ambient foundation (`#f6f3f1`) that feels like heavy rag paper rather than cold `#ffffff` digital plastic.
- **Editorial Typography Pairing**: Untitled Serif at natural reading weight (400) contrasted against disciplined monospace data grids.
- **Hairline Boundary Discipline**: 1px ash borders (`#cecac8`) delineate structure without heavy dropshadows or noisy container fills.
- **Physical Weight & Micro-Physics**: Emil Kowalski motion principles—tactile button compression on active press, modal scale-up from 0.95, and stacked Sonner toast notifications.

## Colors

The palette is anchored by warm parchment, deep charcoal ink, and Lake Blue as the sole authoritative action tint.

### Primary
- **Lake Blue** (`#2b59d1`): The primary focal point and verified badge color. Used strictly for primary calls-to-action, active state indications, and verified provenance highlights.
- **Lake Blue Hover** (`#2144a4`): Compressed dark state for button hovers and pressed links.

### Secondary
- **Periwinkle Mist** (`#cfdaf5`): Soft atmospheric wash used for non-critical tag backings, category badges, and subtle focal backgrounds.
- **Mint** (`#a7fccd`): Positive evaluation badge backing used exclusively for passing heuristics and verified Daraja payment confirmations.
- **Coral** (`#ff9473`): Critical diagnostic flag and penalty backing for unquantified assertions and uncapped liability warnings.

### Neutral
- **Warm Parchment** (`#f6f3f1`): The universal page canvas and foundational background.
- **Pure White** (`#ffffff`): Elevated card surface background providing crisp reading contrast against parchment.
- **Ash** (`#cecac8`): Universal 1px hairline border color for cards, table dividers, input borders, and modal wrappers.
- **Off-Black Ink** (`#242424`): Primary reading color for headings, titles, and high-emphasis body text.
- **Graphite** (`#4e4d4d`): Secondary body text, instructional copy, and rubric descriptions.
- **Smoke** (`#797776`): Micro labels, timestamp metadata, and footnote markers.

### Named Rules
**The Single Accent Rule.** Lake Blue is used on less than 10% of any given screen area. Its rarity creates instant visual hierarchy; decorative blue washes are prohibited.

**The No-Colored-Shadow Rule.** Shadows are never tinted with primary blue or coral. All elevation is handled via opacity-stepped neutral ink (`rgba(0,0,0,0.06)`) or hairline ash borders.

## Typography

**Display Font:** 'Untitled Serif', 'Newsreader', 'Playfair Display', Georgia, Cambria, serif
**Body Font:** 'ABC Diatype Mono', 'JetBrains Mono', 'Space Mono', monospace
**Label/Mono Font:** 'ABC Diatype Mono', monospace

**Character:** Scholarly, rigorous, and deliberate. The combination of an un-bracketed book serif with a high-legibility geometric monospace conveys institutional authority and technical precision.

### Hierarchy
- **Display** (weight 400, `clamp(2.5rem, 5vw, 4rem)`, line-height 1.15): Hero section promises and primary marketplace intros.
- **Headline** (weight 400, `1.875rem` / 30px, line-height 1.25): Diagnostic report headers and primary section titles.
- **Title** (weight 400, `1.25rem` / 20px, line-height 1.35): Heuristic card headings, drawer question titles, and tier labels.
- **Body** (weight 400, `0.875rem` / 14px, line-height 1.6, max 72ch): Diagnostic critique descriptions, remediation instructions, and pack overviews.
- **Label** (weight 600, `0.6875rem` / 11px, letter-spacing `-0.033em`, uppercase): Tag pills, audit question tags, and table header keys.

### Named Rules
**The Book Serif Rule.** Display and title headings are set in weight 400 serif. Bold serifs (weights 700+) feel heavy-handed and commercial; weight 400 preserves literary authority.

**The Monospace Data Rule.** All numeric metrics, timestamps, telephone inputs, citations, scores, and chunk excerpts must be rendered in monospace.

## Layout

The spatial model is based on generous margins and disciplined 8px multiples:
- **Maximum Width:** Content wraps inside `max-w-6xl` (1152px) for reports and dashboards, and `max-w-5xl` (1024px) for focused authoring studios.
- **Spacing Scale:** Standard gaps are 16px (`gap-4`), 24px (`gap-6`), 32px (`gap-8`), and 48px (`gap-12`).
- **Responsive Padding:** Mobile screens maintain 16px outer gutter (`px-4`), expanding to 24px (`px-6`) on tablet and 32px (`px-8`) on desktop viewports.

## Elevation & Depth

me.AI is flat-by-default, relying on tonal layering rather than heavy drop shadows:
- **Depth Layers:** Background canvas (`#f6f3f1`) &rarr; Elevated card surface (`#ffffff`) with 1px ash hairline border (`#cecac8`).
- **Modal Depth:** Overlays use `bg-ink/60` with `backdrop-blur-sm` and a subtle diffuse ambient shadow (`0 25px 50px -12px rgba(0, 0, 0, 0.15)`).

### Named Rules
**The Hairline-Over-Shadow Rule.** Spatial boundaries between cards and backgrounds must be established by a 1px solid ash hairline border (`border border-ash`), not by floating drop shadows.

## Shapes

- **Card Shells:** Signature 40px rounded corners (`rounded-[40px]`) on primary cards, modal containers, and hero callouts.
- **Interactive Pills:** Full 100px capsule radius (`rounded-pill` / `rounded-full`) for all action buttons, input wrappers, and filter chips.
- **Nested Inner Surfaces:** 24px rounded corners (`rounded-inner` / `rounded-[24px]`) for cards nested inside 40px parents to maintain geometric concentricity.
- **Tag Pills:** 9999px capsule radius (`rounded-full`) with 11px uppercase monospace type.

## Components

### Buttons
- **Shape:** Full pill radius (`rounded-full` / `100px`).
- **Primary:** Background Lake Blue (`#2b59d1`), text white (`#ffffff`), padding `12px 28px`. Hover shifts to `#2144a4`. Active state compresses to `scale(0.97)` via Kowalski physics.
- **Ghost / Outlined:** Background transparent, text off-black (`#242424`), 1px ash border (`#cecac8`), padding `12px 24px`. Hover background warm parchment (`#f6f3f1`).

### Cards
- **Shape:** 40px corner radius (`rounded-[40px]`).
- **Surface:** Pure white background (`#ffffff`) with 1px solid ash border (`#cecac8`).
- **Internal Padding:** 32px (`p-8`) desktop, 20px (`p-5`) mobile.

### Tag Pills
- **Shape:** Full capsule (`rounded-full`), padding `4px 12px`.
- **Typography:** 11px uppercase monospace, letter-spacing `-0.033em`.
- **Variants:** Primary Lake Blue tint (`bg-periwinkle-mist/40 text-lake-blue`), Verified Mint (`bg-mint/30 text-off-black`), Critical Coral (`bg-coral/20 text-off-black`).

### Inputs
- **Shape:** 100px capsule radius (`rounded-pill`) for single-line inputs; 24px inner radius (`rounded-inner`) for textareas.
- **Border:** 1px solid ash border (`#cecac8`), shifting to Lake Blue (`#2b59d1`) on focus with zero default browser outline.
- **Background:** Parchment fill (`#f6f3f1`) inside white cards.

## Do's and Don'ts

### Do:
- **Do** preserve the warm parchment canvas (`#f6f3f1`) across all pages.
- **Do** set all major headings in Untitled Serif at weight 400.
- **Do** apply `scale(0.97)` physical compression on button click/press.
- **Do** use 1px ash hairline borders (`#cecac8`) for card separation.
- **Do** display all financial amounts in formatted Kenyan Shillings (`formatKes(amount)`).
- **Do** provide Sonner toast notifications for asynchronous actions.

### Don't:
- **Don't** use thick colored vertical side-tabs (`border-l-2` / `border-l-4`) on cards—this is the telltale sign of AI-generated dashboards.
- **Don't** use pure `#000000` black for body text; use off-black ink (`#242424`) or graphite (`#4e4d4d`).
- **Don't** use standard heavy sans-serif fonts (Inter, Roboto) for headings; use Untitled Serif.
- **Don't** introduce colored glow drop-shadows or gradients on cards.
- **Don't** use conversational assistant greetings ("Here is your review!"); present findings with the detachment of an expert examiner.
