# Afterhours — ID Studio

A static fictional collectible card creator built with HTML, CSS and vanilla JavaScript. Open `index.html` directly, or serve this folder with any static server. No build step, database, API key or backend.

## Features

- Four original, fan-inspired templates: Stark, Oscorp, TVA and Traveller.
- Front and back previews; default PNG download or custom photo, name, department and card number.
- Local photo upload, CORS-compatible image URLs, zoom, vertical positioning and sepia filter.
- Locally generated scannable QR links, cutting lines and actual-size print layout.
- Combined high-resolution PNG downloads work offline. Fonts fall back to system fonts offline.
- Photo and field data exist only in memory for the open tab. No localStorage, cookies, analytics or database. URL imports contact the chosen image host; Google Fonts loads fonts only.

All artwork is drawn locally on canvas. Default portraits are stylized illustrations, not film stills. Every export says it is a fictional prop. Templates do not reproduce government IDs.

## GitHub Pages

Push to `main`, then in GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The included workflow publishes only the public site files. All asset URLs are relative, so deployment works under `/ids/` as well as a custom domain.

## Image URLs

The image host must allow cross-origin requests. If the browser blocks a remote image, save the image yourself and use local upload. Supported images: JPG, PNG and WebP, up to 10 MB. Remote requests time out after 15 seconds. Images never pass through a third-party proxy.

QR generator: bundled `qrcode-generator` 1.4.4 by Kazuhiko Arase, MIT licensed (license notice retained in `assets/qrcode.js`).
