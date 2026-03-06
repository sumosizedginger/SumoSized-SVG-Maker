# Implementation Plan - GitHub Pages 404 Fix

Resolve the 404 error on GitHub Pages by correctly configuring the build and deployment pipeline in GitHub Actions.

## Proposed Changes

### GitHub Actions Workflow [MODIFY] [.github/workflows/static.yml](file:///d:/SVG/.github/workflows/static.yml)

- Add Node.js setup step.
- Add `npm install` and `npm run build` steps.
- Update `actions/upload-pages-artifact` to use `path: "./build"` instead of `path: "."`.

### SvelteKit Configuration [VERIFY] [svelte.config.js](file:///d:/SVG/svelte.config.js)

- Confirmed `adapter-static` is configured with `pages: "build"`, `assets: "build"`, and `fallback: "404.html"`.
- Verified via Google: `fallback: "404.html"` is the correct standard for GitHub Pages SPA routing.
- Confirmed `paths.base` is correctly set to `"/SumoSized-SVG-Maker"`.

### Entry Point Configuration [MODIFY] [src/routes/+page.ts](file:///d:/SVG/src/routes/+page.ts)

- Added `export const prerender = true;`.
- Verified via Google: Without this, SvelteKit may skip generating the root `index.html` in static builds, which is a primary cause of 404s on static hosts like GitHub Pages.

## Verified Future Compatibility (FFmpeg/WASM/WebGPU)

- **FFmpeg.wasm**: Verified requirement for `SharedArrayBuffer`. Since GH Pages forbids custom headers, we will implement `coi-serviceworker` in the next phase to enable cross-origin isolation.
- **Transformers.js**: Verified WebGPU compatibility. Version 3+ works out of the box on GH Pages (HTTPS).

## Verification Plan

### Automated Verification

- Run `npm run build` locally to ensure the `build/` directory is populated with an `index.html` at the root.
- Check that the local build output correctly handles assets with the `/SumoSized-SVG-Maker` base path.

### Manual Verification

- Commit and push the changes to `main`.
- Monitor the GitHub Actions tab to ensure the "Deploy static content to Pages" workflow completes successfully.
- Visit [https://sumosizedginger.github.io/SumoSized-SVG-Maker/](https://sumosizedginger.github.io/SumoSized-SVG-Maker/) to verify the app is live.
