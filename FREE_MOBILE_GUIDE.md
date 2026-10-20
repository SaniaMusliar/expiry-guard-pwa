# ExpiryGuard free/mobile delivery guide

## What is free by default

The core app has no backend, account, paid subscription, mandatory API key, or paid notification service. Inventory, expiry calculations, dashboard statistics, insights, JSON export/import, demo date simulation, and offline recipe matching run locally in the browser. Barcode scanning uses browser capabilities and Open Food Facts only when a network is available. The default recipe catalogue contains 39 local entries and the app can load small on-demand online batches that are cached for seven days. The default photo flow uses Tesseract.js OCR in the browser; its OCR worker assets may need one initial download before it can work fully offline.

Third-party availability and pricing can change. ExpiryGuard does not promise that Open Food Facts or any hosting provider will remain free forever.

## Local build

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm dev
```

The development server listens on `http://localhost:3000`.

Production build:

```bash
pnpm build
pnpm preview --host 0.0.0.0
```

## Free HTTPS hosting: GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. To use it:

1. Create a GitHub repository and push this project to its `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow manually from the **Actions** tab.
5. GitHub will publish the Vite `dist` output at `https://YOUR-USER.github.io/YOUR-REPOSITORY/`.

The workflow passes the repository name as Vite’s build base so manifest, icon, service-worker, and asset paths work for a project-site URL. Deployment is not performed by this project session; GitHub account access and repository setup are required.

Cloudflare Pages is also suitable: use `pnpm install --frozen-lockfile` as the install command, `pnpm build` as the build command, and `dist` as the output directory. For a custom domain or root-domain deployment, leave `BASE_PATH` unset.

## Android installation

1. Publish the app to an HTTPS URL. Camera access, service workers, and install prompts are not reliable on plain HTTP; `localhost` is the main development exception.
2. Open the HTTPS URL in Chrome on Android.
3. Use ExpiryGuard’s **Install app** button, or Chrome’s menu → **Install app** / **Add to Home screen**.
4. Allow camera permission only when scanning a barcode or taking an expiry-label photo.
5. Enable browser notifications from Settings only if you want reminders.
6. Reopen ExpiryGuard from the home-screen icon. The app shell and local inventory remain available offline after the relevant assets have been cached.

## Feature availability

| Feature | Offline | Internet needed | Browser/device dependency |
|---|---:|---:|---|
| Add/edit/search/filter/sort/delete inventory | Yes | No | Local storage quota |
| Mark used/wasted and undo | Yes | No | No |
| Expiry status, countdown, dashboard, Use Me First | Yes | No | No |
| Insights charts | Yes | No | No |
| Built-in Indian and Italian recipe matching | Yes | No | No |
| Online recipe discovery and cache | Previously cached results | Yes, only when requested | TheMealDB availability and terms |
| JSON export/import | Yes | No | File picker/download support |
| Local OCR photo reading | After OCR assets are cached | First OCR asset load may need internet | Camera/file input; OCR quality varies |
| Native barcode scanning | No | No for camera itself | Browser `BarcodeDetector` support |
| ZXing barcode fallback | No | No for camera itself | Camera permission and supported browser |
| Open Food Facts product details | No | Yes | Service availability; never provides package expiry |
| Browser/service-worker reminders | In-app fallback works | No paid service | Permission, Android/browser battery settings, app activity |
| PWA install prompt | No | HTTPS site required | Browser install support |

Scheduled reminders are best-effort. They can be delayed or unavailable when the PWA is closed because of Android battery optimization, browser behavior, revoked permissions, or unsupported service-worker notifications.

## Privacy and limitations

Inventory and compressed photo previews stay in local browser storage. Expiry-label text is processed locally by default. The app does not upload personal inventory data for recipe matching. Barcode product lookup sends only the barcode to Open Food Facts when requested.
