# The Final 4%: DX & Architecture Audit (96 → 100/100)

We have a rock-solid, secure, fully-local powerhouse. The remaining 4% to achieve flawless production-grade architecture isn’t about adding features—it’s about **decoupling state from the DOM** to unlock massive testing leverage.

Right now, modules like `conversion.js` and `filters.js` import the `dom` object directly and construct FFmpeg commands based on live DOM values. This makes them untestable without a full browser environment.

Here are **3 surgical, high-leverage strikes** to tighten boundaries and establish elite test coverage, without introducing complex abstractions.

---

## 🎯 Strike 1: Pure Function Filter Graphs (The "Testable Pipeline")

**Why this matters**: `js/modules/filters.js` currently reads directly from `dom.textColor.value`, `dom.hFlip.value`, etc. If the DOM changes, the filter pipeline breaks. By refactoring `buildBaseFilters` to accept a pure `options` object, we can execute 100% coverage on our FFmpeg filter generation in Vitest within milliseconds.

**The Minimal Diff**:

```diff
--- a/js/modules/filters.js
+++ b/js/modules/filters.js
@@ -42,16 +42,9 @@
 /**
  * Builds the array of FFmpeg filter strings based on pure settings.
  */
-export async function buildBaseFilters(
-    resWidth,
-    currentFps,
-    speed,
-    duration,
-    overlayText,
-    fontStyle,
-    textSize,
-    textPos
-) {
+export async function buildBaseFilters(options) {
+    const { resWidth, currentFps, speed, overlayText, fontStyle, textSize, textPos, cropData, filterStack, domState } = options;
     const baseFilters = [];

-    if (state.cropData.active) {
+    if (cropData.active) {
         // ...
-    const rotateAngle = parseInt(dom.rotateAngle?.value) || 0;
+    const rotateAngle = parseInt(domState.rotateAngle) || 0;
```

**Trade-offs/Risks**: Requires mapping DOM values to a configuration object right before `startConversion()` is called. Minimal risk, but requires touching the start parameters across image/video modes.

---

## 🎯 Strike 2: Event-Driven Conversion UI (The "Headless Orchestrator")

**Why this matters**: `conversion.js` is 700+ lines of dense FFmpeg orchestration _interleaved_ with UI updates (`dom.progressFill.style.width`, `btn.disabled = true`). This makes it impossible to unit-test the conversion state machine.

**The Minimal Diff**:
Instead of `conversion.js` importing `dom`, it should dispatch custom events (or callbacks). `ui.js` listens and updates the view.

```diff
--- a/js/modules/conversion.js
+++ b/js/modules/conversion.js
@@ -10,3 +10,3 @@
-import { dom, showToast } from './ui.js';
+import { dispatchEvent } from './events.js';

@@ -50,3 +50,3 @@
-    dom.progressStatus.textContent = 'Initializing engine...';
-    dom.progressFill.style.width = '5%';
+    dispatchEvent('CONVERSION_PROGRESS', { status: 'Initializing engine...', percent: 5 });
```

```diff
--- a/js/modules/ui.js
+++ b/js/modules/ui.js
@@ -200,0 +200,5 @@
+window.addEventListener('CONVERSION_PROGRESS', (e) => {
+    dom.progressStatus.textContent = e.detail.status;
+    dom.progressFill.style.width = `${e.detail.percent}%`;
+});
```

**Trade-offs/Risks**: Shifts UI logic into event listeners. It slightly fragments the linear reading of "what happens during conversion," but radically enforces the Model-View separation.

---

## 🎯 Strike 3: Mocking the FFmpeg Worker Bridge

**Why this matters**: Our `ffmpeg-client.js` wraps the Web Worker beautifully. Because we own the bridge (`FFmpegWorkerClient`), we can mock it entirely in Vitest. This allows us to test the _entire orchestration loop_ of `conversion.js` in Node.js, ensuring the correct FFmpeg flags (`-f apng`, `-filter_complex`, `-plays 0`) are generated without needing the actual 20MB WebAssembly bundle in CI.

**The Minimal Diff**:
Create a Vitest mock file:

```javascript
// tests/__mocks__/ffmpeg-client.js
export const ffmpeg = {
	load: vi.fn().mockResolvedValue(),
	isLoaded: vi.fn().mockReturnValue(true),
	run: vi.fn().mockResolvedValue(),
	FS: vi.fn().mockResolvedValue(),
	setProgress: vi.fn(),
	setLogger: vi.fn(),
};
```

Then in a new `tests/conversion.test.js`:

```javascript
import { vi, test, expect } from "vitest";
import { startConversion } from "../js/modules/conversion.js";
import { ffmpeg } from "./__mocks__/ffmpeg-client.js";

test("Generates APNG successfully and clears FS", async () => {
	// Inject mock state/DOM config
	await startConversion({ format: "apng" });
	expect(ffmpeg.run).toHaveBeenCalledWith(
		"-f",
		"concat",
		"-safe",
		"0",
		"-i",
		"/concat.txt",
		/* ... expected flags ... */
		"-f",
		"apng",
		"-plays",
		"0",
		"-y",
		"/output.png",
	);
});
```

**Trade-offs/Risks**: Mock tests can drift from reality if the underlying FFmpeg WASM interface changes, but since we vendor an exact version (`v0.11.6`), our API is perfectly frozen.

---

### Execution Protocol

If you approve this tactical upgrade plan, we can execute these strikes sequentially:

1. **Refactor `filters.js`** to pure functions & write Vitest coverage for it.
2. **Decouple `conversion.js`** via Event Dispatch & write `conversion.test.js` using the FFmpeg mock.

Which vector should we hit first?
