# ExpiryGuard implementation plan

## Scope and approach

ExpiryGuard will be a mobile-first React + TypeScript + Vite PWA that runs entirely in the browser. Inventory, theme choice, demo clock offset, notification preference, and recipe/photo fallback state will persist in localStorage so the app remains usable offline with no backend. Expiry-label reading uses browser-compatible local OCR with a manual review fallback and friendly offline errors. Barcode scanning will prefer the native `BarcodeDetector` API and provide a manual barcode lookup fallback through Open Food Facts.

The app will use a single-page shell with view state for Dashboard, Inventory, Recipes, Insights, and Settings. A reusable bottom navigation / tablet rail / desktop sidebar will adapt at 768px and 1024px. Add-item and item-detail flows will be modal bottom sheets on mobile and centered dialogs on larger screens. Service-worker registration, manifest metadata, install prompting, and update notifications will be owned by `vite-plugin-pwa` and the application manifest.

## Project structure

- `src/App.tsx`: application shell, navigation state, modal orchestration, theme/install/update behavior, and screen composition.
- `src/types.ts`: typed inventory, recipe, theme, and filter models.
- `src/data.ts`: seeded demo inventory and food metadata.
- `src/lib/storage.ts`: localStorage persistence and export/import helpers.
- `src/lib/expiry.ts`: date math, countdown labels, status colors, and dashboard metrics.
- `src/lib/ai.ts`: local OCR and expiry-label parsing with offline-safe errors.
- `src/lib/barcode.ts`: native BarcodeDetector capability detection and Open Food Facts lookup.
- `src/components/`: reusable cards, item rows, bottom sheets, charts, navigation, and settings controls.
- `src/index.css`: Tailwind layers plus Material 3-like tokens, dark theme, motion, focus, safe-area, and responsive layout styling.
- `public/manifest.webmanifest`, `public/icons/*`, `public/manus-routes.json`: PWA assets and route declaration.
- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`: build, styling, and PWA configuration.

## Design direction

### Considered styles

- **Material Garden Console** — a gentle household utility with tonal green surfaces, rounded cards, and tactile controls (0.06).
- **Editorial Pantry Ledger** — a paper-like inventory journal with serif typography and restrained charts (0.04).
- **Neon Freshness Lab** — a high-contrast dark control room with luminous status markers (0.03).

Chosen: **Material Garden Console**.

### Design movement

Flutter-like Material 3, interpreted as a warm household control surface rather than a generic admin dashboard.

### Core principles

1. Put urgency in the foreground: expiry status and the next useful action are always visible.
2. Make logging feel light: large touch targets, chips, bottom sheets, and forgiving empty/error states.
3. Use green as a behavioral cue for stewardship, not as decoration; warmer status colors are reserved for food risk.
4. Keep the interface calm at a glance, then reward deeper exploration with small motion and tactile feedback.

### Color philosophy

A signature garden green (`#2E7D32`) anchors trust and action while pale mint surfaces keep household data friendly. Amber, orange, and coral only appear when an item needs attention. Dark mode moves into green-black surfaces (`#0F1A12`) so status colors remain legible without turning the screen into a black void.

### Layout paradigm

A persistent navigation spine on tablet and desktop frames a two-column dashboard: the day’s urgency on the left, “Use Me First” and insights on the right. Mobile collapses that spine into a thumb-friendly bottom bar with a floating add action.

### Signature elements

- A leaf-shaped brand mark and soft “canopy” hero header.
- Circular expiry rings that turn from leaf green to coral as dates approach.
- Tactile pill filters and a raised extended FAB labeled “Add food”.

### Interaction and animation

All interactive controls have 44px minimum targets, visible focus rings, ripple-like pressed states, and short spring transitions. Cards enter with a subtle upward fade; sheets use a drag handle and scale/opacity transition; list removal animates out before the undo snackbar appears. Respect `prefers-reduced-motion`.

### Typography system

Use Inter with system fallbacks. Page titles are compact, bold, and slightly letter-spaced; metric numbers are large and tabular; helper copy is 13–15px with high contrast. Status labels use medium weight and sentence case.

### Brand essence and voice

ExpiryGuard is the calm, practical kitchen companion that turns “use me soon” into less waste. Personality: caring, crisp, optimistic.

Headlines: “Make room for what matters.” CTAs: “Add food before it gets forgotten.”

### Wordmark and signature color

The wordmark pairs a small sprouting-leaf mark with a rounded bold “ExpiryGuard” label. The ownable brand color is **Guard Green** (`#2E7D32`), supported by a brighter action green (`#4CAF50`).

## Build workflow

Use pnpm with a checked-in pnpm 11 build policy, install the declared dependencies, run TypeScript/Vite build checks, start the Vite server on the managed port 3000, verify `/manus-routes.json`, and save the completed project to the canonical Manus repository. The app will not require a backend or publish automatically.
