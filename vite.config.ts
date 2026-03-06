import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
	preview: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/lib/engine/**", "src/lib/services/agentApi.ts"],
			exclude: ["src/lib/ui/**", "src/lib/state/**"],
			thresholds: {
				statements: 85,
				branches: 70,
				functions: 85,
				lines: 85,
			},
		},
	},
});
