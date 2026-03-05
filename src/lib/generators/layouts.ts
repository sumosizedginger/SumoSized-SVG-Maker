import type { SVGGenerator } from "../core/types";
import { getPalette, getPaletteRole } from "../core/palettes";

export const poster: SVGGenerator = {
  id: "layout-poster",
  name: "Swiss Poster",
  description:
    "A minimalist Swiss-style layout with geometric blocks and text placeholders",
  category: "Layouts",
  tags: ["layout", "swiss", "minimal", "poster"],
  version: "1.1.0",
  params: [
    {
      name: "blockCount",
      label: "Blocks",
      type: "integer",
      min: 2,
      max: 10,
      step: 1,
      default: 4,
      group: "Composition",
    },
    {
      name: "padding",
      label: "Padding",
      type: "number",
      min: 0,
      max: 20,
      step: 1,
      default: 5,
      group: "Composition",
    },
    {
      name: "paletteId",
      label: "Palette",
      type: "palette",
      default: "nordic",
      group: "Colors",
    },
    {
      name: "bgColor",
      label: "Background Override",
      type: "color",
      default: "#f0f0f0",
      group: "Colors",
    },
    {
      name: "accentColor",
      label: "Accent Override",
      type: "color",
      default: "#ff3e00",
      group: "Colors",
    },
    {
      name: "secondaryColor",
      label: "Secondary Override",
      type: "color",
      default: "#333333",
      group: "Colors",
    },
    {
      name: "usePalette",
      label: "Use Palette",
      type: "boolean",
      default: true,
      group: "Colors",
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
    blockCount: 4,
    padding: 5,
    paletteId: "nordic",
    bgColor: "#f0f0f0",
    accentColor: "#ff3e00",
    secondaryColor: "#333333",
    usePalette: true,
    transparent: false,
  },
  render: (params, seed) => {
    const {
      blockCount,
      padding,
      paletteId,
      bgColor,
      accentColor,
      secondaryColor,
      usePalette,
      transparent,
    } = params;

    let finalBg = bgColor;
    let finalAccent = accentColor;
    let finalSecondary = secondaryColor;

    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalBg = getPaletteRole(pal, "bg");
        finalAccent = getPaletteRole(pal, "accent");
        finalSecondary = getPaletteRole(pal, "secondary");
      }
    }

    const blocks: string[] = [];

    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const area = 100 - padding * 2;
    for (let i = 0; i < blockCount; i++) {
      const w = rand() * (area * 0.6) + area * 0.2;
      const h = rand() * (area * 0.4) + area * 0.1;
      const x = padding + rand() * (area - w);
      const y = padding + rand() * (area - h);
      const color = rand() > 0.6 ? finalAccent : finalSecondary;

      blocks.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" opacity="0.8" />`,
      );
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <title>Swiss Poster</title>
        <desc>Minimalist layout with ${blockCount} geometric blocks and ${padding}% padding.</desc>
        <defs>
          <clipPath id="posterClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        ${transparent ? "" : `<rect width="100" height="100" fill="${finalBg}" />`}
        <g clip-path="url(#posterClip-${seed})">
          ${blocks.join("\n")}
        </g>
      </svg>
    `.trim();
  },
};
