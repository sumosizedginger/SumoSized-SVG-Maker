# Using the Engine as a Library (Headless SVG Generation)

SumoSized SVG Generator is built on a strict **Domain-Driven Design (DDD)** architecture. This means the SvelteKit frontend is merely a *viewer* for a completely decoupled, pure TypeScript mathematical generation matrix.

You can import these logic engines directly into Node.js, React, Vue, Python wrappers, or Cloudflare Workers.

## Import Surface

When you install the package, the `exports` map routes directly to the engine entry point. 
The package size is minimal because it treeshakes Svelte completely.

```javascript
import { 
  generators,   // The complete registry manifest
  getGenerator, // Lookup helper by ID
  palettes,     // Pre-computed HSL harmony variables
  types         // Full TS schemas for generation payloads
} from "sumosized-svg-maker";
```

## Basic Instantiation (Zero UI)

```javascript
const engine = getGenerator('quantum-core');

// Grab default invariants to ensure math boundaries don't NaN out
const payload = { 
    ...engine.defaultParams,
    complexity: 10,
    depthWeaving: true
};

// The second argument is your 'Seed'.
// 100/100 Production Grade means providing the exact same seed and payload ALWAYS
// yields the mathematically identical visual SVG DOM matrix.
const rawSvgString = engine.render(payload, 9999);

// Write to filesystem, return in HTTP Response, or pipe to an optimization routine!
```

## Determinism Contract
As part of the v1.0.0 2026 Standard upgrade:
1. **Never** use `Math.random()` natively if maintaining SVG path collision safety.
2. If expanding the engine, use the PRNG fed from the `seed` argument.
3. DOM internal references (like clip paths or filter URLs) use `seed` + string hashing to guarantee they can be safely composited together inside CSS without bleeding state.

For fully fleshed execution examples, please check the `/examples/node-batch` path inside the monorepo.
