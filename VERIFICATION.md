# Website verification

Verified locally on 2026-10-15, macOS arm64, Node 26.5.0 and Chrome 141. The deployment build uses Node 24.

- `npm run build`: 19 static HTML pages, sitemap and robots; no server adapter required.
- `npm test`: all generated internal routes/assets resolve under `/lvglplus-website/`; runtime hashes match the recorded SDK commit; actual C/WASM evaluates `50 km/h → 31.06855 mph` and propagates disconnected quality.
- `SITE_URL=http://127.0.0.1:4322/lvglplus-website/ node scripts/check-browser.mjs`: passes against production static preview.
- Browser checks: real WASM canvas and manual input, disconnect/reconnect control, axe WCAG A/AA scan, 375/768/1024/1440px overflow, mobile menu/Escape, bilingual documentation navigation and reduced motion. No page exceptions.
- Desktop hero, full-page mobile, full-page desktop and docs screenshots visually inspected. Local evidence is in ignored `artifacts/` and can be regenerated with the browser script.

This record describes the website. Embedded product and device verification is tracked in the SDK repository and summarized explicitly in the website compatibility documentation.
