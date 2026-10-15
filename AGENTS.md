# Website contributor instructions

- Keep this repository independent from the LVGL Plus SDK repository.
- Keep product claims aligned with the linked source revision and verification matrix. Do not invent device support, customer logos, adoption numbers, benchmarks or npm releases.
- Product preview pixels must come from the actual LVGL C/WASM runtime. Keep the static LVGL screenshot available before loading and on errors.
- Use the UI UX Pro Max design record and page overrides in design-system/lvgl-plus.
- All routes/assets must work under /lvglplus-website/. Keep English and Chinese navigation aligned.
- Before release run npm run build and npm test; check desktop/mobile, keyboard, reduced motion and actual WASM interaction in a browser.
