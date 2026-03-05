import { describe, it, expect, beforeEach, vi } from "vitest";
import { appState } from "./state/appState.svelte";
import { agentApi } from "./services/agentApi";

describe("Agent API (window.SumoSvgApp)", () => {
  beforeEach(() => {
    // Clear layers
    appState.layers = [];

    // Mock the window and localStorage objects since this runs in Node via Vitest
    (globalThis as any).window = {
      history: {
        replaceState: vi.fn(),
      },
      location: {
        hash: "",
      },
    };
    (globalThis as any).localStorage = {
      getItem: vi.fn(),
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

  it("should list all registered generators and their schemas", () => {
    const api = (globalThis as any).window.SumoSvgApp;
    const schema = api.listGenerators();

    expect(Array.isArray(schema)).toBe(true);
    expect(schema.length).toBeGreaterThan(0);

    // Verify the structure of the returned schema
    const firstGen = schema[0];
    expect(firstGen).toHaveProperty("id");
    expect(firstGen).toHaveProperty("name");
    expect(firstGen).toHaveProperty("category");
    expect(firstGen).toHaveProperty("tags");
  });

  it("should clear all layers when clearLayers is called", () => {
    const api = (globalThis as any).window.SumoSvgApp;

    // Manually add dummy layers
    appState.layers = [
      {
        id: "1",
        generatorId: "simple-gradient",
        name: "Grad",
        params: {},
        seed: 1,
        visible: true,
        blendMode: "normal",
        opacity: 1,
        transforms: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      },
      {
        id: "2",
        generatorId: "fractal-noise",
        name: "Noise",
        params: {},
        seed: 2,
        visible: true,
        blendMode: "normal",
        opacity: 1,
        transforms: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      },
    ];

    expect(appState.layers.length).toBe(2);

    // Call API
    api.clearLayers();

    expect(appState.layers.length).toBe(0);
  });

  it("should successfully add a new layer via the API", () => {
    const api = (globalThis as any).window.SumoSvgApp;

    expect(appState.layers.length).toBe(0);

    const success = api.addLayer("simple-gradient", {
      color1: "#ff0000",
      color2: "#0000ff",
    });

    expect(success).toBe(true);
    expect(appState.layers.length).toBe(1);
    expect(appState.layers[0].generatorId).toBe("simple-gradient");
    expect(appState.layers[0].params.color1).toBe("#ff0000");
  });

  it("should reject invalid generic layer additions", () => {
    const api = (globalThis as any).window.SumoSvgApp;

    // Mock console.error to avoid noise in test output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const success = api.addLayer("non-existent-generator", {});

    expect(success).toBe(false);
    expect(appState.layers.length).toBe(0);

    spy.mockRestore();
  });
});
