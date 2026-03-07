# Security Policy

## Supported Versions

The SumoSized SVG Generator ecosystem currently formally supports the latest release branch to preserve mathematically deterministic rendering safety.

| < 1.0.0 | :x: |

## Cross-Origin Isolation (COI)

This application mandates a strictly isolated execution environment to enable high-performance multi-threaded WASM (FFmpeg.wasm) and hardware-accelerated WebCodecs.

- **COOP (Cross-Origin-Opener-Policy)**: Set to `same-origin`.
- **COEP (Cross-Origin-Embedder-Policy)**: Set to `require-corp`.

This configuration prevents side-channel attacks (like Spectre) while allowing the use of `SharedArrayBuffer`, which is critical for the zero-latency frame buffer used in video exports.

## Reporting a Vulnerability

Because the engine evaluates mathematical matrices entirely on the client without database synchronization or server endpoints, traditional RCE and DB vulnerabilities are fundamentally non-existent by architecture.

However, if you uncover any memory-leak vectors, SSR hydration attacks natively rooted in the standalone NPM Engine package, or SvelteKit route misconfigurations, please DO NOT report them directly via public GitHub issues.

Please email the core maintainer team securely at **security@sumosized.com** with standard reproduction steps. Include the `.json` preset tree or exact `params` dictionary string used to trigger the vector collision. We aim to triage reports within 48 hours for CVSS tracking.
