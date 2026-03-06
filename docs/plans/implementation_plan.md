# Implementation Plan - Professional Text Fitting

Refine the `text-effects` generator to ensure text fits professionally within the 100x100 SVG canvas.

## Proposed Changes

### [Component Name] Engine - Generators

- Refactor all effects for perfect 100x100 centering:
    - **Arch**: Quadratic bezier between (10, 70) and (90, 70) with height driven by `r`.
    - **Circle**: Centered at (50, 50) using dual arcs for maximum compatibility.
    - **Wave**: Centered so that the 50% offset point is exactly at X=50. Reduced cycles to 5 for better predictability.
    - **Spiral**: Adjusted growth rate to ensure it caps at radius 50.
- Ensure `text-anchor="middle"` is used correctly with `startOffset="50%"` for all except Spiral.

## Verification Plan

### Manual Verification
- Open the SVG Maker in the browser.
- Select the **Advanced Text** generator.
- Toggle the **Spiral** effect.
- Verify that the default text "We're just two lost souls living in a fish bowl" fits within the canvas at default settings.
- Test with longer text (e.g., the user's "What in the fuck is going on here?") and verify it doesn't bleed out excessively or looks professional.
- Check **Arch**, **Circle**, and **Wave** effects to ensure no regressions.
