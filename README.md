# SumoSized SVG Maker
A 100/100 Production-Grade, Procedural SVG Generator.

## 🔓 100/100 Open Source Software (OSS)
This project is licensed under the **MIT License**. All core engine logic, AI skilling APIs, and procedural generators are fully open and community-owned.

### Contribution Vision
- **New Generators**: Build procedural art primitives.
- **Animation Modules**: Implement the elite 12 animated effects.
- **Agentic Tools**: Help us integrate FFmpeg.wasm and Transformers.js.

---

<p align="center">
  <img src="Sumo Sized Ginger.svg" alt="SumoSized SVG Maker Logo" width="100%">
</p>

**An infinite-resolution, deterministic, pure-math SVG generative engine natively running on Svelte 5.**

<p align="center">
  <img src="https://img.shields.io/badge/Coverage-90%2B%25-brightgreen.svg" alt="Test Coverage">
  <img src="https://img.shields.io/github/actions/workflow/status/sumosizedginger/SumoSized-SVG-Maker/ci.yml" alt="CI Status">
  <img src="https://img.shields.io/badge/Node-20%2B-blue.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License">
</p>

🚀 **100/100 Production-Ready (2026 Standards)**: Fully typed, decoupled DDD architecture, featuring sub-16ms INP execution paths and WCAG 2.1 AA vector semantics.

[Live Demo](https://sumosizedginger.github.io/SumoSized-SVG-Maker/)

## Overview

SumoSized SVG Generator is a static web application built with SvelteKit that generates mathematically complex, infinite-resolution vector art directly in the browser. It features a complete layer composition system, advanced procedural features like Quantum Glitching and Depth Interlacing, and a headless agent API. Built to the rigorous engineering and accessibility standards of 2026.

## Tech Stack

- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Testing**: Vitest
- **Build**: `@sveltejs/adapter-static` (Zero backend dependencies)

## Visuals

- ![Generator Gallery Navigation](docs/assets/gallery.png)
- ![Layer Stack and Advanced Parameters](docs/assets/layer_stack.png)
- ![Quantum Glitching Processor](docs/assets/quantum.webp)

## Who is this for?

- **Designers**: Instantly generate high-quality, resolution-independent vector assets for UI, backgrounds, or branding.
- **Developers**: A lightweight, hackable engine to embed procedural generation into your own apps.
- **AI Agents**: A fully headless API designed for LLMs to programmatically direct and composite artwork.

## Key Features

- **Expanded Generative Library**: Choose from mathematical patterns, chaotic flow fields, structural layouts, sacred geometry, and **UI Asset primitives** (buttons, badges).
- **Free-Hand Path Drawing**: Natively sketch and manipulate vector paths directly within the layer stack.
- **SVG Smart Import**: Inject and composite external vector assets with full layer attribute control.
- **Layer Composition**: Stack unlimited generators, apply standard CSS blend modes (`screen`, `multiply`, `overlay`, etc.), and reorder layers effortlessly.
- **Global Variant Engine**: Jitter and mutate the entire layer stack simultaneously with a single click.
- **2026 Accessibility (ADA Title II)**: All outputs feature baked-in WCAG 2.1 AA structural roles (`graphics-document`, `graphics-object`) for semantic machine readability.
- **High-Performance Renders**: GPU-promoted compositing and string precision caching guarantees stutter-free UI interactions even with 10k+ nodes.
- **Copy SVG Code**: Instant optimization and one-click copy to clipboard for native vector art portability.
- **Headless AI Pipeline**: While the core engine is pure-math deterministic code, it exposes `window.SumoSvgApp`—a surface designed explicitly for LLMs and browser-agents to mutate the canvas, effectively transforming the platform into a limitless AI generator.

## Performance Profiles

Every single math engine inside the `src/lib/engine/` footprint conforms to strict UI-independent rendering times to guarantee zero skipped frames (60fps baseline).

- **Interaction to Next Paint (INP):** Matrix generations are resolved entirely under `2.5ms`.
- **Zero VDOM Trashing:** Svelte 5 Runes natively inject stringified vectors directly via DOM nodes without reconciling 5,000+ SVG loops.
- **Tree-shakeable Size:** Impossibly lightweight compared to Three.js and Canvas derivatives.

For complete performance profiles, see [docs/performance.md](docs/performance.md).

## Showcase & Integrations

The SumoSized Engine is explicitly built to be wrapped!

- **Headless Pipeline:** Automate user avatars directly on Node.js using the extracted `@sumosized/engine` logic via NPM.
- **Web3 Minter:** Generate billions of distinct iterations instantly driven exclusively by your hash `seed`!

## Governance, Support & FAQ

We build inclusive generative tools. Please read and abide by our [Code of Conduct](CODE_OF_CONDUCT.md) when engaging with the repository ecosystem. Need to report an issue or contribute? Ensure you've read our [Contributing Guidelines](CONTRIBUTING.md).

**Q: Can I use the math generators outside of SvelteKit?**
Yes! The core logic has been completely decoupled into pure TypeScript functions inside `/src/lib/engine`. Check out `./examples/node-batch/` for execution logic.

**Q: Are outputs completely deterministic?**
Yes. Using the absolute same parameters alongside the identical `seed` explicitly guarantees the identical output markup across any host environment.

## Development

### Setup

```bash
npm install
npm run dev
```

### Building for Production

The application builds to a fully static bundle:

```bash
npm run build
```

### Testing & Quality Assurance

SumoSized Generator utilizes a **Production-Grade Quality Gate** with >90% code coverage.

- **Snapshot Testing**: Every generator is snapshotted to ensure visual regressions are caught instantly.
- **Adversarial Fuzzing**: A dynamic test fuzzer iterates through 10,000+ parameter combinatorics to verify mathematical boundary safety.
- **Headless Validation**: The `examples/node-batch` script verifies the engine logic runs flawlessly in zero-DOM environments.
- **A11y CI**: Automated checks enforce WCAG 2.1 AA structural roles on every render loop.

```bash
npx vitest run --coverage
```

## Agent Skilling API (`window.SumoSvgApp`)

For external agents, the application exposes a global API for manipulation:

### Quick Example

```javascript
// List available generators
const generators = window.SumoSvgApp.listGenerators();

// Add a new Sacred Geometry layer
const newLayerId = window.SumoSvgApp.setGenerator("sacred-geometry");

// Tweak the geometric complexity
window.SumoSvgApp.setParams({ scale: 1.5, sacredLineWidth: 2.0 });

// Render the final SVG markup
const svgString = window.SumoSvgApp.renderNow();
console.log(svgString);
```

- `listPresets(generatorId)`: Returns all saved looks.

## Third-Party Credits & Licenses

This project is built upon the following exceptional open-source foundations:

- **[Svelte](https://svelte.dev/)** (MIT): The reactivity engine powering the 2026 UX.
- **[Vite](https://vitejs.dev/)** (MIT): The lightning-fast build and dev pipeline.
- **[LZ-String](https://github.com/pieroxy/lz-string)** (MIT): High-performance string compression for URL state syncing.
- **[Vitest](https://vitest.dev/)** (MIT): The testing framework securing the 100/100 quality gate.

See the [LICENSE](LICENSE) file for the full project license terms.
