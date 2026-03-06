# Implementation Plan - Matrix Rain Animation

Implement a new animated generator, `anim-matrix-rain`, that simulates the iconic cascading digital rain effect using high-performance SVG animation tags.

## Proposed Changes

### Animation Engine (`src/lib/engine/generators/animations.ts`)

- Implement `matrixRain` generator:
    - **Parameters**: `density` (columns), `speed` (base duration), `fontSize`, `color`, `trailLength`, `characters`.
    - **Logic**:
        - Generate randomized vertical "drops" based on a seed.
        - Each drop is a `<g>` containing vertical `<text>` characters.
        - Apply a `<linearGradient>` to each drop to create the "fading trail" effect.
        - Use `<animateTransform>` to move each drop vertically from `-100` to `100`.
        - Stagger animations using `begin` times derived from the seed.
        - Optimise by reusing a single `<defs>` for gradients where possible.

### Core Registry (`src/lib/engine/core/registry.ts`)

- Import and export `matrixRain` alongside `orbit`.
- Add `matrixRain` to the `generators` array.

## Verification Plan

### Automated Tests
- Add a new test case in `generators.test.ts` to verify the `matrixRain` output is deterministic and valid SVG.

### Manual Verification
- Open the SVG Maker in the browser.
- Select **Matrix Rain** from the **Animations** category.
- Verify that sliders for `Density` and `Speed` work as expected.
- Ensure the animation is smooth and doesn't cause browser lag (P95 < 16ms target).
- verify it works well as a background for the **Crying Skull**.
