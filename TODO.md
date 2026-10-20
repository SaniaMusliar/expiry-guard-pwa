# ExpiryGuard TODO

- [ ] **Responsive Material 3 shell and navigation**
  - The app uses a green-themed Material 3 look with primary `#2E7D32` / `#4CAF50`, soft green tonal surfaces, 16–28px rounded corners, elevated cards, pill chips, and a Material-style extended FAB.
  - It supports light and dark themes, defaults to the system preference, persists the choice, and animates the transition; dark surfaces remain in the deep green-black range with accessible contrast.
  - Mobile uses bottom navigation plus FAB, tablet uses a left navigation rail, and desktop uses a sidebar with a two-column dashboard and multi-column card grid.
  - Touch targets are at least 44px, there is no horizontal page scroll, safe-area insets are respected, and the app exposes visible focus states and ARIA labels.

- [ ] **Dashboard and expiry intelligence**
  - Dashboard shows greeting, cards for expiring today, expiring in 3 days, total items, and saved from waste.
  - “Use Me First” shows soonest-expiring food in a horizontal carousel.
  - Items use green (>7 days), amber (3–7 days), orange (1–3 days), and red (expired/today) status treatments with a ring or countdown label.
  - First launch seeds 8–10 realistic sample foods with varied expiry dates so every status color is visible.
  - An empty state with illustration and CTA appears when no items remain.

- [ ] **Add food capture flows**
  - Add Item opens a bottom sheet/modal with Scan barcode, Snap photo, and Manual tabs.
  - Barcode scanning prefers native `BarcodeDetector`, falls back to ZXing/manual lookup, fetches Open Food Facts data, and handles not-found/offline cases gracefully.
  - Photo capture/upload runs local Tesseract.js OCR, distinguishes manufacturing dates from expiry dates, and lets the user review extracted values before saving.
  - Manual entry includes name, category, quantity, expiry date, storage location (Fridge / Freezer / Pantry), notes, and quick-pick `+3 days`, `+1 week`, and `+1 month` helpers.

- [ ] **Inventory interactions**
  - Inventory is searchable, filterable by category/location/status, and sortable by expiry date by default.
  - Items can be marked used or deleted with animated feedback and an undo snackbar.
  - Item detail/edit sheet supports updating core fields.

- [ ] **Recipe suggestions**
  - Recipes screen matches the local Indian and Italian catalogue against active pantry items, prioritises safe items expiring within 3–5 days, supports cuisine, diet, time, and expiring-ingredient filters with match percentages, searches by recipe name/ingredient, renders incrementally, and can load bounded cached online meals with source attribution.
  - Recipe cards display title, description, cooking time, pantry ingredients, extra ingredients, and steps, with loading skeletons and an error/retry state.

- [ ] **Notifications and demo controls**
  - Settings requests Notification permission, supports configurable lead time, and includes an in-app alert banner/badge when notifications are blocked.
  - A service worker is registered for app-shell caching and can show a test notification when permission is granted.
  - Demo Controls provide simulate +1 day, simulate +3 days, trigger test notification, and reset demo data.

- [ ] **Insights and settings**
  - Insights shows charts for items by status, items saved vs. wasted, and items by category.
  - Settings supports theme choice, notification lead time, JSON export/import, clear all data, and demo controls.

- [ ] **PWA packaging and delivery**
  - `manifest.webmanifest` uses the ExpiryGuard name/short name, green theme/background colors, standalone display, portrait-primary orientation, and 192/512 maskable icons.
  - Service worker uses `vite-plugin-pwa` with app-shell precaching and runtime caching; AI/barcode failures explain offline behavior.
  - A custom install prompt uses `beforeinstallprompt`; an update-available snackbar is shown when a new service worker is ready.
  - Meta tags include viewport, light/dark theme colors, and apple-touch-icon.
  - Build completes without TypeScript/Vite errors and `/manus-routes.json` declares the application route.
