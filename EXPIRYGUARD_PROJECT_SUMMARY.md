# ExpiryGuard: Project Summary

## 1. Project Overview

**ExpiryGuard** is a mobile-first Progressive Web App for household food-expiry management. It helps users record groceries, monitor expiry dates, prioritise food that should be used soon, discover recipes based on available ingredients, and reduce avoidable food waste.

The application is designed to work without an account, backend, paid subscription, or mandatory API key. Core inventory management, expiry calculations, dashboards, charts, JSON backup, and built-in recipe matching operate locally in the browser. Open Food Facts is used only for optional online barcode product details.

**Positioning:** a calm, practical kitchen companion that turns “use me soon” into less waste.

**Primary users:** individuals, families, students, shared households, and anyone who wants a lightweight grocery-expiry assistant on a phone.

## 2. Problem Statement

Households often forget food stored in refrigerators, freezers, and pantries. Expiry information is distributed across packages, expiry dates are difficult to monitor manually, and users may not know what to cook with ingredients that are close to expiring. This leads to unnecessary food waste, repeated purchases, avoidable spending, and poor visibility into household inventory.

Existing solutions may require accounts, complex databases, constant connectivity, or paid AI services. ExpiryGuard addresses these problems with a local-first, installable PWA that combines expiry tracking, prioritisation, recipe matching, optional scanning, and offline operation.

## 3. Objectives

1. Provide a simple way to add and maintain household food items.
2. Highlight food that expires today or within the next few days.
3. Help users decide what to cook using ingredients already available.
4. Reduce dependency on paid APIs, backend hosting, and user accounts.
5. Support offline operation for all important inventory functions.
6. Provide mobile-friendly camera, barcode, notification, and installation flows.
7. Protect user privacy by keeping inventory data in local browser storage by default.
8. Offer export/import so users can back up and move their inventory.
9. Provide clear error handling when camera, network, OCR, or notification features are unavailable.

## 4. Scope

### Included

- Dashboard and urgency summary
- Use Me First item carousel
- Manual food entry
- Barcode scanning and lookup
- Local expiry-label OCR
- Optional AI image recognition
- Inventory search, filter, sort, edit, delete, and undo
- Used and wasted item tracking
- Offline Indian and Italian recipe catalogue and matching
- Optional on-demand online recipe loading with bounded caching
- Optional online product lookup through Open Food Facts
- Browser and service-worker notifications where supported
- Insights charts
- Theme selection
- JSON export/import
- Demo controls and simulated dates
- Installable PWA behavior
- Static hosting configuration for free HTTPS providers

### Excluded or optional

- User accounts and cloud synchronisation
- Shared household collaboration
- Paid push-notification infrastructure
- Mandatory AI access
- Server-side database
- Automatic knowledge of the expiry date printed on a specific package from a barcode alone

## 5. Functional Features

### 5.1 Dashboard

The dashboard provides an immediate summary of the kitchen:

- Items expiring today
- Items expiring within the next three days
- Total active items
- Items saved from waste
- Use Me First horizontal carousel
- Expiry status colours and countdown labels
- Circular expiry rings
- Notification-blocked banner with in-app reminder fallback
- Empty state with a clear add-food action

Status states include expired, today, soon, amber, and fresh. The demo clock offset is applied consistently to countdowns, status labels, and expiry rings.

### 5.2 Food Entry

Users can add food through three methods:

#### Manual entry

The manual form supports:

- Food name
- Category
- Quantity
- Unit
- Expiry date
- Storage location: Fridge, Freezer, or Pantry
- Notes
- Optional barcode
- Quick expiry choices: +3 days, +1 week, and +1 month

#### Barcode entry

The barcode workflow:

1. Uses the browser’s native `BarcodeDetector` API when available.
2. Falls back to ZXing browser scanning when native detection is unavailable.
3. Requests the rear camera through `getUserMedia`.
4. Sends the detected or manually entered barcode to Open Food Facts when online.
5. Prefills product name, category, and available product image.
6. Allows manual entry when the product is not found or the network is unavailable.

Barcode databases provide general product information; they cannot determine the actual expiry date on the particular package in the user’s kitchen.

#### Photo and expiry-label entry

The photo workflow:

1. Captures or selects a food-label image.
2. Compresses the image locally before storage.
3. Runs browser-compatible local OCR using Tesseract.js.
4. Attempts to detect product text and labelled dates.
5. Recognises labels such as expiry, use-by, best-before, manufacturing, MFG, and MFD.
6. Does not automatically treat a manufacturing date as an expiry date.
7. Shows extracted values for user review before saving.
8. Provides a clear manual-entry fallback for blurry or unsupported images.
9. Provides manual review and fallback when local OCR cannot confidently read a label.

### 5.3 Inventory

The inventory screen supports:

- Search by food name
- Filter by category
- Filter by storage location
- Filter by expiry status
- Sort by expiry date or name
- Edit item details
- Mark an item as used
- Delete an item
- Undo a used or deleted action
- Display expiry rings, status labels, storage, quantity, and date
- Responsive card grid on larger screens and touch-friendly cards on mobile

### 5.4 Recipes

Recipes are available without an API key or network connection.

The built-in catalogue contains 39 curated local recipes: 29 Indian and 10 Italian. Each entry has a stable recipe ID, accurate ingredient list, preparation steps, cuisine label, cooking time, dietary classification, and local-catalogue source metadata. It currently includes:

- Paneer and spinach dishes
- Omelettes
- Poha
- Aloo palak
- Tomato rice
- Chicken pepper fry
- Yogurt fruit parfait
- Bread upma
- Chicken pulao
- Moong dal tadka
- Vegetable upma
- Vegetable pulao
- Dal khichdi
- Chana masala
- Aloo paratha
- Palak dal
- Lemon rice
- Tomato basil pasta
- Vegetable pasta
- Minestrone soup
- Mushroom risotto
- Tomato basil bruschetta

The matcher:

- Compares recipe ingredient keywords with inventory items.
- Prioritises items expiring today or within five days.
- Scores recipes according to available and expiring ingredients.
- Lists ingredients available from the pantry.
- Lists missing ingredients.
- Shows ingredient quantities and preparation steps.
- Supports Indian/Italian cuisine filtering.
- Supports vegetarian/non-vegetarian filtering.
- Supports maximum cooking-time filtering.
- Shows a match percentage plus available and missing ingredients.
- Uses exact normalized ingredient aliases rather than unsafe substring matches.
- Excludes expired food from recommendations.
- Supports an “only expiring ingredients” filter.
- Works fully offline.

Recipe suggestions are built into the application and require no external service.

### 5.5 Notifications and Reminders

Users can configure reminder lead time for:

- On the day
- One day before
- Three days before
- Five days before

Notifications are requested only after explicit user interaction. When permission is granted, the app checks due items and uses the service worker notification API where supported. If notifications are blocked or unavailable, the dashboard continues to show in-app reminders.

Notifications are best-effort. Closed-app delivery can be delayed or unavailable because of Android battery optimisation, browser policies, service-worker support, or revoked permissions.

### 5.6 Insights

The Insights screen presents visual summaries of:

- Items by expiry status
- Saved versus wasted items
- Items by category
- Current inventory distribution

Charts are loaded lazily to reduce initial application cost.

### 5.7 Settings

Settings include:

- System, light, and dark theme
- Notification lead time
- Explicit notification enablement
- JSON export
- JSON import with validation
- Clear inventory
- Demo date simulation
- Demo data reset
- Test notification trigger
- Offline and privacy guidance

### 5.8 PWA Features

The app includes:

- Web app manifest
- Standalone display mode
- Portrait orientation preference
- Green theme and background colours
- 192px and 512px PNG install icons
- SVG brand icon
- Apple touch icon
- Service-worker app-shell precaching
- Runtime caching for selected Open Food Facts resources
- Install prompt handling
- Update-available snackbar
- Offline-ready indicator
- Safe-area-aware mobile layout
- Responsive bottom navigation, tablet navigation rail, and desktop sidebar

## 6. Technical Architecture

### 6.1 High-level architecture

```text
User
  |
  v
React UI and responsive navigation
  |
  +-- App state orchestration
  |     +-- Dashboard
  |     +-- Inventory
  |     +-- Recipes
  |     +-- Insights
  |     +-- Settings
  |
  +-- Local application services
  |     +-- localStorage persistence
  |     +-- expiry calculations
  |     +-- offline recipe matching
  |     +-- JSON export/import
  |     +-- notification checks
  |
  +-- Device/browser capabilities
  |     +-- Camera and BarcodeDetector
  |     +-- ZXing fallback
  |     +-- Tesseract.js OCR
  |     +-- Service worker
  |
  +-- Optional external services
        +-- Open Food Facts product lookup
```

### 6.2 Frontend architecture

- **React:** component-based user interface.
- **TypeScript:** typed domain models, props, application state, and service results.
- **Vite:** development server and production bundler.
- **Tailwind CSS:** utility styling and responsive layout.
- **Framer Motion:** page, card, sheet, and list animations.
- **Lucide React:** interface icons.
- **Recharts:** insights visualisations.

### 6.3 State management

Application state is held in the React application shell and includes:

- Food items
- Used count
- Wasted count
- Theme preference
- Notification lead time
- Demo date offset
- Generated or matched recipes

State changes are persisted to browser `localStorage`. Images are compressed before storage and import data is schema-validated. Oversized or malformed data is rejected gracefully.

### 6.4 Data model

```ts
interface FoodItem {
  id: string
  name: string
  category: Category
  quantity: number
  unit: string
  expiryDate: string
  location: Location
  notes: string
  imageUrl?: string
  barcode?: string
  createdAt: string
}

interface Recipe {
  id: string
  title: string
  description: string
  cuisine: 'Indian' | 'Italian'
  diet: 'vegetarian' | 'non-vegetarian'
  cookingTime: string
  ingredientsUsed: string[]
  extraIngredients: string[]
  steps: string[]
  diet?: 'vegetarian' | 'non-vegetarian'
  prepMinutes?: number
  ingredientQuantities?: string[]
  availableIngredients?: string[]
  missingIngredients?: string[]
  expiringIngredients?: string[]
}
```

### 6.5 Persistence and privacy

Inventory data is stored on the user’s device. There is no application database and no automatic cloud synchronisation. Optional external requests are limited to the user-selected action:

- Barcode number to Open Food Facts for product lookup

The app does not upload personal inventory data for local recipe matching.

## 7. Project Structure

```text
expiryguard/
├── .github/workflows/deploy-pages.yml
├── public/
│   ├── icons/
│   ├── manifest.webmanifest
│   └── manus-routes.json
├── src/
│   ├── components/
│   │   ├── AddItemSheet.tsx
│   │   ├── ChartsPanel.tsx
│   │   ├── FoodCard.tsx
│   │   ├── Navigation.tsx
│   │   ├── ScreenSections.tsx
│   │   └── icons.tsx
│   ├── data/
│   │   └── recipes.ts
│   ├── lib/
│   │   ├── ai.ts
│   │   ├── barcode.ts
│   │   ├── expiry.ts
│   │   ├── recipes.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js
├── tsconfig*.json
├── vite.config.ts
└── FREE_MOBILE_GUIDE.md
```

### Important source files

- `src/App.tsx`: application shell, state, navigation, themes, notifications, installation, and update behavior.
- `src/components/ScreenSections.tsx`: dashboard, inventory, recipe, insight, and settings views.
- `src/components/AddItemSheet.tsx`: manual, barcode, camera, OCR, and optional AI entry flow.
- `src/components/FoodCard.tsx`: food cards, status visuals, and expiry rings.
- `src/lib/expiry.ts`: date calculations, status classification, countdowns, sorting, and metrics.
- `src/lib/storage.ts`: persistence, validation, import/export, quota protection, and IDs.
- `src/lib/barcode.ts`: camera scanning and Open Food Facts lookup.
- `src/lib/ai.ts`: local OCR and expiry-label parsing.
- `src/lib/recipes.ts`: offline recipe matching and filtering.
- `src/data/recipes.ts`: 39-entry local Indian and Italian recipe catalogue.
- `src/lib/onlineRecipes.ts`: bounded TheMealDB loading, source mapping, and seven-day cache.
- `vite.config.ts`: Vite and service-worker configuration.
- `public/manifest.webmanifest`: PWA metadata.

## 8. User Workflow

### Typical household workflow

1. The user opens ExpiryGuard on an Android phone.
2. They install it from Chrome using **Install app** or **Add to Home screen**.
3. They add groceries manually, by barcode, or by expiry-label photo.
4. The dashboard immediately classifies items by urgency.
5. Items nearing expiry appear in **Use Me First**.
6. The user opens Recipes and filters for vegetarian, fast, or expiring-ingredient meals.
7. The app matches local recipes against inventory.
8. The user cooks or consumes an item and marks it as used.
9. The saved-from-waste metric increases.
10. The user exports JSON periodically for backup.

### Barcode workflow

1. Tap **Add food**.
2. Select **Barcode**.
3. Start the camera or enter the barcode manually.
4. ExpiryGuard detects the barcode.
5. If online, Open Food Facts returns general product information.
6. The app fills the product name and category.
7. The user enters the package-specific expiry date.
8. The user reviews and saves the item.

### Offline workflow

1. The app shell is loaded from the service worker.
2. Inventory remains available from local storage.
3. Users can add, edit, search, filter, sort, use, waste, delete, and undo items.
4. Dashboard metrics and charts continue to work.
5. Built-in recipe matching continues to work.
6. Barcode product lookup shows a manual-entry message when offline.
7. The app displays an offline indicator where supported.

## 9. Design and User Experience

The visual direction is **Material Garden Console**, combining Flutter-like Material 3 interaction patterns with a warm household utility aesthetic.

### Design principles

- Put urgency in the foreground.
- Make logging light and forgiving.
- Use green for trust and stewardship.
- Reserve amber, orange, and coral for food risk.
- Keep interactions tactile and calm.

### Visual system

- Signature green: `#2E7D32`
- Action green: `#4CAF50`
- Dark green-black surface range: `#0F1A12`
- Rounded cards and bottom sheets
- Pill-shaped filter controls
- Circular expiry rings
- Leaf brand mark
- Soft canopy hero header
- Inter/system typography

### Responsive behavior

- Mobile: bottom navigation and floating Add food action
- Tablet: left navigation rail
- Desktop: sidebar and expanded multi-column layout
- Minimum touch target: 44px
- Safe-area padding for mobile devices
- No intentional horizontal overflow

### Accessibility

- Semantic labels and ARIA attributes
- Keyboard focus states
- Modal dialog semantics
- Focus trapping and focus restoration in the add/edit sheet
- Escape-to-close support
- Tab semantics for add-food methods
- High-contrast light and dark themes
- Clear error and empty states
- Reduced-motion-friendly transition approach

## 10. External Services and Dependencies

| Service or dependency | Purpose | Mandatory? | Network required? |
|---|---|---:|---:|
| React | UI framework | Yes | No at runtime |
| TypeScript | Static typing | Build-time | No at runtime |
| Vite | Build and dev server | Build-time | No at runtime |
| Tailwind CSS | Styling | Build-time | No at runtime |
| Framer Motion | Animation | No | No |
| Lucide React | Icons | No | No |
| Recharts | Insights charts | No | No |
| Tesseract.js | Local OCR | No, photo feature only | Initial OCR assets may require caching |
| BarcodeDetector | Native barcode scanning | No | No |
| ZXing | Barcode fallback | No | No |
| Open Food Facts | Product information | No | Yes |
| TheMealDB | Optional on-demand online recipe discovery | No | Yes |
| vite-plugin-pwa | Service-worker generation | Build-time | No at runtime |

Third-party service availability and pricing may change. The app does not claim that external services will remain free permanently.

## 11. Testing and Validation

### Build validation

The project has been validated with:

```bash
pnpm install
pnpm build
```

The TypeScript/Vite production build completes successfully. The only build notice is a chunk-size warning caused by the OCR and chart dependencies; it does not prevent the build.

### Static-hosting validation

The project was tested for:

- Root-site Vite build
- GitHub Pages project-subpath build
- PWA manifest generation
- Service-worker generation
- Raster icon availability
- Route manifest availability
- No stale emitted Vite configuration artifacts

### Functional test scenarios

1. Add an item manually and verify it appears on the dashboard and inventory.
2. Edit an item and verify the updated fields persist after reload.
3. Search and filter inventory by name, category, location, and status.
4. Mark an item as used and verify the saved metric changes.
5. Delete an item and use Undo to restore it.
6. Simulate +1 and +3 days and verify countdowns, status labels, and rings update.
7. Open Recipes offline and verify local recipe matching works.
8. Apply diet, time, and expiring-ingredient filters.
9. Import malformed JSON and verify it is rejected without crashing the app.
10. Export JSON and re-import it successfully.
11. Attempt barcode lookup offline and verify the manual-entry fallback message.
12. Use a known barcode online and verify the product name/category are prefetched.
13. Deny camera access and verify a friendly camera fallback message.
14. Capture a label and verify local OCR returns reviewable values or a manual-entry fallback.
15. Verify manufacturing dates are not automatically saved as expiry dates.
16. Block notifications and verify the dashboard in-app reminder remains available.
17. Install from an HTTPS host and verify standalone PWA behavior.
18. Switch between system, light, and dark themes.
19. Clear inventory and verify the empty state and call-to-action.

### Environment limitations

Physical Android camera permissions, device-specific installation behavior, Android battery optimisation, and closed-app notification reliability require testing on a real phone and cannot be fully reproduced in a desktop sandbox.

## 12. Deployment

### Local development

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm dev
```

The development server runs on port 3000.

### Production build

```bash
pnpm build
```

### Preview production output

```bash
pnpm preview --host 0.0.0.0
```

### GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`.

Required steps:

1. Create a GitHub repository.
2. Push the project to the `main` branch.
3. Enable **Settings → Pages → GitHub Actions**.
4. Push to `main` or start the workflow manually.
5. Open the generated HTTPS GitHub Pages URL on Android.
6. Install the PWA from Chrome.

The workflow builds the project with the repository-name base path and publishes the `dist` directory.

### Cloudflare Pages

Recommended settings:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- Environment: Node.js 20 or newer

HTTPS hosting is required for reliable camera access, service workers, and PWA installation. The project session does not claim deployment has been completed.

## 13. Security and Privacy Considerations

- No user account is required.
- No backend database is used.
- Inventory data remains in local browser storage by default.
- API keys are not included in source code.
- Barcode requests send only the barcode to Open Food Facts.
- Optional AI image recognition requires an explicit user-configured key and network request.
- Imported data is validated before entering application state.
- Local images are compressed and size-limited before persistence.
- The app provides manual fallbacks when external services fail.

Users should still treat browser storage as device-local application data and maintain JSON backups for important inventories.

## 14. Limitations

1. `localStorage` is device-specific and does not automatically synchronise across phones or computers.
2. Browser storage has finite quota; very large image collections may need to be removed or exported.
3. OCR accuracy depends on lighting, image sharpness, label layout, and language support.
4. Barcode lookup requires internet access and depends on Open Food Facts coverage.
5. Barcode data does not provide the expiry date for a specific package.
6. Native barcode detection varies by browser; ZXing is used as a fallback.
7. Notifications are best-effort and may not fire when the app is closed.
8. PWA installation requires HTTPS in normal deployment.
10. Recipe matching uses a curated local catalogue rather than unlimited generated recipes.
11. Third-party APIs and hosting providers may change availability, limits, or pricing.

## 15. Future Enhancements

- IndexedDB migration for larger image and inventory datasets
- Optional encrypted cloud backup chosen by the user
- Household sharing with explicit consent
- More regional cuisines and multilingual OCR
- Better OCR date confidence and label-specific review UI
- Product quantity depletion and serving-based inventory
- Shopping-list generation for missing recipe ingredients
- Calendar integration
- More granular waste analytics
- Optional offline OCR language packs
- Automated end-to-end mobile testing on Android devices
- More efficient chunk splitting for OCR and chart bundles

## 16. Current Project Status

- Application type: installable React PWA
- Default data model: local-first
- Default recipe mode: offline and free
- Default expiry-label mode: local OCR
- Local recipes: 39 bundled entries (29 Indian, 10 Italian)
- Online recipes: on-demand TheMealDB batches up to 12, cached for seven days
- Barcode product lookup: optional online Open Food Facts integration
- Photo OCR: local Tesseract.js processing with manual review
- Backend: none required
- Paid service: none required for core features
- Latest checkpoint: `f6c8801`
- Production build: passed
- GitHub Pages workflow: included but not deployed by this project session
