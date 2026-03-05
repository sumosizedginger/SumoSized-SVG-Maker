import type { SVGGenerator } from "../core/types";

export const symbolGrid: SVGGenerator = {
  id: "icon-symbol-grid",
  name: "Symbol Grid",
  description: "A grid of geometric symbols with randomization",
  category: "Icons",
  tags: ["grid", "symbols", "geometry", "icons"],
  version: "1.0.0",
  params: [
    {
      name: "cells",
      label: "Cells",
      type: "integer",
      min: 2,
      max: 20,
      step: 1,
      default: 8,
      group: "Layout",
    },
    {
      name: "padding",
      label: "Cell Padding",
      type: "number",
      min: 0,
      max: 0.4,
      step: 0.05,
      default: 0.2,
      group: "Layout",
    },
    {
      name: "thickness",
      label: "Stroke Weight",
      type: "number",
      min: 0.5,
      max: 5,
      step: 0.1,
      default: 1.5,
      group: "Style",
    },
    {
      name: "bgColor",
      label: "Background",
      type: "color",
      default: "#ffffff",
      group: "Colors",
    },
    {
      name: "color",
      label: "Symbol Color",
      type: "color",
      default: "#333333",
      group: "Colors",
    },
    {
      name: "variety",
      label: "Variety",
      type: "number",
      min: 0,
      max: 1,
      step: 0.1,
      default: 0.5,
      group: "Style",
    },
    {
      name: "transparent",
      label: "Transparent Background",
      type: "boolean",
      default: false,
      group: "Background",
    },
  ],
  defaultParams: {
    cells: 8,
    padding: 0.2,
    thickness: 1.5,
    bgColor: "#ffffff",
    color: "#333333",
    variety: 0.5,
    transparent: false,
  },
  render: (params, seed) => {
    const { cells, padding, thickness, bgColor, color, variety, transparent } =
      params;
    const step = 100 / cells;
    const symbols: string[] = [];

    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const drawSymbol = (x: number, y: number, size: number, type: number) => {
      const half = size / 2;
      const cx = x + half;
      const cy = y + half;
      const s = size * (1 - padding * 2);

      switch (type % 4) {
        case 0: // X
          return `<line x1="${cx - s / 2}" y1="${cy - s / 2}" x2="${cx + s / 2}" y2="${cy + s / 2}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" />
                            <line x1="${cx + s / 2}" y1="${cy - s / 2}" x2="${cx - s / 2}" y2="${cy + s / 2}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round" />`;
        case 1: // Circle
          return `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="none" stroke="${color}" stroke-width="${thickness}" />`;
        case 2: // Triangle
          return `<path d="M ${cx} ${cy - s / 2} L ${cx - s / 2} ${cy + s / 2} L ${cx + s / 2} ${cy + s / 2} Z" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linejoin="round" />`;
        case 3: // Square
          return `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-linejoin="round" />`;
        default:
          return "";
      }
    };

    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        if (rand() > variety * 0.2) {
          const type = Math.floor(rand() * 4);
          symbols.push(drawSymbol(i * step, j * step, step, type));
        }
      }
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <title>Symbol Grid</title>
        <desc>A randomized grid of ${cells}x${cells} geometric icons.</desc>
        <defs>
          <clipPath id="symbolClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        ${transparent ? "" : `<rect width="100" height="100" fill="${bgColor}" />`}
        <g clip-path="url(#symbolClip-${seed})">
          ${symbols.join("\n")}
        </g>
      </svg>
    `.trim();
  },
};
