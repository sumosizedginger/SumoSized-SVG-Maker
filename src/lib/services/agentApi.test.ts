import { describe, it, expect, beforeEach, vi } from "vitest";
import { appState } from "../state/appState.svelte";
import { agentApi } from "./agentApi";

describe("Agent API (window.SumoSvgApp)", () => {
	beforeEach(() => {
		// Clear layers
		appState.layers = [];
		appState.userPresets = [];
		appState.activeLayerId = null;

		// Mock the window and localStorage objects since this runs in Node via Vitest
		(globalThis as any).window = {
			history: { replaceState: vi.fn() },
			location: { hash: "" },
		};
		(globalThis as any).localStorage = {
			getItem: vi.fn(() => "[]"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		};

		// Initialize the bridge
		(globalThis as any).window.SumoSvgApp = agentApi;
	});

	it("should expose the SumoSvgApp namespace on window", () => {
		expect((globalThis as any).window.SumoSvgApp).toBeDefined();
	});

	it("listGenerators returns properly formed manifest", () => {
		const schema = agentApi.listGenerators();
		expect(Array.isArray(schema)).toBe(true);
		expect(schema.length).toBeGreaterThan(0);
		expect(schema[0]).toHaveProperty("category");
	});

	it("getGeneratorSchema returns valid parameters for a known generator", () => {
		const schema = agentApi.getGeneratorSchema("quantum-core");
		expect(schema).not.toBeNull();
		expect(schema!.id).toBe("quantum-core");
		expect(schema!.params.length).toBeGreaterThan(0);
	});

	it("getGeneratorSchema returns null for invalid generator", () => {
		const schema = agentApi.getGeneratorSchema("not-real");
		expect(schema).toBeNull();
	});

	it("getCurrentState returns safe defaults when no layer is active", () => {
		const state = agentApi.getCurrentState();
		expect(state).not.toBeNull();
		expect(state!.generatorId).toBe("composition");
	});

	it("setGenerator successfully changes active layer's generator", () => {
		agentApi.addLayer("simple-gradient");
		expect(appState.activeLayer?.generatorId).toBe("simple-gradient");
		const success = agentApi.setGenerator("quantum-core");
		expect(success).toBe(true);
		expect(appState.activeLayer?.generatorId).toBe("quantum-core");
	});

	it("setParams successfully updates layer parameters", () => {
		agentApi.addLayer("simple-gradient", { color1: "#000000" });
		expect(appState.activeLayer?.params.color1).toBe("#000000");

		const success = agentApi.setParams({ color1: "#ffffff", invalidParam: true });
		expect(success).toBe(true);
		expect(appState.activeLayer?.params.color1).toBe("#ffffff");
		expect(appState.activeLayer?.params.invalidParam).toBe(true);
	});

	it("setSeed successfully updates deterministic entropy", () => {
		agentApi.addLayer("quantum-core");
		const success = agentApi.setSeed(999);
		expect(success).toBe(true);
		expect(appState.activeLayer?.seed).toBe(999);
	});

	it("renderNow returns a valid SVG string", () => {
		agentApi.addLayer("quantum-core");
		const svg = agentApi.renderNow();
		expect(typeof svg).toBe("string");
		expect(svg).toContain("<svg");
	});

	it("getPreviewDataURL resolves to a base64 Data URI", async () => {
		agentApi.addLayer("quantum-core");
		const url = await agentApi.getPreviewDataURL();
		expect(typeof url).toBe("string");
		expect(url).toContain("data:image/svg+xml;base64,");
	});

	it("savePreset and listPresets properly write and read to local storage emulation", () => {
		appState.layers = [];
		agentApi.addLayer("quantum-core");

		const success = agentApi.savePreset("Test Preset");
		expect(success).toBe(true);
		expect((globalThis as any).localStorage.setItem).toHaveBeenCalled();

		// Note appState.savePreset populates userPresets directly
		const presets = agentApi.listPresets("quantum-core");
		expect(Array.isArray(presets)).toBe(true);
	});

	it("clearLayers successfully zeroes out the composition", () => {
		agentApi.addLayer("quantum-core");
		expect(appState.layers.length).toBe(1);
		agentApi.clearLayers();
		expect(appState.layers.length).toBe(0);
	});

	it("setGenerator falls back to fuzzy name matching if exact ID fails", () => {
		const success = agentApi.setGenerator("quantum");
		expect(success).toBe(true);
		expect(appState.activeLayer?.generatorId).toBe("quantum-core");
	});

	it("setSeed rejects invalid types silently", () => {
		const success = agentApi.setSeed("not-a-number" as any);
		expect(success).toBe(false);
	});

	it("gracefully catches internal exceptions across all endpoints", async () => {
		// Suppress console.error noise during intentional failure test
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

		// Force appState getter to throw a catastrophic error
		const spy = vi.spyOn(appState, 'activeGenerator', 'get').mockImplementation(() => {
			throw new Error("Simulated catastrophic state failure");
		});

		expect(agentApi.getCurrentState()).toBeNull();
		expect(agentApi.setParams({})).toBe(false);

		spy.mockRestore();

		// Force getter failures for render output and user data
		const spySvg = vi.spyOn(appState, 'renderedSvg', 'get').mockImplementation(() => {
			throw new Error("Simulated catastrophic state failure");
		});
		expect(agentApi.renderNow()).toBe("");
		expect(await agentApi.getPreviewDataURL()).toBe("");
		spySvg.mockRestore();

		const spyUser = vi.spyOn(appState, 'userPresets', 'get').mockImplementation(() => {
			throw new Error("Simulated catastrophic state failure");
		});
		expect(agentApi.listPresets()).toEqual([]);
		spyUser.mockRestore();

		// Force another failure point for mutation routes
		const spy2 = vi.spyOn(appState, 'layers', 'set').mockImplementation(() => {
			throw new Error("Simulated catastrophic state failure");
		});

		expect(agentApi.clearLayers()).toBe(false);
		expect(agentApi.addLayer("quantum-core")).toBe(false);

		spy2.mockRestore();
		consoleSpy.mockRestore();
	});

	describe("Zod Validation Enforcement", () => {
		it("addLayer rejects invalid parameters for anim-matrix-rain", () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
			const success = agentApi.addLayer("anim-matrix-rain", {
				density: 500, // Max is 100
			});
			expect(success).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("AgentAPI Validation Error"),
				expect.anything(),
			);
			consoleSpy.mockRestore();
		});

		it("setParams rejects out-of-range values", () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
			agentApi.setGenerator("anim-matrix-rain");
			const success = agentApi.setParams({ density: 1 }); // Min is 5
			expect(success).toBe(false);
			consoleSpy.mockRestore();
		});

		it("setParams rejects incorrect types", () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
			agentApi.setGenerator("anim-matrix-rain");
			const success = agentApi.setParams({ density: "lots" as any });
			expect(success).toBe(false);
			consoleSpy.mockRestore();
		});

		it("setParams accepts valid parameters for orbit", () => {
			agentApi.setGenerator("anim-orbit");
			const success = agentApi.setParams({ orbits: 5, duration: 8 });
			expect(success).toBe(true);
			expect(appState.activeLayer?.params.orbits).toBe(5);
		});
	});
});
