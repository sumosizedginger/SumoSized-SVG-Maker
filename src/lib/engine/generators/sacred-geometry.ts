import { z } from "zod";
import type { SVGGenerator } from "../core/types";
import { getPalette } from "../core/palettes";

const seededRandom = (seed: number) => {
	let x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
};

export const sacredGeometryGenerator: SVGGenerator = {
	id: "sacred-geometry",
	name: "Sacred Geometry",
	description:
		"Standalone sacred geometric matrices (Metatron Cube, Seed of Life) optimized for stacking and overlaying.",
	category: "Pro",
	tags: ["math", "glow", "neon", "sacred", "geometry", "metatron", "overlay"],
	version: "1.0.0",
	params: [
		{
			name: "sacredMode",
			label: "Base Matrix",
			type: "select",
			options: [
				{ value: "Cosmic Grid", label: "Cosmic Grid" },
				{ value: "Seed of Life", label: "Seed of Life" },
				{ value: "Metatron Cube", label: "Metatron Cube" },
				{ value: "Hyper-Toroid", label: "Hyper-Toroid" },
			],
			default: "Metatron Cube",
			group: "Geometry",
		},
		{
			name: "lineWidth",
			label: "Line Thickness",
			type: "number",
			min: 0.05,
			max: 2,
			step: 0.05,
			default: 0.4,
			group: "Geometry",
		},
		{
			name: "scale",
			label: "Scale",
			type: "number",
			min: 0.5,
			max: 3,
			step: 0.1,
			default: 1,
			group: "Geometry",
		},
		{
			name: "glowIntensity",
			label: "Neon Glow",
			type: "number",
			min: 0,
			max: 20,
			step: 0.5,
			default: 8,
			group: "Effects",
			advanced: true,
		},
		{
			name: "paletteId",
			label: "Colors",
			type: "palette",
			default: "neon-vibe",
			group: "Colors",
			advanced: true,
		},
		{
			name: "overrideColor",
			label: "Single Color",
			type: "color",
			default: "#00f5d4",
			group: "Colors",
		},
		{
			name: "usePalette",
			label: "Use Palette",
			type: "boolean",
			default: true,
			group: "Colors",
			advanced: true,
		},
		{
			name: "transparent",
			label: "Transparent Background",
			type: "boolean",
			default: true,
			group: "Background",
			advanced: true,
		},
	],
	defaultParams: {
		sacredMode: "Metatron Cube",
		lineWidth: 0.4,
		scale: 1,
		glowIntensity: 8,
		paletteId: "neon-vibe",
		overrideColor: "#00f5d4",
		usePalette: true,
		transparent: true,
	},
	schema: z.object({
		sacredMode: z.enum([
			"Cosmic Grid",
			"Seed of Life",
			"Metatron Cube",
			"Hyper-Toroid",
		]),
		lineWidth: z.number().min(0.05).max(2),
		scale: z.number().min(0.5).max(3),
		glowIntensity: z.number().min(0).max(20),
		paletteId: z.string(),
		overrideColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		usePalette: z.boolean(),
		transparent: z.boolean(),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		let currentSeed = seed;
		const random = () => seededRandom(currentSeed++);

		const {
			sacredMode,
			lineWidth,
			scale,
			glowIntensity,
			paletteId,
			overrideColor,
			usePalette,
			transparent,
		} = params;

		let colors = [overrideColor];
		if (usePalette) {
			const pal = getPalette(paletteId);
			if (pal) colors = pal.colors;
		}

		const bgColors = ["#05050a", "#020205", "#080510", "#0a0005"];
		const bgColor = bgColors[Math.floor(random() * bgColors.length)];

		let svgMarkup = `<svg viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${transparent ? "transparent" : bgColor};">\n`;
		svgMarkup += `<title>${sacredMode}</title>\n`;
		svgMarkup += `<desc>Sacred geometric matrix: ${sacredMode} rendered with ${glowIntensity} glow intensity.</desc>\n`;

		// Intense Glow Filter Definition
		if (glowIntensity > 0) {
			svgMarkup += `
                <defs>
                    <filter id="sacred-glow-${seed}" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity * 0.15}" result="core_blur" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity * 0.5}" result="mid_blur" />
                        <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity}" result="outer_blur" />
                        
                        <feColorMatrix type="matrix" in="core_blur" result="boosted_core"
                            values="1.5 0 0 0 0  
                                    0 1.5 0 0 0  
                                    0 0 1.5 0 0  
                                    0 0 0 2 0" />

                        <feMerge>
                            <feMergeNode in="outer_blur" />
                            <feMergeNode in="mid_blur" />
                            <feMergeNode in="boosted_core" />
                            <feMergeNode in="SourceGraphic" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            `;
		}

		const sacredColor = colors[Math.floor(random() * colors.length)];
		const filterAttr =
			glowIntensity > 0 ? `filter="url(#sacred-glow-${seed})"` : "";

		// Transform group to apply scale from the center
		svgMarkup += `<g transform="translate(50 50) scale(${scale}) translate(-50 -50)">\n`;
		svgMarkup += `<g stroke="${sacredColor}" stroke-opacity="0.85" stroke-width="${lineWidth}" fill="none" ${filterAttr}>\n`;

		if (sacredMode === "Cosmic Grid") {
			for (let r = 5; r <= 60; r += 5) {
				svgMarkup += `<circle cx="50" cy="50" r="${r}" stroke-dasharray="1 3" />\n`;
			}
			const spokes = 24;
			for (let i = 0; i < spokes; i++) {
				const angle = (i * Math.PI * 2) / spokes;
				const x2 = 50 + Math.cos(angle) * 60;
				const y2 = 50 + Math.sin(angle) * 60;
				svgMarkup += `<line x1="50" y1="50" x2="${x2}" y2="${y2}" />\n`;
			}
		} else if (sacredMode === "Seed of Life") {
			const R = 15;
			svgMarkup += `<circle cx="50" cy="50" r="${R}" />\n`;
			for (let i = 0; i < 6; i++) {
				const angle = (i * Math.PI * 2) / 6;
				const cx = 50 + Math.cos(angle) * R;
				const cy = 50 + Math.sin(angle) * R;
				svgMarkup += `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${R}" />\n`;
			}
			svgMarkup += `<circle cx="50" cy="50" r="${R * 2}" stroke-opacity="0.3" />\n`;
			svgMarkup += `<circle cx="50" cy="50" r="${R * 2 + 2}" stroke-opacity="0.3" />\n`;
		} else if (sacredMode === "Metatron Cube") {
			const R = 10;
			const centers = [{ x: 50, y: 50 }];
			for (let i = 0; i < 6; i++) {
				const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
				centers.push({
					x: 50 + Math.cos(angle) * (R * 2),
					y: 50 + Math.sin(angle) * (R * 2),
				});
			}
			for (let i = 0; i < 6; i++) {
				const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
				centers.push({
					x: 50 + Math.cos(angle) * (R * 4),
					y: 50 + Math.sin(angle) * (R * 4),
				});
			}

			centers.forEach((c) => {
				svgMarkup += `<circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${R}" />\n`;
			});

			svgMarkup += `<g stroke-opacity="0.4" stroke-width="${lineWidth * 0.7}">\n`;
			for (let i = 0; i < centers.length; i++) {
				for (let j = i + 1; j < centers.length; j++) {
					svgMarkup += `<line x1="${centers[i].x.toFixed(2)}" y1="${centers[i].y.toFixed(2)}" x2="${centers[j].x.toFixed(2)}" y2="${centers[j].y.toFixed(2)}" />\n`;
				}
			}
			svgMarkup += `</g>\n`;
		} else {
			// Hyper-Toroid fallback path (covers the 4th option exhaustively)
			const count = 72;
			const ringRadius = 18;
			const circleRadius = 25;
			for (let i = 0; i < count; i++) {
				const angle = (i * Math.PI * 2) / count;
				const cx = 50 + Math.cos(angle) * ringRadius;
				const cy = 50 + Math.sin(angle) * ringRadius;
				svgMarkup += `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${circleRadius}" stroke-width="${lineWidth * 0.6}" stroke-opacity="0.3" />\n`;
			}
		}

		svgMarkup += `</g>\n</g>\n`;
		svgMarkup += `</svg>`;
		return svgMarkup;
	},
};
