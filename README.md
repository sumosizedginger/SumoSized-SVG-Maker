# SumoSized SVG Maker

A professional, hardware-accelerated procedural generative art studio.

## Features

- **Browser-Native Pipeline**: Uses WebCodecs API for 50x faster video exports.
- **Hardware Acceleration**: Mediabunny engine for MP4/WebM/MOV renders.
- **Dedicated GIF Pipeline**: Link to the professional [SumoSized GIF Maker](https://sumosizedginger.github.io/sumosized-gif-maker/) for high-end animation delivery.
- **Cross-Origin Isolated**: Secure, high-performance environment.
- **100% Client-Side**: No data leaves your machine.

## Technical Architecture

Built with Svelte Kit, Svelte 5, and Mediabunny.

- **Video (1080p @ 24fps)**: ~1s per 3s of footage (Hardware accelerated).

## 📚 Documentation

- **[Full Feature Catalog](docs/features.md)**: Deep dive into all 24+ art engines and technical tools.
- **[Architecture Overview](docs/architecture.md)**: Deep dive into the DDD and Media Pipeline.
- **[Agent Protocol (AGENTS.md)](AGENTS.md)**: Headless integration brief for autonomous subagents.
- **[Export Stabilization Walkthrough (v1.1)](docs/walkthroughs/export-stabilization-v1.1.md)**: Latest mission results.
- **[Environment Stabilization (v1.0)](docs/walkthroughs/v1.0-stabilization-evidence.md)**: History of the Vite/COOP hardening.
- **[Refactoring & Standards (v0.9)](docs/walkthroughs/v0.9-refactoring-evidence.md)**: Early architecture evolution.
- **[Headless Engine Guide](docs/using-engine-headless.md)**: Guide for standalone library consumers.
- **[Security Policy](SECURITY.md)**: Cross-Origin Isolation (COI) and thread-safety details.

## Security

This application implements **COOP: same-origin** and **COEP: require-corp** to enable `SharedArrayBuffer` and hardware codecs safely.

## License

MIT / MPL-2.0
