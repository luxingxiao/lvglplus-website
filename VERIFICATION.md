# Website verification

Verified locally on 2026-10-15, macOS arm64, Node 26.5.0 and Chrome 155.0.8059.40. The deployment build uses Node 24.

- `npm run build`: 19 static HTML pages, sitemap and robots; no server adapter required.
- `npm test`: all generated internal routes/assets resolve under `/lvglplus-website/`; runtime hashes match the recorded SDK commit; actual C/WASM evaluates `50 km/h → 31.06855 mph` and propagates disconnected quality.
- `SITE_URL=http://127.0.0.1:4322/lvglplus-website/ node scripts/check-browser.mjs`: passes against production static preview.
- Browser checks: real WASM canvas and manual input, disconnect/reconnect control, axe WCAG A/AA scan, 375/768/1024/1440px overflow, mobile menu/Escape, bilingual documentation navigation and reduced motion. No page exceptions.
- Desktop hero, full-page mobile, full-page desktop and docs screenshots visually inspected. Local evidence is in ignored `artifacts/` and can be regenerated with the browser script.

This record describes the website. Embedded product and device verification is tracked in the SDK repository and summarized explicitly in the website compatibility documentation.

## Energy console addition — 2026-10-16

Local environment: macOS arm64, Node 24.16.0 and installed Chrome. SDK input is pinned to `b2137fd256427af3cbb9c00a83ea9d3e571ae385`; this example's artifacts are independent of the existing vehicle demo's older snapshot.

- Static build: 21 HTML pages, including Chinese and English energy routes and their sitemap entries.
- Unit/integration checks: five tests pass, covering all internal routes/assets, both provenance records and actual C/WASM execution. The energy initial RGB framebuffer matches the native renderer's SHA-256 exactly; commands and the paused C clock are checked.
- The export operation checks the SDK's three native visual baselines before copying any public assets.
- Production-preview browser checks: both real WASM demos, energy HTML/C commands, actual LVGL canvas pointer and touch, keyboard, bilingual example routes, 375/768/1024/1440px overflow, 44px mobile controls, reduced motion, axe WCAG A/AA, runtime failure fallback and retry pass. No unhandled page exceptions.
- Native and WASM verification describe software rendering. No new ARM cross-compilation, physical device or energy-system acceptance was performed.

Visual evidence is regenerated in ignored `artifacts/energy-{desktop,mobile,home}.png`. Deployment and live-site checks are reported separately from these local checks.
