# Third-party notices

The generated static website includes the following third-party materials. Original license text is distributed with the site.

| Material | License | Published notice |
| --- | --- | --- |
| LVGL 9.5.0 in the C/WASM demo | MIT | `demo/LVGL-LICENSE.txt` |
| LVGL Plus runtime and native instrument screenshot | Apache-2.0 | `demo/LVGLPLUS-LICENSE.txt` |
| LodePNG, bundled by LVGL | zlib-style | `licenses/LodePNG.txt` |
| Montserrat, built into the LVGL demo | SIL OFL 1.1 | `licenses/Montserrat-OFL.txt` |
| Inter Variable | SIL OFL 1.1 | `licenses/Inter-OFL.txt` |
| Space Grotesk Variable | SIL OFL 1.1 | `licenses/Space-Grotesk-OFL.txt` |
| Emscripten runtime support | MIT and University of Illinois/NCSA | `licenses/Emscripten.txt` |

Astro and the UI UX Pro Max CLI are build/development tools. Their package licenses remain in the installed dependencies. The site is independently implemented and does not distribute LVGL Pro source, metadata or proprietary XML definitions.

## Energy console demo

`public/demo/energy` bundles another copy of the LVGL/Plus C runtime, UI package, native screenshot and project-authored XML/Model from the SDK commit recorded in its `provenance.json`. The same LVGL MIT, Plus Apache-2.0, Montserrat OFL, LodePNG and Emscripten notices above apply. Full LVGL and Plus license texts are also included next to these artifacts. The example adds no third-party application assets or C widgets.
