# SumoSized SVG Generator: Performance Benchmarks & INP (2026)

The generative mathematics behind SumoSized are tuned for instantaneous execution, built specifically to dominate Google Core Web Vitals, primarily **Interaction to Next Paint (INP)**.

## Core Metrics (v1.0.0 Architecture)

Tests were run across the 12 standalone Math Engines under `vitest` load against a standard Node 20 environment.

| Component / Action        | Measurement (P95) | Target Budget    | Conclusion |
| ------------------------- | ----------------- | ---------------- | ---------- |
| **Native Render Cycle**   | `< 2.5ms`         | `< 16ms (60fps)` | PASS 🟢    |
| **Complete Layer Switch** | `~ 4ms`           | `< 50ms`         | PASS 🟢    |
| **LZ-String Compression** | `< 1.2ms`         | `< 10ms`         | PASS 🟢    |
| **History Undo/Redo**     | `< 0.8ms`         | `< 10ms`         | PASS 🟢    |
| **Browser DOM Injection** | `< 8ms`           | `< 25ms`         | PASS 🟢    |

## 📹 Video Export Benchmarks (v1.1.0)

With the introduction of the Mediabunny hardware-accelerated pipeline, video export performance has been revolutionized.

| Format / Method         | Resolution | Duration | Export Time | Gear             |
| ----------------------- | ---------- | -------- | ----------- | ---------------- |
| **MP4 (Hardware)**      | 1080p      | 3.0s     | `~ 0.9s`    | RTX 30-series    |
| **WebM (Hardware)**     | 1080p      | 3.0s     | `~ 1.1s`    | Apple Silicon M2 |
| **MOV (WASM Fallback)** | 480p       | 3.0s     | `~ 12.5s`   | CPU (Software)   |

> [!IMPORTANT]
> **GIF Deprecation**: Native GIF encoding has been offloaded to the external [SumoSized GIF Maker](https://sumosizedginger.github.io/sumosized-gif-maker/) to prevent WASM thread-locking and memory exhaustion on high-resolution compositions.

### Svelte 5 Integration (Reactivity)

By utilizing Svelte 5's Runes architecture (`$state`, `$derived`), reactivity propagation is decoupled from the Virtual DOM.

When a generator parameter slider moves (e.g., altering `Wave Amp`), the value is passed directly into the decoupled engine parameters. The SVG string outputs within `2ms` and is injected natively via `{@html}`. This avoids thousands of React-style VDOM diff loops for 5,000+ vector paths.

### Headless Web3 Execution

Because the generation code relies purely on matrix math and floating-point invariants, it executes significantly faster than canvas-based generators while resulting in scalable byte-strings that cost practically nothing to store or transmit on-chain.
