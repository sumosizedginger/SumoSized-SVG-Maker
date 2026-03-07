import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Resource-Policy": "cross-origin",
		},
	},
	optimizeDeps: {
		exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
	},
	test: {
		environment: "jsdom",
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html"],
			include: [
				"src/lib/engine/**",
				"src/lib/services/agentApi.ts",
				"src/lib/state/appState.svelte.ts",
			],
			exclude: ["src/lib/ui/**"],
			thresholds: {
				statements: 85,
				branches: 70,
				functions: 85,
				lines: 85,
			},
		},
	},
});
