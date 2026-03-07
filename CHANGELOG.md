# Changelog

## [2.0.0] - 2026-03-06

### Added

- **Hardware Accelerated Media Engine**: Integrated `mediabunny` and `WebCodecs API` for up to 50x faster video renders.
- **Strategic Pipeline Refactor**: Extracted `ExportService` and `FrameCapturer` for professional media handling.
- **SvelteKit 2.4+ Sync**: Properly implemented `pushState` and `replaceState` for router synchronization.
- **Enhanced Security Headers**: Hardened COOP/COEP implementation via `hooks.server.ts`.

### Fixed

- **PNG/JPEG Export Hangs**: Switched from Blob URLs to Base64 to resolve cross-origin isolation race conditions.
- **FFmpeg WASM Timeout**: Migrated to CDN-loaded v0.12.10 core and improved load lifecycle.
- **Navigation Warnings**: Eliminated "Avoid using history" console warnings.

### Removed

- Removed 31MB of vendored WASM binaries (now loaded via CDN).
- Removed `coi-serviceworker.js` hack.
