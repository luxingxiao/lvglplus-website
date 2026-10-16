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

## Energy console preview

The bilingual energy console is available at `/examples/energy-console/` and `/en/examples/energy-console/` below the project Pages base. The homepage and navigation link to it. It loads a separate real LVGL/WASM runtime on demand, preserving the existing vehicle demo.

- LVGL paints every canvas pixel. The C model executes pause, speed, reverse, load step, detail switching and reset.
- Canvas pointer/touch and semantic keyboard input go through the C ABI. Accessible HTML controls call the same C commands, with current readings taken from the model.
- Reduced motion starts paused. A native screenshot remains visible before launch and after errors, with a retry action.
- `public/demo/energy/provenance.json` pins the SDK commit, initial native RGB hash and all artifact/source/license hashes. Source links point at that exact commit, independently of whether its PR has merged.
- Data are synthetic. No device connection or real energy control is included. Detail switching retains previously allocated caches.

To update this independent example from a clean, built SDK checkout, use **Node.js 24** (the reviewed PNG baselines were generated with that version):

```sh
LVGLPLUS_SOURCE=../lvglplus npm run sync:energy
npm run build
npm test
SITE_URL=http://127.0.0.1:4322/lvglplus-website/ npm run test:browser
```

The site now generates 21 HTML pages. `sync:energy` rechecks native baselines, exports the UI package/runtime/source and verifies the poster. Normal GitHub Pages builds use committed assets and require no sibling checkout or Emscripten. Browser checks cover both previews, canvas pointer/touch, model commands, language switching, four viewport widths, reduced motion, accessibility, failed WASM loading and retry.
