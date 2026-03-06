/**
 * SumoSized SVG Generator - Pure Functional Engine
 *
 * This module exports the decoupled, 100% deterministic, zero-DOM SVG generative
 * logic for use in pure Node.js environments, headless agents, and external apps.
 */

// Core Definitions
export * from "./core/types";
export * from "./core/registry";
export * from "./core/palettes";
export * from "./core/starters";

// Generator Modules
export { flowField } from "./generators/abstract";
export { orbit } from "./generators/animations";
export { freeDraw } from "./generators/free-draw";
export { simpleGradient } from "./generators/gradient";
export { symbolGrid } from "./generators/icons";
export { poster } from "./generators/layouts";
export { dots, grid } from "./generators/patterns";
export { quantumCoreGenerator } from "./generators/pro-complexity";
export { sacredGeometryGenerator } from "./generators/sacred-geometry";
export { svgImport } from "./generators/svg-import";
export { textEffects } from "./generators/text-effects";
export { techBadge } from "./generators/ui-assets";
