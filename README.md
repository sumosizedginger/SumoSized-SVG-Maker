# SumoSized SVG Generator

A production-grade, 100% in-browser SVG generative web application.

## Overview
SumoSized SVG Generator is a static web application built with SvelteKit that generates mathematically complex, infinite-resolution vector art directly in the browser. It features a complete layer composition system, advanced procedural features like Quantum Glitching and Depth Interlacing, and a headless agent API.

## Key Features
- **Generative Library**: Choose from mathematical patterns, chaotic flow fields, structural layouts, and sacred geometry.
- **Layer Composition**: Stack unlimited generators, apply standard CSS blend modes (`screen`, `multiply`, `overlay`, etc.), and reorder layers to create infinitely complex masterpieces.
- **Global Variant Engine**: Jitter and mutate the entire layer stack simultaneously with a single click to explore variations of your composition.
- **Copy SVG Code**: Instant optimization and one-click copy to clipboard for native vector art portability.
- **Headless API**: Exposes `window.SumoSvgApp` to allow external tools and AI agents to manipulate the canvas remotely.

## Development

### Setup
```bash
npm install
npm run dev
```

### Building for Production (GitHub Pages)
The application uses `@sveltejs/adapter-static` and builds to a fully static bundle containing no backend requirements.
```bash
npm run build
```

### Testing
We use Vitest to ensure the mathematical accuracy of our core generators is never compromised through Snapshot logic.
```bash
npx vitest run
```

## Agent Skilling API (`window.SumoSvgApp`)
For external agents (like Comet or other headless browser controllers), the application exposes a global API for manipulation:

- `listGenerators()`: Returns all available templates.
- `getGeneratorSchema(id)`: Returns the detailed parameter schema for a specific ID.
- `getCurrentState()`: Returns the global `appState` layers, active sizes, etc.
- `renderNow()`: Returns the live SVG markup of the current visual state.
- `savePreset(name)`: Snapshots the entire composition to LocalStorage.
