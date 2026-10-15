# LVGL Plus website

The bilingual official website for [LVGL Plus](https://github.com/luxingxiao/lvglplus), an independent Apache 2.0 platform for XML instrument UI development.

**Live:** https://luxingxiao.github.io/lvglplus-website/

## Develop

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
npm run build
npm test
```

Open the URL printed by Astro, including `/lvglplus-website/`. The static build contains Chinese and English landing pages and eight documentation pages per language. Fonts, demo assets and documentation are served locally; no account or external CDN is required.

## Design

Designed using the latest verified UI UX Pro Max CLI **2.15.0**, linked from [uupm.cc](https://uupm.cc/). The project-specific design system and verified overrides are in `design-system/lvgl-plus/`. The visual direction combines a dark developer workspace, mint identity, flat panels, restrained motion and a real instrument preview. Reduced motion, keyboard controls, mobile layouts and readable static fallbacks are supported.

To regenerate design research, run `npx --no-install uipro init --ai codex --offline` and `npm run design:generate`. Inspect suggestions before changing the committed design record.

## Real LVGL demonstration

The preview loads the actual LVGL 9.5.0 / Plus C core compiled to WASM on demand. The browser injects telemetry and copies the LVGL framebuffer to canvas; binding and derived-value evaluation run in C. Before loading, a native LVGL screenshot remains available. Simulation and replay here are local demonstration fixtures, not live vehicle connections.

`public/demo/provenance.json` records the source revision and SHA-256 hashes. Updating the demonstration is an explicit maintainer operation:

```sh
# First build and verify the sibling SDK checkout and its studio runtime.
LVGLPLUS_SOURCE=../lvglplus npm run sync:demo
npm run build
npm test
```

The default build uses committed artifacts and does not need Emscripten or the SDK checkout. Product and hardware claims follow the linked source verification matrix. The site does not claim an npm release, certified vehicle support or verification on untested boards.

## Publish

GitHub Pages uses the **GitHub Actions** source. Every push to `main` runs the static build and regression checks, then deploys `dist/`. Pull requests build without deploying. Workflow actions are pinned to reviewed commit SHAs. `astro.config.mjs` sets the project Pages base path, canonical URL and static routes; update both if moving domains.

For browser checks, install Chrome and run `node scripts/check-browser.mjs` while the local site is running. Set `SITE_URL` or `CHROME_PATH` to override defaults. This verifies actual WASM interaction, accessibility, responsive overflow, bilingual docs navigation and reduced-motion behavior; screenshots go to ignored `artifacts/`.

## License

Website code: Apache-2.0. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the LVGL MIT license, font OFL licenses and bundled runtime notices. UUPM is a development tool, not shipped with the static website.
