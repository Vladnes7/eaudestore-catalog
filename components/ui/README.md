# Interactive Hover Button

React/TypeScript component supplied in the brief, with decorative duplicates hidden from screen readers. Uses `lucide-react` and the `cn` helper in `lib/utils.ts`. `demo.tsx` shows the ordinary React import.

The `/components/ui` path is the shadcn component convention. `components.json` and `tsconfig.json` map `@/components/ui` and `@/lib/utils` to the correct folders. Tailwind 4 is configured in `tailwind.css`, without Preflight so the existing catalog layout is preserved.

Install and check the existing setup:

```sh
npm ci
npm run typecheck
npm test
npm run build
```

For a new React application, the equivalent manual setup is installing `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, TypeScript and Tailwind CLI; then copying the provided `components.json`, `tsconfig.json`, `tailwind.css` and `lib/utils.ts`. In a supported framework the shadcn CLI can initialize this configuration with `npx shadcn@latest init`.

In this catalog, `scripts/render-button.tsx` renders the React component to static markup during the build. `ui-effects.js` reuses that markup in existing native buttons and links while preserving their element IDs, events, disabled states and native navigation. React and lucide are not shipped as a browser runtime. `dark.css` adapts the supplied hover interaction for Russian labels, touch, keyboard focus and reduced motion. Resource links deliberately omit arrow icons as requested.
