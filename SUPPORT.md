# Support & FAQ

## How to Get Support

The SumoSized SVG Generator is a community-driven project. Please use the following channels for assistance:

1. **GitHub Issues**: For bug reports and technical issues. Please include the `params` hash or a JSON export of your preset.
2. **GitHub Discussions**: For feature proposals, "Show and Tell," and general questions about generative mathematics.

## Frequently Asked Questions

### Is this an AI generator?

No, but it can be with the headless API. Every pixel in this app is perfectly deterministic, pure-math procedural code. No LLMs are running in the browser during the render loop.

### Can I use the SVGs in my business?

Yes. The app creates standard SVG code that you can copy/paste into Figma, Illustrator, or your own website code. See the [LICENSE](LICENSE) for MIT terms.

### How do I add a new effect?

Read the [CONTRIBUTING.md](CONTRIBUTING.md) guide. You simply need to add a new TypeScript file to `src/lib/engine/generators/` and register it in the core registry.

### Why does my text look different on different computers?

The browser uses local system fonts as fallbacks (`Montserrat`, `Inter`, `sans-serif`). If you have the specific font installed locally, it will match. Otherwise, it will safely fall back to your system's default sans-serif font.
