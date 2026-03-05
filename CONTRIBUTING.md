# Contributing to SumoSized SVG Generator

Thanks for taking the time to contribute to this 100% in-browser SVG engine!

## Code Architecture

SumoSized SVG Generator strictly adheres to decoupling state management, UI, and procedural rendering mathematics.

1. **`src/lib/generators/`**: The pure mathematics and SVG string builders live here.
2. **`src/lib/state/appState.svelte.ts`**: The Svelte 5 runes context holds all mutable state (seed, layer stacks, blended CSS states).
3. **`src/lib/ui/`**: Specialized pure components.

## How to add a new Generator

Adding a new architectural aesthetic to the UI requires creating a new generator file and linking it.

### Step 1. Define the Math & SVG Markup

Create a new file (e.g., `src/lib/generators/my-new-aesthetic.ts`):

```typescript
import type { Generator, ParamDefinition } from "../core/types";

export const myNewGenerator: Generator = {
  id: "my-new-aesthetic",
  name: "My New Aesthetic",
  description: "A beautiful new generative landscape.",
  category: "Abstract",
  tags: ["new", "beautiful"],
  version: "1.0.0",
  defaultParams: {
    intensity: 5,
    color: "#ff0000",
  },
  params: [
    {
      name: "intensity",
      label: "Intensity",
      type: "number",
      min: 1,
      max: 10,
      step: 1,
      default: 5,
    },
    { name: "color", label: "Main Color", type: "color", default: "#ff0000" },
  ],
  render: (params, seed) => {
    // use mathematical functions seeded by 'seed'
    return `<rect width="100%" height="100%" fill="${params.color}" opacity="${params.intensity / 10}" />`;
  },
};
```

### Step 2. Register Your Generator

Open `src/lib/core/registry.ts` and import your new module, adding it to the `generators` array. It will automatically populate all search fields, filtering UI, and parameter binding panels!

### Step 3. Write Snapshot Tests

Open `src/lib/generators/generators.test.ts`. Because generation happens through deterministic math logic, verify that if you provide a hardcoded input and static seed, your exported generator outputs exactly identical SVG markup configurations so we prevent regressions across all future changes!

```typescript
it("My New Aesthetic generates deterministic SVG", () => {
  // Write a test for your generator here
});
```
