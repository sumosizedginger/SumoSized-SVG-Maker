# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Generator Gallery with "Zero State" onboarding presets.
- Simple/Advanced parameter UI toggles for intuitive generation.
- Real-time URL Hash syncing for instant bookmarking and sharing.
- Quantum Core abstract generator.
- "Show Intersections" and "Line Weight" scaling across pattern libraries.
- Headless Agent API (`window.SumoSvgApp`) with generator listing and headless rendering functions.

### Changed
- Refactored entire global state to a stackable `Layer[]` architecture.
- `generateVariants` now mutates the full stacked visualization instead of isolated modules.
- Replaced direct PNG/SVG downloads with an un-sandboxed "Copy SVG Code" rendering workflow.
- Relocated mathematical Sacred Geometry loops into standalone module rendering.
- Renamed "New Layer" to "Open Gallery".

### Fixed
- Stabilized hydration errors during initial Vitest rendering.
- Hide `hasAdvancedParams` logic dynamically per-generator.
