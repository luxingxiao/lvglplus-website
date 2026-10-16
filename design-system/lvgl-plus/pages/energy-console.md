# Energy console preview — verified page overrides

Extends MASTER.md and the established website.md identity. Local UUPM design-system search on 2026-10-16 selected Flat Design and Hero + Features + CTA, suitable for the existing developer platform; retain the established mint/flat overrides instead of generic gold. Astro stack guidance favors prerendered routes with isolated interactive code rather than a hydrated application shell.

- Chinese and English routes preserve language when switched; homepage teaser and primary navigation expose the example.
- Heading → full-width LVGL viewport → accessible command buttons and model readings → capability explanation → pinned source links.
- All product pixels remain C/LVGL output. Use the native screenshot before loading and after errors. Never redraw the instrument using DOM/CSS.
- Runtime and UI package load only on explicit activation. Reduced motion starts the C model paused; explicit play remains available.
- Desktop canvas scales to its container; mobile has separate 44px command controls so tiny on-canvas buttons are not the only interaction path.
- Stateful controls expose aria-pressed; clock/readings are not live announcements. One status region reports meaningful state changes.
- Reserve the canvas aspect ratio, retain visible keyboard focus, respect system key modifiers and keep Escape available. No gradients or decorative motion outside the product image.
- Version links use the verified SDK commit; do not imply unpublished example code is on main or claim physical device tests.
