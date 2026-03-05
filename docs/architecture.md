# Architecture Overview

This document provides a high-level view of the SumoSized SVG Maker architecture, designed for extreme performance, procedural generation, and AI-agent compatibility.

## Core Concepts

The application is built on three main pillars:

1. **The Core Engine (`src/lib/core`)**: Handles math, palettes, generation registry, and the global rendering pipeline.
2. **The Generators (`src/lib/generators`)**: Pure mathematical functions that take parameters and a seed, returning an SVG string.
3. **The Shell/UI (`src/lib/ui` & `src/routes`)**: The Svelte 5 frontend that wraps the engine, providing reactivity, state management, and user interaction.

---

## 1. The Engine & Layer Stack

The heart of the application is a layered composition system. Instead of generating a single flat SVG, the user (or AI) stacks multiple `Generator` instances together.

- **`types.ts`**: Defines the contract for all `SVGGenerator` objects. Every generator must provide a `render(params, seed)` function that outputs deterministic SVG strings.
- **`engine.ts`**: Responsible for taking an array of `Layer` objects (which bind a specific Generator to a specific set of parameters) and compiling them down into a final, unified `<svg>` wrapper.
- **`appState.svelte.ts`**: A global Svelte 5 rune state that manages the currently active layers, handles serialization/deserialization for URL sharing, and orchestrates updates to the UI.

## 2. Generators as Pure Functions

We treat each visual effect (e.g., Quantum Core, Flow Fields, Simple Gradients) as a pure function.

### Why Pure Functions?

- **Determinism**: Given the same input `params` and the same `seed`, the generator **must** produce the exact same text output. This is why we never use `Math.random()` to generate DOM IDs inside the render loop; we use the injected `seed`.
- **Testability**: We can run snapshot tests against the generators in milliseconds using Vitest without needing a virtual DOM or browser environment.
- **Performance**: We bypass heavy DOM manipulation frameworks. The generator spits out a raw string, and the Svelte frontend uses `{@html markup}` to render it at 60fps.

## 3. The Agent API (`window.SumoSvgApp`)

Because this tool is designed to be fully controllable by LLM Agents, we expose a secure, headless bridge via the `window` object.

The `AgentBridge.svelte` component mounts invisibly and attaches methods to `window.SumoSvgApp`. This allows external scripts to:

- Read the current schema (`getGenerators()`)
- Clear the canvas (`clearLayers()`)
- Construct complex visual stacks sequentially (`addLayer(id, params)`)
- Request a final download (`downloadSvg()`)

This design physically separates the user's manual UI interactions from programmatic script commands while operating on the exact same underlying `appState`.

---

## Data Flow Summary

1. User moves a slider OR Agent fires `addLayer()`.
2. `appState.svelte.ts` reacts to the change.
3. The `<Preview>` component detects the state change and calls `engine.ts`.
4. The Engine loops through all layers, passing their params to their respective `render()` function.
5. The raw SVG strings are concatenated and injected into the DOM via `{@html}`.
