# SumoSized SVG Maker: Media Pipeline Architecture

The media pipeline has been refactored for professional performance, reliability, and SvelteKit 5 compliance. This document explains the architecture and the strategic shift toward hardware-accelerated video.

## 🏗️ Architecture Breakdown

Wait... I'm looking at the previous version. I'll make sure to update the descriptions.

### 1. `exportService.ts` (The Orchestrator)

- **Role**: High-level API for all exports (Static & Video).
- **Function**: Handles frame capture timing, progress reporting, and selects the best encoder backend.
- **Location**: [exportService.ts](file:///d:/SVG/src/lib/services/exportService.ts)

### 2. `media/encoder.ts` (The Abstraction)

- **Role**: Common interface for all encoding backends.
- **Function**: Feature-detects capabilities (WebCodecs vs FFmpeg) and exports the correct backend instance.
- **Location**: [encoder.ts](file:///d:/SVG/src/lib/media/encoder.ts)

### 3. `media/webcodecsEncoder.ts` (Hardware Express)

- **Role**: Hardware-accelerated MP4/WebM/MOV encoding.
- **Function**: Uses the browser's native `VideoEncoder` API. Primary pathway for all video renders.
- **Location**: [webcodecsEncoder.ts](file:///d:/SVG/src/lib/media/webcodecsEncoder.ts)

### 4. `media/ffmpegEncoder.ts` (The Legacy Fallback)

- **Role**: Software fallback for video encoding.
- **Function**: Wraps `FFmpeg.wasm` into the standard encoder interface for environments without `VideoEncoder`.
- **Location**: [ffmpegEncoder.ts](file:///d:/SVG/src/lib/media/ffmpegEncoder.ts)

### 5. `services/mediaService.ts` (The Provider)

- **Role**: FFmpeg instance management.
- **Function**: Handles the logic for loading FFmpeg-core assets from local same-origin paths (`/ffmpeg`).
- **Location**: [mediaService.ts](file:///d:/SVG/src/lib/services/mediaService.ts)

## 🚀 Key Improvements

| Feature             | Old System          | New System           |
| ------------------- | ------------------- | -------------------- |
| **MP4 Performance** | Software (Slow)     | Hardware (Instant)   |
| **GIF Support**     | Native (Unstable)   | External (Hardened)  |
| **CORS/COI**        | `coi-serviceworker` | Native Headers       |
| **Asset Loading**   | Remote CDN          | Local (Same-Origin)  |
| **Router Sync**     | Native History      | SvelteKit Navigation |

## 🧪 Verification Logs

- [x] **Video Export (MP4/MOV)**: Verified hardware muxing and file save.
- [x] **Static Export**: Verified Base64 rasterization.
- [x] **GIF Transition**: Native logic removed; replaced with external link.

---

_Architecture validated and secured. GIF engine decommissioned._
