# SumoSized SVG Generator: Architecture Overview

The application follows a strict **Domain-Driven Design (DDD)** pattern, separating mathematical generative logic from Svelte reactivity and UI state.

## System Interaction Mapping

```mermaid
graph TD
    UI[Svelte UI Components] --> State[Svelte 5 appState Rune]
    State --> API[Headless Agent API]
    API --> Logic[Generative Engine /src/lib/engine]
    Logic --> Render[SVG String Output]
    Render --> UI
```

### 1. The Generative Engine (`src/lib/engine`)
The core "brain" of the project. It is 100% pure TypeScript and has zero dependencies on Svelte, the DOM, or any browser-specific APIs. It can be executed natively in Node.js or Cloudflare Workers.

### 2. appState (`src/lib/state`)
Uses Svelte 5 Runes (`$state`, `$derived`) to manage the layer stack, user presets, and active configuration. It acts as the bridge between the UI and the Engine.

### 3. Agent API (`src/lib/services/agentApi.ts`)
A headless wrapper that exposes internal state mutations to the global `window` object. This allows AI agents or external test runners to "skill up" and manipulate the canvas programmatically.

### 4. UI Components (`src/lib/ui`)
Pure presentational layers built with Svelte. They are optimized for INP (Interaction to Next Paint) by directly injecting the engine's stringified SVG output via `{@html}` blocks.

## Module Dependency

The project is structured to prevent circular dependencies. The `engine` is at the bottom of the stack—it knows nothing of the UI. The `UI` is at the top—it consumes the `engine` and `state`.
