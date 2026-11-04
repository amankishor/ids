# Afterhours — ID Studio

A static fictional collectible card creator built with HTML, CSS and vanilla JavaScript. Open `index.html` directly, or serve this folder with any static server. No build step, database, API key or backend.

## Features

- Five fan-inspired templates: Oscorp, TVA, McLovin, Stark and Traveller.
- Front and back previews; default PNG download or custom photo, name, department and card number.
- Local photo upload, CORS-compatible image URLs, zoom, vertical positioning and sepia filter.
- Locally generated scannable QR links, cutting lines and actual-size print layout.
- Combined high-resolution PNG downloads work offline. Fonts fall back to system fonts offline.
- Photo and field data exist only in memory for the open tab. No localStorage, cookies, analytics or database. URL imports contact the chosen image host; Google Fonts loads fonts only.

Oscorp, TVA and McLovin defaults use the exact front/back PNGs supplied by the user in three ZIP archives. Default downloads return those unchanged archives, preserving original resolution. Enabling QR or cutting lines exports a rendered PNG instead. These are fictional movie collectibles. Stark and Traveller use locally drawn artwork.

The main page uses a simple blue template gallery. Oscorp custom mode begins with an upload placeholder and an empty name; click the card photo to upload or the name to focus its input. The custom QR toggle reveals the URL field directly beneath the cards.

## GitHub Pages

Push to `main`, then in GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The included workflow publishes only the public site files. All asset URLs are relative, so deployment works under `/ids/` as well as a custom domain.

## Image URLs

The image host must allow cross-origin requests. If the browser blocks a remote image, save the image yourself and use local upload. Supported images: JPG, PNG and WebP, up to 10 MB. Remote requests time out after 15 seconds. Images never pass through a third-party proxy.

QR generator: bundled `qrcode-generator` 1.4.4 by Kazuhiko Arase, MIT licensed (license notice retained in `assets/qrcode.js`).
