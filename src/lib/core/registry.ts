import type { SVGGenerator } from "./types";
import { quantumCoreGenerator } from "../generators/pro-complexity";
import { sacredGeometryGenerator } from "../generators/sacred-geometry";
import { simpleGradient } from "../generators/gradient";
import { dots, grid } from "../generators/patterns";
import { flowField } from "../generators/abstract";
import { poster } from "../generators/layouts";
import { techBadge } from "../generators/ui-assets";
import { orbit } from "../generators/animations";
import { symbolGrid } from "../generators/icons";
import { freeDraw } from "../generators/free-draw";
import { textEffects } from "../generators/text-effects";
import { svgImport } from "../generators/svg-import";

export const generators: SVGGenerator[] = [
  quantumCoreGenerator,
  sacredGeometryGenerator,
  simpleGradient,
  dots,
  grid,
  flowField,
  poster,
  techBadge,
  orbit,
  symbolGrid,
  freeDraw,
  textEffects,
  svgImport,
];

export function getGenerator(id: string): SVGGenerator | undefined {
  return generators.find((g) => g.id === id);
}

export function registerGenerator(generator: SVGGenerator) {
  if (generators.find((g) => g.id === generator.id)) {
    console.warn(`Generator with id ${generator.id} already registered.`);
    return;
  }
  generators.push(generator);
}
