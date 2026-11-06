software — existing fragrance search application, not a marketing landing page.
Reference lock: user's seven blue swatches #071039, #0F2270, #1A3BB0, #2E5DE6, #6E92F2, #AFC5F8, #E6EDFD. Skill deal: Manrope pairing, soft radius; user palette replaces random palettes. Native application layout and live product table are the visual material.

Primary action: search the seller's catalog. Secondary action: refresh source prices.
Catalog view: navy library rail; compact live-source toolbar; category heading; white search and filter panel; aligned product table. Other views keep the same system.
Controls: 48px targets, native accessible selects in blue frames, selected/focused states, concise labels. Search 64px. Radius 10/14/20px. Body 16px, metadata 13px, title 44px. Pale blue ground, navy ink, action blue for controls.
Motion: unchanged skill motion layer for hover/press/focus. No scroll effects, WebGL, entrance animation or continuously animated decoration. Product names/prices remain visible from first render.

Applicability: this is a restyle of an existing data application. Marketing-only requirements for a full-screen hero, photographic product sections and full-screen section rhythm do not fit the user's catalog workflow. Keep real rows above the fold instead of adding a landing page. Palette and native functions follow the user's explicit brief.
Verification uses the permitted CUA browser surface; the skill's separate headless-browser scripts conflict with the environment's browser-control rules. Verify at 1440, 1024, 820, 768 and 390 widths, keyboard focus, source refresh, empty state, filters, favorites and reduced-motion CSS.

Verified 6 November 2026:
- Rendered at 1440×900, 1024×768, 820×1180, 768×1024 and 390×844; no horizontal page overflow or overflowing controls.
- Manrope loaded. Native selects retain keyboard behavior. Keyboard focus uses the action-blue border and a 3px soft ring.
- Search (including Cyrillic), tester and price filters, ascending prices, favorites, navigation, empty results and all 14 offer cards work.
- Google Sheets refresh completed successfully after restyling; the timestamp and button icon remain present. Real loading/success/error button states are implemented.
- Field border contrast against white is 3.19:1; primary button contrast against white is 5.49:1. Motion kit files copied unchanged; its reduced-motion rules remain intact.
- Existing parser/data tests and Worker build validation pass. Catalog snapshot and source selection are unchanged. No prices, stock levels or social proof were invented.
- Full-screen marketing layout/performance checkers were not run; responsive UI behavior and rendering were checked in CUA instead. No shader, scene, product photography or stand-in assets are needed for this application restyle.
