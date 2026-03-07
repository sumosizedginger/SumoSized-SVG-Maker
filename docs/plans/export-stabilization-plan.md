# SumoSized SVG Maker: Global Export Stabilization Plan (Phase 4)

This phase focuses on the strategic removal of the native `FFmpeg.wasm` GIF export (which is prone to WASM OOM hangs) and its replacement with a dedicated external service.

## User Review Required

> [!IMPORTANT]
> **GIF Export Removal**: Animated GIF export is being removed from the native FFmpeg.wasm pipeline. It will be replaced by a link to the dedicated [SumoSized GIF Maker](https://sumosizedginger.github.io/sumosized-gif-maker/).

## Proposed Changes

---

### [Component] State Management & Logic

Refining the core state to remove GIF dependencies and cleanup unused code.

#### [MODIFY] [appState.svelte.ts](file:///d:/SVG/src/lib/state/appState.svelte.ts)

- Remove `"gif"` from the `renderComposition` format type.
- Remove GIF-specific logic or guards.

---

### [Component] UI / Export Panel

Updating the export interface to align with the new supported formats.

#### [MODIFY] [ExportPanel.svelte](file:///d:/SVG/src/lib/ui/ExportPanel.svelte)

- Remove "Animated GIF" from the Output Format dropdown.
- Add a promotional/utility link to the external GIF Maker.
- Refine conditional rendering for video controls.

#### [MODIFY] [unified-import.ts](file:///d:/SVG/src/lib/engine/generators/unified-import.ts)

- Remove GIF from the supported import/search types and tags.

---

### [Component] FFmpeg Pipeline

Hardening the video pipeline and removing software-only GIF logic.

#### [MODIFY] [ffmpegEncoder.ts](file:///d:/SVG/src/lib/media/ffmpegEncoder.ts)

- Strip the `palettegen` and `paletteuse` logic.
- Remove the pre-scaling logic (formerly for GIF memory optimization).
- Update `supports` to exclude `"gif"`.

---

### [Component] Documentation

Keeping project docs in sync with reality.

#### [MODIFY] [Download types.md](file:///d:/SVG/Download%20types.md)

- Remove GIF from the implementation status table.

#### [DELETE] [FFmpeg_GIF_Escalation.md](file:///d:/SVG/FFmpeg_GIF_Escalation.md)

- Removing research artifact as it is now irrelevant.

## Verification Plan

### Manual Verification

- Verify that **Static Image (PNG/JPEG/WebP)** still exports correctly via the Canvas bridge.
- Verify that **Professional Video (MOV/MP4/WebM)** still renders correctly via Mediabunny (Hardware) or FFmpeg (Software).
- Confirm the new GIF Maker link opens in a new tab.
- Ensure no "gif" related errors appear in the console during app usage.
