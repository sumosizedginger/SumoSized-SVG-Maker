# SumoSized SVG Generator: Headless Node Engine

This example demonstrates how to import the pure-TypeScript generative engine directly into a standard Node.js environment, entirely bypassing SvelteKit, the DOM, and Reactivity dependencies.

By isolating the mathematical geometry routines into `src/lib/engine/`, you can automate SVG generation on CI/CD pipelines, backend microservices, or headless Cron jobs.

## Running the Example
If you are developing inside this monorepo, you can run the batch generator using `tsx` to compile the TypeScript on the fly:

```bash
npx tsx examples/node-batch/generate.js
```

If you installed the generator via NPM into a separate project:
```javascript
// Change your import path to:
import { generators, getGenerator } from "sumosized-svg-maker";
```

## Real World Usecases
- Mass-generating placeholder Avatars on user signup.
- Providing dynamically seeded geometric background images for programmatic PDF generation.
- Running a 2026-grade Web3 minting factory directly entirely client-side without costly server render cycles.
