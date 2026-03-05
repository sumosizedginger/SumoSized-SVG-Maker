# SumoSized SVG Generator

**An open, non‑AI generative SVG engine with a headless agent API.**

[Live Demo] <!-- Add URL here once deployed to Pages/Cloudflare -->

## Overview
SumoSized SVG Generator is a static web application built with SvelteKit that generates mathematically complex, infinite-resolution vector art directly in the browser. It features a complete layer composition system, advanced procedural features like Quantum Glitching and Depth Interlacing, and a headless agent API.

## Tech Stack
- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Testing**: Vitest
- **Build**: `@sveltejs/adapter-static` (Zero backend dependencies)

## Visuals
*(Add screenshots/GIFs here: e.g., Gallery, Layer Stack, Quantum Glitching)*
- ![Generator Gallery Navigation](C:\Users\sumos\.gemini\antigravity\brain\f684b31d-f192-4489-9a5f-491d99fac509\gallery_modal_view_1772679198717.png)
- ![Layer Stack and Advanced Parameters](C:\Users\sumos\.gemini\antigravity\brain\f684b31d-f192-4489-9a5f-491d99fac509\sacred_geometry_advanced_params_1772679214395.png)

## Who is this for?
- **Designers**: Instantly generate high-quality, resolution-independent vector assets for UI, backgrounds, or branding.
- **Developers**: A lightweight, hackable engine to embed procedural generation into your own apps.
- **AI Agents**: A fully headless API designed for LLMs to programmatically direct and composite artwork.

## Key Features
- **Generative Library**: Choose from mathematical patterns, chaotic flow fields, structural layouts, and sacred geometry.
- **Layer Composition**: Stack unlimited generators, apply standard CSS blend modes (`screen`, `multiply`, `overlay`, etc.), and reorder layers.
- **Global Variant Engine**: Jitter and mutate the entire layer stack simultaneously with a single click.
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
const newLayerId = window.SumoSvgApp.setGenerator('sacred-geometry');

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
