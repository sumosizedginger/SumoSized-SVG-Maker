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
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
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

		const pad = padding;
		for (let i = 0; i < blockCount; i++) {
			const w = rand() * (viewBox.w * 0.6) + viewBox.w * 0.2;
			const h = rand() * (viewBox.h * 0.4) + viewBox.h * 0.1;
			const x = viewBox.x + pad + rand() * (viewBox.w - w - pad * 2);
			const y = viewBox.y + pad + rand() * (viewBox.h - h - pad * 2);
			const color = rand() > 0.6 ? finalAccent : finalSecondary;

			blocks.push(
				`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${color}" opacity="0.8" />`,
			);
		}

		return `
      <svg width="100%" height="100%" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" xmlns="http://www.w3.org/2000/svg">
        <title>Swiss Poster</title>
        <desc>Minimalist layout with ${blockCount} geometric blocks and ${padding} padding. Adaptive Cinematic Viewport: ${viewBox.w}:${viewBox.h}</desc>
        <defs>
          <clipPath id="posterClip-${seed}"><rect x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.w}" height="${viewBox.h}" /></clipPath>
        </defs>
        ${transparent ? "" : `<rect x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.w}" height="${viewBox.h}" fill="${finalBg}" />`}
        <g clip-path="url(#posterClip-${seed})">
          ${blocks.join("\n")}
        </g>
      </svg>
    `.trim();
	},
};
