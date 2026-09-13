# DESIGN.md — HeroUI Native

> **Read this before generating any screen.** These are constraints, not preferences.
> Every design you produce will be implemented in React Native using the
> `heroui-native` component library. Anything you draw that does not exist in that
> library has to be hand-built, so it costs real hours. Design inside the box.
>
> **Priority order when instructions conflict:** this file → the screen brief → your
> own defaults. Your own defaults lose.

---

## 1. Platform

- **Primary target:** mobile app, iOS and Android, portrait, `393 × 852`.
- **Density:** touch. Minimum interactive target `44 × 44` pt.
- Design **light and dark** variants of every screen. The library switches themes at
  the token level, so a design that only works in one mode is broken.
- Safe areas exist: keep content out of the top ~50pt and bottom ~34pt unless the
  element is deliberately full-bleed.

---

## 2. The ten hard rules

1. Use **only** the components in §3. No exceptions.
2. Use **only** the colour variables in §5. No hex values, no new colours.
3. **One accent colour** per project. Semantic colours (success / warning / danger)
   are for state only, never decoration.
4. **No gradients, no glassmorphism, no blur-behind panels, no neumorphism.**
5. Radius comes from the radius scale (§7). Never mix radii arbitrarily on one screen.
6. Elevation comes from the shadow tokens (§7). No custom drop shadows.
7. Every screen ships its **loading, empty, and error state** (§9).
8. Contrast floor is **4.5:1** for body text, 3:1 for large text and UI borders.
9. Content must be **plausible and specific** — real-sounding names, times, places.
   No lorem ipsum, no "Item 1 / Item 2", no placeholder greeking.
10. If the brief needs something that doesn't exist here, **compose it from listed
    primitives and record it under GAPS** (§13). Do not invent a component.

---

## 3. Component whitelist

These are the only components available. Names are the actual library exports — use
them verbatim in your annotations (§13).

**Buttons** · `Button` · `CloseButton` · `LinkButton`

**Collections** · `Menu` · `TagGroup` · `ListGroup`

**Controls** · `Slider` · `Switch`

**Forms** · `TextField` · `Input` · `InputGroup` · `TextArea` · `InputOTP` ·
`SearchField` · `Select` · `Checkbox` · `RadioGroup` · `ControlField` · `Label` ·
`Description` · `FieldError`

**Navigation** · `Tabs` · `Accordion`

**Overlays** · `BottomSheet` · `Dialog` · `Popover` · `Toast`

**Feedback** · `Alert` · `Skeleton` · `SkeletonGroup` · `Spinner`

**Layout** · `Card` · `Surface` · `Separator`

**Media / display** · `Avatar` · `Chip` · `Text`

**Utilities** · `PressableFeedback` · `ScrollShadow`

Notes on the ones that get misused:

- **`Surface` vs `Card` vs `Overlay`** — `Surface` is the panel treatment for inline
  content (cards, accordions, disclosure groups). Overlay components (`Dialog`,
  `Popover`, `Menu`, `BottomSheet`) sit on the overlay background, which is a
  *different token*. Don't style a sheet like a card.
- **`ListGroup`** is the correct container for grouped rows — settings lists, option
  lists, record lists. Reach for it before drawing bespoke rows.
- **`PressableFeedback`** is how any custom tappable area behaves. If you draw a
  tappable thing that isn't a `Button`, wrap it in this and say so.
- **`Chip`** is for metadata and filters, not for buttons.

---

## 4. What does not exist — never draw it as if it does

The library has no:

- **Bottom tab bar or top nav bar.** Navigation chrome comes from the router, not the
  UI library. You may draw a bottom tab bar, but treat it as *custom* — keep it plain
  (icon + label, active state via accent colour, no pill backgrounds, no floating
  capsule, no centre FAB) and list it under GAPS.
- **Tables, data grids, calendars, date pickers, time pickers**
- **Carousels, image galleries, page-dot indicators**
- **Badges** (count bubbles), **progress bars or rings**, **meters**, **rating stars**
- **Tooltips**, **breadcrumbs**, **pagination**, **steppers/wizards**, **side drawers**
- **Charts of any kind**
- **Maps** — a map is a third-party view. Draw it as a plain full-bleed rectangle with
  simple markers; never invent map UI chrome beyond a `SearchField` and a `BottomSheet`.
- **Floating action buttons**
- **Segmented controls** — use `Tabs`
- **Avatar groups / stacks** — compose from `Avatar` and label it

If the brief needs one of these, compose it from §3 primitives, keep the composition
as simple as possible, and record it under GAPS.

---

## 5. Colour

Naming rule: **a variable with no suffix is a background; the same name with
`-foreground` is what goes on top of it.** Always use the pair. Never put
`--foreground` text on `--accent`.

**Fixed (identical in every theme):**
`--white` · `--black` · `--snow` · `--eclipse`

**Semantic (switch with the theme — use these for everything):**

| Variable | Use for |
|---|---|
| `--background` / `--foreground` | screen background and primary text |
| `--surface` / `--surface-foreground` | inline panels: cards, accordions, grouped rows |
| `--overlay` / `--overlay-foreground` | dialogs, popovers, menus, bottom sheets |
| `--backdrop` | the scrim behind an overlay |
| `--muted` | secondary and tertiary text only |
| `--default` / `--default-foreground` | neutral fills: secondary buttons, inactive chips |
| `--accent` / `--accent-foreground` | the single primary action colour |
| `--success` / `--success-foreground` | confirmed, completed, valid |
| `--warning` / `--warning-foreground` | caution, needs attention |
| `--danger` / `--danger-foreground` | destructive, failed, invalid |
| `--border` | component borders |
| `--separator` | dividers between rows and sections |
| `--focus` | focus ring |
| `--link` | inline links |

Soft variants (`--accent-soft-foreground` and equivalents) exist for text on tinted
backgrounds. Use them rather than hand-picking a lighter tint.

**Forbidden:** hex or rgb literals, opacity hacks to fake a new colour, more than one
accent, colour as the *only* carrier of meaning.

**Project theme override — paste the actual `@theme` block here before generating:**

```css
/* [PASTE THE PROJECT'S global.css THEME BLOCK HERE] */
/* If empty, use HeroUI Native's default light/dark palette unchanged. */
```

---

## 6. Typography

- All text is the `Text` component. There is no separate heading component.
- Use the project's type roles, defined once here and nowhere else:

| Role | Use | Weight | Notes |
|---|---|---|---|
| Display | the one number or word a screen exists to show | 600–700 | one per screen, maximum |
| Title | screen title, section heading | 600 | |
| Body | primary reading text | 400 | |
| Label | field labels, buttons, chips | 500 | |
| Caption | metadata, timestamps, helper text | 400 | `--muted` |

- **Maximum four type sizes per screen.** More than that reads as unresolved.
- Body copy is left-aligned. Never centre a paragraph.
- Never use letter-spacing on body text, all-caps beyond short labels, or italics for
  emphasis — use weight.
- Font: `[FILL: font family, or "system"]`

---

## 7. Geometry, spacing, elevation

- **Spacing:** multiples of the `--spacing` unit only (a 4pt scale). The usable set is
  4 / 8 / 12 / 16 / 24 / 32 / 48. Nothing between.
- **Radius:** the scale derives from `--radius`. Pick one radius character per project
  and hold it. Form fields have their own token (`--field-radius`) and may differ from
  surfaces — that's intentional, not an inconsistency to "fix".
- **Borders:** `--border` for components, `--field-border-width` for form controls.
  Hairline by default.
- **Elevation:** `--surface-shadow` for panels, `--field-shadow` for inputs. That is
  the entire elevation vocabulary. No layered shadows, no coloured shadows, no
  inner shadows.
- Screen padding: 16pt horizontal by default, 24pt for sparse content-led screens.

---

## 8. Icons

- Line icons, single weight, `24 × 24` at default size, `--foreground` or `--muted`.
- Never emoji as interface icons.
- Never a filled/duotone icon next to a line icon.
- Icons accompany labels in navigation; icon-only controls need an accessible name.

---

## 9. Every screen needs its states

For each screen you generate, also produce these variants:

| State | Built with |
|---|---|
| **Loading** | `Skeleton` / `SkeletonGroup` matching the real layout's shape. Never a centred `Spinner` for a full screen. |
| **Empty** | `Text` explaining what will appear here plus one `Button` that resolves it. Never an illustration-only empty state. |
| **Error** | `Alert` with a plain-language cause and a retry action. |
| **Pressed** | via `PressableFeedback` — show it on the primary row/card type. |
| **Disabled** | reduced-emphasis, still 3:1 contrast. |
| **Invalid** (forms) | `FieldError` beneath the field, plus the field's invalid border token. Text, not just red. |

---

## 10. Accessibility floor

- 4.5:1 body text, 3:1 large text and meaningful borders — in **both** themes.
- 44pt minimum touch target, 8pt minimum gap between adjacent targets.
- Every form control has a visible `Label`. Placeholder text is not a label.
- `Description` for helper text, `FieldError` for validation — both are real
  components, use them rather than loose small text.
- Don't rely on colour alone: pair it with an icon, a label, or position.

---

## 11. Motion

You output static screens, so describe intended motion in the annotation rather than
faking it visually:

- Sheets and dialogs enter once, lightly. No bounce.
- Press feedback is scale + opacity, fast.
- Skeleton → content is a crossfade, not a layout jump: the skeleton must occupy the
  same box as the content it replaces.
- Never draw motion trails, blur streaks, or "animated" gradients.

---

## 12. Anti-patterns — the house style clause

Do not produce work that reads as generated. Specifically avoid:

purple or indigo default accents · gradient headers and gradient buttons ·
glassmorphic cards · large centred hero illustrations · stock photography ·
3D blobs · rounded-pill everything · drop shadows on text · dark mode that's just
inverted light mode · dashboards with fake charts nobody asked for · emoji in
headings · "AI sparkle" iconography on non-AI features · onboarding carousels ·
badges on every icon · four different border radii on one screen.

Restraint reads as considered. When in doubt, remove.

---

## 13. Output contract

Every generated screen must be accompanied by:

```
COMPONENTS
  <region> → <HeroUI Native component name>
  ...

TOKENS
  any non-default token usage worth noting

GAPS
  anything drawn that is NOT in §3, and what it would need to be built from.
  Write "none" if there are none.
```

A screen with an empty GAPS list is a better screen. If GAPS is long, simplify the
design rather than justifying it.

---

## 14. Per-project slots

Fill these in before the first generation. Everything above is fixed; everything here
changes per project.

- **Project:** `[NAME]` — `[one sentence: who uses it, for what, in what context]`
- **Accent colour:** `[oklch value or "default"]`
- **Radius character:** `[sharp 0px / soft 12px / round 20px]`
- **Font:** `[family or "system"]`
- **Density:** `[comfortable / compact]`
- **Aesthetic direction:** `[2–3 sentences. Name what to avoid, not just what to do.]`
- **Theme block:** pasted into §5.

---

*Component list and token names reflect HeroUI Native as of September 2026. The
library ships new components most months — re-check
`heroui.com/docs/native/components` and the theming docs before starting a new
project, and update §3 and §5 rather than working around them.*
