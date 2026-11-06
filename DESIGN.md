# Eaudestore catalog design

Existing fragrance search application. The latest user brief replaces the earlier blue palette with Midnight Black #0B0B0C, Pure White #FFFFFF and Lime Green #C6F432. Landonorris.com is a reference for lime accents and button movement. Keep the practical catalog layout and real rows above the fold.

Manrope, soft corners, dim surfaces, quiet table borders and white prices. Lime marks focused/selected fields, active navigation, source status and actions. No photographs or marketing hero are needed for the search workflow.

The supplied InteractiveHoverButton lives in components/ui with TypeScript, Tailwind and shadcn-compatible aliases. React renders it once during the build; native buttons/anchors reuse the markup without a client React runtime. Decorative duplicate text is hidden from assistive technology. Existing hrefs, disabled states and event handlers remain intact. Google Sheet and price-post buttons retain their destinations and omit arrows, including in their hover state.

Motion follows the explicit user request: a six-second wordmark shimmer, subtle ambient lime light, an expanding dot fill on hover or keyboard focus, and a short fade/vertical transition between application sections. Rapid navigation cancels the previous transition. The pause control saves its preference locally; OS reduced motion disables effects. This overrides the design-taste-frontend default against continuous decorative motion. Its base motion files remain unchanged.

Verified in the permitted CUA browser on 6 November 2026:
- Mobile 390×844: no horizontal overflow; full-width source buttons fit their labels and have no arrows.
- Rapid section switching resolves to the last selected section; only one section remains visible.
- Pausing removes wordmark/background animation and CSS transition duration becomes zero.
- Source refresh succeeds against the live Google Sheet; catalog contains 45,657 positions.
- Search in Cyrillic and tester filtering retain the expected Nasomatto Black Afgano result and source price.
- TypeScript checks, existing data/parser tests and generated Worker module validation pass. Snapshot data and parser remain unchanged.

Current desktop checks at 1440×900 and 1024×768 show no horizontal overflow. Keyboard focus expands the shared button fill, keeps the label centered and visible, and omits arrows on resource links. The previous blue layout had also been checked at 820 and 768 widths.
