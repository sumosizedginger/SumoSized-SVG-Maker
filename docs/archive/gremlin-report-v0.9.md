# 🐛 Code Gremlin Report — 3/2/2026

> **Internet Search Date**: March 2, 2026
> **Scope**: Full codebase sweep + 4 live Google searches
> **Search Topics**: ffmpeg.wasm v0.11.6 bugs, COI-serviceworker issues, concat demuxer gotchas, palettegen/paletteuse/overlay pitfalls

---

## 🔴 CRITICAL

### 1. Slideshow Image Overlay Not Wired

**File**: `conversion.js:442-497` (slideshow path)
**Issue**: The slideshow GIF/WebP paths use plain `-vf` with `baseFilterStr` and do **NOT** include the overlay buffer. The overlay support I added earlier only covers the **Standard Video** path and the **Manual Frames** path. If a user uploads a slideshow + overlay, the overlay is silently ignored.
**Fix**: Mirror the overlay logic from the video path into the slideshow GIF/WebP branches.

### 2. Slideshow Missing APNG Path

**File**: `conversion.js:474-498`
**Issue**: The slideshow mode only handles `gif` and `webp`. There is **no APNG branch** for slideshows. If a user selects APNG output format in slideshow mode, nothing happens — no output, no error, silent failure.
**Fix**: Add an `else if (outputFormat === 'apng')` branch to the slideshow section.

---

## 🟠 HIGH

### 3. Memory Leak: Blob URLs Never Revoked in Frame Extraction

**File**: `frames.js:59`
**Issue**: `URL.createObjectURL(blob)` is called for every extracted frame (up to 300), but the URLs are never revoked. Each blob URL holds a reference to the underlying ArrayBuffer in memory. Over multiple extract-edit cycles, this can cause the browser tab to consume **hundreds of MB** and eventually crash.
**Fix**: Track blob URLs in `state.frameData` and call `URL.revokeObjectURL()` when frames are cleared or re-extracted.

### 4. Memory Leak: Timeline Thumbnail URLs Never Revoked

**File**: `timeline.js:58`
**Issue**: Same pattern — 10 blob URLs created per timeline generation, never revoked. Less severe than frames (only 10 per cycle), but still accumulates.
**Fix**: Store thumbnail URLs and revoke them before regenerating.

### 5. `fetchFile` Can Be `undefined` on Load Race

**File**: `ffmpeg-client.js:114`
**Issue**: `export const { fetchFile } = window.FFmpeg || {};` — If the ESM module is evaluated **before** the FFmpeg library script sets `window.FFmpeg`, `fetchFile` will be `undefined` permanently. This is a race condition that depends on script load order and can silently break all conversions.
**Fix**: Lazy-load `fetchFile` via a getter function: `export const fetchFile = (...args) => window.FFmpeg.fetchFile(...args);`

---

## 🟡 MEDIUM

### 6. Sticker Overlay Bypasses Telemetry on Non-GIF Formats

**File**: `conversion.js:549-551`
**Issue**: `finalizeOutput()` only applies sticker overlays for `image/gif` (uses `GifReader`). For WebP/APNG, it calls `outputResult()` directly — but `outputResult()` never sends telemetry. Successful WebP/APNG conversions are **never reported** to the telemetry endpoint.
**Fix**: Add `sendTelemetry()` call in `outputResult()` or in the non-sticker branch of `finalizeOutput()`.

### 7. Timeline `thumbFps` Can Be `Infinity` or `NaN`

**File**: `timeline.js:42`
**Issue**: `const thumbFps = 10 / state.videoDuration;` — If `videoDuration` is `0` (e.g., metadata not loaded yet), this becomes `Infinity`, which FFmpeg rejects. If `videoDuration` is `NaN`, it becomes `NaN`, which also crashes.
**Fix**: Guard with `Math.max(state.videoDuration, 0.1)` or skip thumbnail generation if duration is falsy.

### 8. COI Service Worker: Infinite Retry Loop

**File**: `coi-serviceworker.js:28` (my recent fix)
**Issue**: My fix changed `.catch()` to return `fetch(event.request)` — but if the fetch itself is what caused the error (e.g., offline), this creates a **second fetch that also fails**, which returns a rejected promise to `respondWith()`, triggering the same error. It's not an infinite loop, but it still logs errors.
**Fix**: Return `new Response('Service Unavailable', { status: 503 })` as the ultimate fallback in the catch instead of re-fetching.

---

## 🟢 LOW / INFORMATIONAL

### 9. `safeUnlinkAll` Cleanup Is Noisy (Not a Bug)

**File**: `conversion.js:511-522`
**Issue**: The cleanup always tries to unlink ALL possible output files (`input.mp4`, `palette.png`, `output.gif`, `output.webp`, `output.png`, `overlay.png`, etc.) regardless of which conversion path was taken. `safeUnlinkAll` swallows the errors, but each failed unlink still triggers `ffmpeg-worker.js` error logs visible in the console. **Functionally harmless** but **visually alarming** to users.
**Fix**: Build the cleanup list dynamically based on which files were actually written. Or just accept the noise since `safeUnlinkAll` handles it gracefully.

### 10. `GifReader` and `GIF` Are Assumed Global

**File**: `conversion.js:555, 566`
**Issue**: `new GifReader(...)` and `new GIF(...)` are used without imports — they're assumed to be loaded via `<script>` tags. If the vendor scripts fail to load (CDN/network issue), the sticker overlay path will throw a `ReferenceError` with no user-friendly message.
**Fix**: Guard with `typeof GifReader !== 'undefined'` checks before attempting sticker overlay.

---

## 📡 Internet Search Highlights (3/2/2026)

| Topic                    | Key Finding                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ffmpeg.wasm v0.11.6**  | Outdated; v0.12.15 available. Known issues with `import.meta.url` bundler compat and memory management. Best practice: call `ffmpeg.exit()` after processing, but our version doesn't support it.                        |
| **COI-serviceworker**    | Known issue: code runs twice on first page load (reload loop). Chrome 124+ deprecation trials ended. `SharedWorker` context doesn't inherit `crossOriginIsolated` — not a concern for us since we use `DedicatedWorker`. |
| **Concat demuxer**       | ✅ **Confirmed**: Last file must be listed twice. Our bug was textbook.                                                                                                                                                  |
| **palettegen + overlay** | Must generate palette **after** applying overlay, not before. Our video path does this correctly. Slideshow path does **not** (see Critical #1).                                                                         |
