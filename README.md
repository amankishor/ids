# Collectible card studio

HTML, CSS and vanilla JavaScript. No database, backend, login, analytics, cookies or browser storage. Photo and field data live only in the current tab; refreshing clears them. All app libraries and artwork are bundled for offline use.

## Run

With Node installed, run `npm start` and open **http://localhost:5500**. No installation is required to run the site. Alternatively, use VS Code Live Server or any static HTTP server. An HTTP server is recommended because some browsers restrict image/canvas downloads on `file://` pages.

## Edit directly on the cards

Choose a template and click **create your own**. Hover, click or Tab to a photo or text area on the card itself. Text edits happen in place: Enter or blur commits, Escape cancels, and Ctrl+Enter commits a multiline field. There are no separate forms. Clicking a photo opens a small nearby menu for file upload, image URL, zoom and crop. Photo changes are shared between front/back portraits.

- Oscorp: name, company, staff label, department, number and photo.
- TVA: authority heading, number, photo and sepia filter.
- McLovin movie prop: photo, name, address, number, birth/expiry/issue dates, physical details, signature, restrictions and back notices.
- Stark: name, title, company, number, sector, clearance, photo and back notices.
- Traveller: supplied cat artwork by default; editable name, date of birth, location, issue date, license number, signature, headings, notices, photo caption and reverse text. **select color** opens four swatches and a custom color picker. Changing color begins customization. The default cat remains until you replace it.
- Fight Club: reference-inspired Tyler Durden card with editable photo, English/Chinese name, grade, service number, age, section, serial, expiry and reverse notices. Includes the same four swatches and custom color picker. Its default front uses a matching publicly available reference variant; its back is a companion design. Reference artwork source: https://www.reddit.com/r/fightclub/comments/1ikaq7g/anyone_can_find_the_origin_of_tyler_durdens_id/.

**custom qr** reveals a URL field beneath the cards. QR generation runs locally. **go back to default** restores the original design and clears photo, field, color, QR, crop and cutting-line changes.

## Downloads

Every download is a ZIP containing separate front and back PNGs. Unmodified Oscorp, TVA and McLovin defaults return the user's exact supplied archives unchanged. Customized cards are rendered at full resolution: Oscorp/TVA 3030 × 4801, McLovin 2048 × 1290, Traveller 2014 × 1277, Fight Club 2800 × 1999 and Stark 2560 × 4000. The Fight Club reference is 700 × 500; exporting a larger file preserves that source's inherent detail. Compact previews do not reduce export resolution. Export ZIPs contain `front.png`, `back.png` and printing instructions. Default supplied archives retain their original filenames/resolution.

All designs are fictional fan collectibles, for personal use. McLovin custom exports are explicitly marked as fictional props. Traveller default front and blank texture use the user's supplied images; its reverse is a companion design using the supplied paper texture. Other original defaults are also user supplied. Auxiliary blank artwork was obtained from the user's reference site, https://id.patilshubham.me/.

## Photos

JPG, PNG or WebP, up to 10 MB. Remote image URLs must allow browser CORS access; blocked URLs show an upload fallback, without sending photos through a proxy. Importing a URL contacts that image host only. No photo is uploaded to this site.

## GitHub Pages

Push to `main`, then select **Settings → Pages → Source → GitHub Actions**. The workflow publishes the static files and assets, using relative URLs compatible with `/ids/`. GitHub Pages requires a public repository or a plan supporting private-repository Pages.

## Verification

For development checks, install the declared dev dependency (`npm install`) and run `npm test`. On Windows the browser test uses installed Chrome; on other platforms install the Playwright Chromium browser first. Tests exercise default/custom ZIP contents and resolution, direct editing, Traveller color and photo URLs, reset, compact preview sizing and mobile layout.

Bundled libraries: qrcode-generator 1.4.4 (MIT) and JSZip 3.10.1 (MIT or GPLv3; used under MIT). Copyright/license notices remain in their vendor files.
