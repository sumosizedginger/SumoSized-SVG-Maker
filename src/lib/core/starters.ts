import type { Layer } from "./types";

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  layers: Partial<Layer>[];
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "golden-core",
    name: "Golden Core",
    description: "Mathematical harmonics meets sacred geometry.",
    layers: [
      {
        generatorId: "simple-gradient",
        name: "Cosmic Background",
        params: { style: "radial", color1: "#0f172a", color2: "#1e1b4b" },
      },
      {
        generatorId: "pattern-dots",
        name: "Particle Field",
        params: { spacing: 4, dotSize: 0.3 },
        opacity: 0.2,
        blendMode: "screen",
      },
      {
        generatorId: "sacred-geometry",
        name: "Metatron Nexus",
        params: {
          sacredMode: "Metatron Cube",
          glowIntensity: 12,
          lineWidth: 0.2,
        },
        blendMode: "screen",
      },
    ],
  },
  {
    id: "neon-mesh",
    name: "Neon Mesh",
    description: "Vibrant grid patterns with organic flow interlacing.",
    layers: [
      {
        generatorId: "simple-gradient",
        name: "Deep Space",
        params: { style: "linear", color1: "#000000", color2: "#020617" },
      },
      {
        generatorId: "pattern-grid",
        name: "Matrix Grid",
        params: { cells: 15, thickness: 0.2 },
      },
      {
        generatorId: "abstract-flow",
        name: "Energy Flow",
        params: {
          count: 180,
          steps: 40,
          complexity: 0.08,
          lineColor: "#f43f5e",
        },
        opacity: 0.8,
        blendMode: "screen",
      },
    ],
  },
  {
    id: "abstract-pulsar",
    name: "Abstract Pulsar",
    description: "A rhythmic, circular meditation on light.",
    layers: [
      {
        generatorId: "simple-gradient",
        name: "Void",
        params: { style: "radial", color1: "#020617", color2: "#000000" },
      },
      {
        generatorId: "anim-orbit",
        name: "Orbital Path",
        params: { orbits: 5, duration: 4, color: "#22d3ee" },
        blendMode: "screen",
      },
      {
        generatorId: "sacred-geometry",
        name: "Symmetry Lock",
        params: { sacredMode: "Seed of Life", glowIntensity: 5, scale: 0.8 },
        blendMode: "screen",
      },
    ],
  },
  {
    id: "ui-prototype",
    name: "UI Badge Prototype",
    description: "Sleek, sci-fi HUD element architecture.",
    layers: [
      {
        generatorId: "pattern-grid",
        name: "UI Alignment",
        params: { cells: 25, thickness: 0.1 },
      },
      {
        generatorId: "ui-badge",
        name: "Primary HUD",
        params: { width: 60, height: 25, color: "#10b981" },
      },
      {
        generatorId: "pattern-dots",
        name: "UI Texture",
        params: { spacing: 10, dotSize: 1 },
        opacity: 0.1,
      },
    ],
  },
  {
    id: "quantum-void",
    name: "Quantum Void",
    description: "High-complexity mathematical distortion.",
    layers: [
      {
        generatorId: "simple-gradient",
        name: "Vortex",
        params: { style: "radial", color1: "#4c1d95", color2: "#000000" },
      },
      {
        generatorId: "quantum-core",
        name: "Core Resonance",
        params: {
          complexity: 40,
          symmetry: 8,
          glowIntensity: 15,
          frequencyRatio: 1.33,
        },
      },
    ],
  },
];
