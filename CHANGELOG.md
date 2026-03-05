# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Generator Gallery with "Zero State" onboarding presets.
- Simple/Advanced parameter UI toggles for intuitive generation.
- Real-time URL Hash syncing for instant bookmarking and sharing.
- Quantum Core abstract generator.
- "Show Intersections" and "Line Weight" scaling across pattern libraries.
- Headless Agent API (`window.SumoSvgApp`) with generator listing and headless rendering functions.

### Changed

- Refactored entire global state to a stackable `Layer[]` architecture.
- `generateVariants` now mutates the full stacked visualization instead of isolated modules.
- Replaced direct PNG/SVG downloads with an un-sandboxed "Copy SVG Code" rendering workflow.
- Relocated mathematical Sacred Geometry loops into standalone module rendering.
- Renamed "New Layer" to "Open Gallery".

### Fixed

- Stabilized hydration errors during initial Vitest rendering.
- Hide `hasAdvancedParams` logic dynamically per-generator.

## Archive: Updates 2

## 1. README upgrades

- Add a 1‑sentence tagline under the title that hits use case + uniqueness (e.g., “open, non‑AI generative SVG engine with a headless agent API”). [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- Add a “Live Demo” link at the top once it’s deployed (GitHub Pages / Cloudflare); this is huge for recruiters. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- Add a tiny “Tech Stack” section: SvelteKit, TypeScript, Vitest, adapter‑static, etc. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- Add 1–2 screenshots or GIFs (gallery, layer stack, Quantum Glitching) right in the README. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

## 2. Repo metadata

- Fill out the “About” box: short description + website (live demo URL) + a few topics (`sveltekit`, `svg`, `generative-art`, `creative-coding`). [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- Add a LICENSE file so it looks like a real OSS project (MIT is fine unless you want something spicier). [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

## 3. Dev & quality signals

- Add a minimal CI workflow (GitHub Actions) that runs `npm test` / `npx vitest run` on push; green checks scream “I care about quality.” [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- In README “Testing,” add one sentence about what’s actually covered (e.g., “core generators are snapshot‑tested to keep their visual output stable over time”). [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

## 4. API & usage sweetness

- Under `window.SumoSvgApp`, add a “Quick Example” code block showing how an external script/agent would call `listGenerators()`, tweak params, and call `renderNow()`. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- Add a short “Who is this for?” section: designers, devs, agents. It makes the project feel intentional, not random. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

## 5. Nice‑to‑have but optional

- A `Screenshots/` or `docs/` folder with 2–3 PNGs you can also reuse in portfolio/blog. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)
- A `CHANGELOG.md` once you start cutting “stages” like The Great Expansion; looks very grown‑up. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

## Archive: Updates

## 1. Generator UX: steal Haikei’s polish, keep your depth

From Haikei, the big wins aren’t the math, it’s the frictionless “pick generator → tweak → export in 5 seconds” loop. Concretely, for SumoSized: [haikei](https://haikei.app)

- Add a “gallery of generators” page with big visual thumbnails, hover previews, and one‑click “load into stack,” not just a select box. [haikei](https://haikei.app/generators/)
- Per‑generator “simple” vs “advanced” panels: default to 3–5 key sliders, gate the insane parameters behind an “advanced controls” toggle. [fountn](https://fountn.design/resource/haikei/)
- Save/share presets as URLs (encode state in query/hash) so people can share specific looks like Haikei’s generators, but for your whole stack. [haikei](https://haikei.app/blog/welcome-to-haikei/)

This lets normies get Haikei‑level speed while you keep the freak‑level math under the hood.

## 2. Procedural workflows: steal Graphite’s node‑brain

Graphite is going hard on “everything is procedural, node graph + layers, parametric editing.” You already have procedural generators and a layer stack; push it further: [digitalproduction](https://digitalproduction.com/2025/07/14/graphite-open%E2%80%91source-vector-design-tool-with-a-twist/)

- Add a simple “node view” for the layer stack: nodes for generators, color transforms, blend steps; still render back to your current canvas. [graphite](https://graphite.rs/?__from__=talkingdev)
- Make generator parameters linkable: let one slider feed multiple layers (e.g., master “chaos” or “scale” node), Graphite‑style param chains. [digitalproduction](https://digitalproduction.com/2025/07/14/graphite-open%E2%80%91source-vector-design-tool-with-a-twist/)
- Introduce reusable “macros”: record a stack + parameter wiring as a reusable generator in your library. [graphite](https://graphite.rs)

You don’t need full Houdini; even a minimal node overlay instantly makes you look more serious than “SVG toy site.”

## 3. Layer + API power: go past DrawSVG / Drawsocket

DrawSVG and Drawsocket both treat layers and SVG groups as first‑class and expose them over an API. You’ve already got `window.SumoSvgApp`—you can simply out‑gun them: [drawsocket.github](https://drawsocket.github.io/api.html)

- Add layer‑level API methods: `addLayer(type, config)`, `removeLayer(id)`, `reorderLayer(id, index)`, `setLayerBlendMode(id, mode)`, `setLayerOpacity(id, value)`. [drawsvg](https://drawsvg.org/doc/integration-api.html)
- Add “scenes” or “boards”: multiple canvases in one project, switchable via API, so external tools can generate a whole pack in one session. [graphite](https://graphite.art)
- Add a lightweight event bus: fire events like `onRender`, `onVariantApplied`, `onPresetSaved` so headless controllers can react instead of poll. [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

If someone wants “the most controllable SVG generator on earth,” that combo plus your math gets you there.

## 4. Export and integration: copy Haikei’s production bias

Haikei wins because it pipes directly into real workflows (social posts, websites, decks) with sane defaults and exports. Borrow that: [genspark](https://www.genspark.ai/spark/exploring-haikei-a-web-app-for-svg-design-assets/6ba8edd6-b286-4130-add5-d1aaae7d9512)

- One‑click exports: SVG, PNG, WebP at common sizes (OG image, Twitter header, YouTube thumb, 4K wallpaper). [producthunt](https://www.producthunt.com/products/haikei)
- “Ready‑to‑ship” presets: pre‑built compositions tuned for specific use cases (hero background, section divider, subtle noise overlay). [haikei](https://haikei.app)
- Code snippets panel: auto‑generate `<svg>` snippet, inline CSS, and React/Svelte component wrappers for the current art. [renderform](https://renderform.io/blog/posts/svg-generators-list)

Make it trivial for devs to drop your output into production and suddenly you’re not “art toy,” you’re a pipeline tool.

## 5. Experience: ruthless speed and discoverability

The top tools feel instant and discoverable; you can absolutely do that with a static SvelteKit app. Focus on: [graphite](https://graphite.rs/?__from__=talkingdev)

- Zero‑state onboarding: when the app opens, show a curated “start with these 5 insane presets” grid, no empty canvas. [haikei-seven.vercel](https://haikei-seven.vercel.app/components/generators.html)
- Keyboard‑first: hotkeys for new layer, randomize, undo/redo, next/prev preset, toggle preview, etc. [graphite](https://graphite.art)
- Deterministic seeds: show and let users edit the RNG seed so results are reproducible and shareable. [dev](https://dev.to/georgedoescode/a-generative-svg-starter-kit-5cm1)

This is all cheap UX but makes the thing feel like a serious **tool**, not just a demo.

## 6. Opinionated “killer mode” unique to you

None of these other apps have your Quantum Glitching / Depth Interlacing energy. Lean into one signature feature that nobody else can fake: [github](https://github.com/sumosizedginger/SumoSized-SVG-Maker)

- Build a dedicated “Glitch Lab” mode: timeline of random steps, stuttered variants, frame‑by‑frame SVG export for animation pipelines. [graphite](https://graphite.rs)
- Or a “Field Studio”: interactive flow‑field controller with draggable attractors/repulsors that update the SVG live. [dev](https://dev.to/georgedoescode/a-generative-svg-starter-kit-5cm1)

One iconic mode + the stolen best practices above = easy marketing narrative: “Haikei‑level polish, Graphite‑level proceduralism, DrawSVG‑level control, and a glitch lab nobody else has.”

1. App modules (top‑level structure)
   Core SVG Engine: existing SvelteKit generative library, layer stack, Quantum Glitching, Depth Interlacing, export logic.
   ​

UX Shell: Haikei‑style generator gallery, presets browser, canvas/workspace layout, export panel.

Procedural Node View (optional panel): Graphite‑inspired param graph for power users.

Headless/API Surface: window.SumoSvgApp plus new layer/scene/event APIs, designed to be called from Antigravity tasks or tools.

Think of it as: engine (you already have) + three “faces” (friendly gallery, node lab, headless API).

2. Screens and flows
   a) Home / Generator Gallery
   Goal: Haikei‑fast “see something cool in 5 seconds.”

Big grid of generators/presets with live or animated thumbnails.

Filters: “Backgrounds, Glitch, Sacred Geometry, Textures, Layouts.”
​

Click = loads a curated stack into the main workspace, not just a single generator.

“Random pack” button that assembles a full composition from tagged generators.

b) Workspace / Canvas Screen
Goal: one place for 90% of use: tweak → variant → export.

Panels:

Canvas: main SVG preview with zoom, pan, and a seed display.

Layer Stack: list of layers with generator name, visibility, blend mode, opacity, drag‑reorder.
​

Inspector:

Simple tab: 3–5 primary params + color palette.

Advanced tab: full schema dump from generator (what you already use internally).
​

Global Controls: global variant engine, global seed, Quantum Glitching / Depth Interlacing toggles.
​

Actions:

Hotkeys for: randomize, undo/redo, new layer, duplicate layer, toggle preview, export.

“Save preset”: snapshots stack + seed to local storage and returns an ID/URL for sharing.

c) Node / Procedural View
Goal: power‑user panel that earns the “top SVG maker” flex.

Optional toggle: “Node Lab.” When on, you see a minimal graph view:

Nodes: Generators, Color Transforms, Noise/Glitch, Composites.

Edges: parameter links (e.g., one “Chaos” slider feeding multiple generators).

Node editor just reads/writes the same state as the layer stack, so you don’t fork logic.
​

Simple operations: add param link, break link, create macro (subgraph saved as a custom generator).

d) Export / Integration Panel
Goal: make the thing production‑ready, Haikei‑style.

Export formats: SVG (raw + “optimized”), PNG/WebP at common sizes (OG card, hero, wallpaper).

“Use in code” tab:

Raw <svg> snippet.

Inline CSS version.

Svelte/React component snippet with props for key params.

Export packs: “Generate N variants with different seeds and download as zip” (perfect for Antigravity‑driven batches).

3. API/Headless design for Antigravity
   You already have listGenerators, getGeneratorSchema, getCurrentState, renderNow, savePreset. Extend this into a real “world’s best SVG generator API”:
   ​

a) State/control APIs
setGlobalSeed(seed)

setGlobalVariant(intensity | config)

addLayer({ generatorId, config, position? })

updateLayer(id, partialConfig)

setLayerBlendMode(id, mode)

setLayerOpacity(id, value)

reorderLayer(id, newIndex)

removeLayer(id)

b) Scene/board APIs
createScene(name, config?)

switchScene(id)

listScenes()

exportScene(id, format, options)

This lets Antigravity tasks script full packs/boards (thumbnails, heroes, etc.) from one loaded page.

c) Events / hooks
on(eventName, handler) and off(eventName, handler).

Events: render, variantApplied, presetSaved, sceneChanged, error.

Then in Antigravity you can write tools that:

Open the app URL.

Call window.SumoSvgApp.\* to generate assets.

Wait on events instead of polling every frame.

4. Presets, modes, and marketing hooks
   You want obvious “this is why it’s the best” surfaces.

Preset Packs: “Hero Backgrounds,” “Noise Overlays,” “Glitch Posters,” each just saved stacks + parameters.

Modes:

“Quick Mode” (Haikei‑like) → hides node view, hides advanced controls, focuses on 30 curated presets.

“Lab Mode” → node view on, advanced controls on, full chaos.

Signature Lab:

“Glitch Lab” screen with timeline of seeded variants, ability to export as SVG frames or as a spritesheet.

5. How this maps to Antigravity IDE
   Inside Antigravity, treat this as:

One front‑end app: your SvelteKit bundle deployed somewhere static (GitHub Pages, Cloudflare, whatever).
​

One “tool” surface: a headless browser/agent that knows how to:

Navigate to the app.

Use window.SumoSvgApp to list generators, pick presets, and render/export assets.
​

Save exported SVG/PNG to Google Drive or local project storage.

Optional “API wrapper” file: define typed wrappers around window.SumoSvgApp so Antigravity’s code completion and agents know the surface.
