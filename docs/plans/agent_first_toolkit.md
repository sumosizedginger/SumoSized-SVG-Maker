# Agent-First Toolkit: Technical Implementation Guide

This guide documents the verified technical requirements for installing advanced, AI-optimised tools within the SumoSized SVG Maker (GitHub Pages / Static Build).

## 1. Media Processing (FFmpeg.wasm)

**Goal**: Enable frame extraction, conversion, and GIF/WebP encoding in-browser.

### Technical Requirement: Cross-Origin Isolation

GitHub Pages does not support custom headers (`COOP`/`COEP`), which `ffmpeg.wasm` requires for `SharedArrayBuffer`.

- **Solution**: Install `coi-serviceworker`.
- **Implementation**:
    1. Place `coi-serviceworker.js` in `static/`.
    2. Add `<script src="%sveltekit.assets%/coi-serviceworker.js"></script>` to `src/app.html`.
    3. Use `@ffmpeg/ffmpeg` and `@ffmpeg/util` for processing logic.

## 2. On-Device AI (Transformers.js v3)

**Goal**: Vectorize images, remove backgrounds, and semantic analysis via WebGPU.

### Implementation Checklist

- **Device**: Set `device: 'webgpu'` in model loading.
- **Support**: Chromium-based browsers (Windows/macOS/Android) supported by default.
- **Models**: Focus on Quantized ONNX models (to minimize download size on static hosts).

## 3. Persistent Memory (PouchDB + RxDB)

**Goal**: Lossless, versioned design history without a database server.

### Implementation Checklist

- **Storage**: Use `indexeddb` adapter for the browser.
- **Sync**: Enable local-first replication patterns. Allows the user (or agent) to branch a design like a Git repository.

## 4. Headless Modularity (Zod + JSON Schema)

**Goal**: Self-documenting generators for AI Agents.

### Pattern

Every generator should include a `schema` export:

```typescript
export const matrixRainSchema = z.object({
	density: z.number().min(1).max(100),
	speed: z.number().min(0.1).max(5),
	// ...
});
```

This allows an AI agent to call `.getSchema()` on any layer to understand exactly how to manipulate it without human intervention.
