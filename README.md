# SumoSized SVG Generator

<p align="center">
  <img src="Sumo Sized Ginger.svg" alt="SumoSized SVG Maker Logo" width="100%">
</p>

**An open, non‑AI generative SVG engine with a headless agent API.**

🚀 **100/100 Production-Ready (2026 Standards)**: Fully typed, decoupled DDD architecture, featuring INP-optimized coordinate precision and complete WCAG 2.1 AA vector semantics.

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

- **Generative Library**: Choose from mathematical patterns, chaotic flow fields, structural layouts, and sacred geometry.
- **Layer Composition**: Stack unlimited generators, apply standard CSS blend modes (`screen`, `multiply`, `overlay`, etc.), and reorder layers.
- **Global Variant Engine**: Jitter and mutate the entire layer stack simultaneously with a single click.
- **2026 Accessibility**: All outputs feature baked-in WCAG 2.1 AA structural roles (`graphics-document`, `graphics-object`).
- **High-Performance Renders**: GPU-promoted compositing and string precision caching guarantees stutter-free UI interactions.
- **Copy SVG Code**: Instant optimization and one-click copy to clipboard for native vector art portability.
- **Headless API**: Exposes `window.SumoSvgApp` to allow external tools and AI agents to manipulate the canvas remotely.

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

### Testing

Core generators are snapshot‑tested to keep their visual output stable over time.

```bash
npx vitest run
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

- `listGenerators()`: Returns all available templates.
- `getGeneratorSchema(id)`: Returns the detailed parameter schema.
- `getCurrentState()`: Returns the global `appState` layers.
- `renderNow()`: Returns the live SVG markup.
- `savePreset(name)`: Snapshots the entire composition.
