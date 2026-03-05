import type { SVGGenerator } from "../core/types";
import { getPalette, getPaletteRole } from "../core/palettes";

export const orbit: SVGGenerator = {
	id: "anim-orbit",
	name: "Orbital Loop",
	description:
		"A looping orbital animation with controllable speed and paths",
	category: "Animations",
	tags: ["animation", "loop", "circular"],
	version: "1.1.0",
	params: [
		{
			name: "orbits",
			label: "Orbit Count",
			type: "integer",
			min: 1,
			max: 5,
			step: 1,
			default: 3,
			group: "Geometry",
		},
		{
			name: "duration",
			label: "Speed (sec)",
			type: "number",
			min: 0.5,
			max: 10,
			step: 0.1,
			default: 3,
			group: "Animation",
		},
		{
			name: "paletteId",
			label: "Palette",
			type: "palette",
			default: "neon-vibe",
			group: "Colors",
		},
		{
			name: "color",
			label: "Override Color",
			type: "color",
			default: "#9b5de5",
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
			name: "thickness",
			label: "Thickness",
			type: "number",
			min: 0.1,
			max: 5,
			step: 0.1,
			default: 1,
			group: "Geometry",
		},
	],
	defaultParams: {
		orbits: 3,
		duration: 3,
		paletteId: "neon-vibe",
		color: "#9b5de5",
		usePalette: true,
		thickness: 1,
	},
	render: (params, seed) => {
		const { orbits, duration, paletteId, color, usePalette, thickness } =
			params;

		let finalColor = color;
		if (usePalette) {
			const pal = getPalette(paletteId);
			if (pal) {
				finalColor = getPaletteRole(pal, "accent");
			}
		}

		const elements: string[] = [];

		for (let i = 1; i <= orbits; i++) {
			const r = i * (44 / orbits);
			const d = (duration * (0.5 + (i - 1) * 0.4)).toFixed(2);
			const orbitOpacity = (1 - ((i - 1) / orbits) * 0.6).toFixed(2);

			// Dashed orbit ring
			elements.push(
				`<circle cx="50" cy="50" r="${r}" fill="none" stroke="${finalColor}" stroke-width="${(thickness * 0.5).toFixed(2)}" stroke-dasharray="2 4" opacity="${orbitOpacity}" />`,
			);

			// Rotating group: the dot sits at (50, 50-r) and the group rotates around center
			elements.push(`<g>
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="${d}s" repeatCount="indefinite" />
          <circle cx="50" cy="${(50 - r).toFixed(2)}" r="${(thickness * 2).toFixed(2)}" fill="${finalColor}" />
        </g>`);
		}

		return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <title>Orbital Loop</title>
        <desc>An animation showing ${orbits} celestial orbits over a ${duration}s duration.</desc>
        <defs>
          <clipPath id="orbitClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        <g clip-path="url(#orbitClip-${seed})">
          ${elements.join("\n        ")}
        </g>
      </svg>
    `.trim();
	},
};

export const matrixRain: SVGGenerator = {
	id: "anim-matrix-rain",
	name: "Matrix Rain",
	description: "Cascading digital rain with controllable density and speed.",
	category: "Animations",
	tags: ["animation", "matrix", "digital", "retro"],
	version: "1.0.0",
	params: [
		{
			name: "density",
			label: "Density",
			type: "number",
			min: 5,
			max: 100,
			step: 1,
			default: 20,
			group: "Geometry",
		},
		{
			name: "speed",
			label: "Speed",
			type: "number",
			min: 0.5,
			max: 5,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "fontSize",
			label: "Font Size",
			type: "number",
			min: 2,
			max: 10,
			step: 0.1,
			default: 4,
			group: "Geometry",
		},
		{
			name: "color",
			label: "Rain Color",
			type: "color",
			default: "#00FF41",
			group: "Colors",
		},
		{
			name: "trailLength",
			label: "Trail Length",
			type: "number",
			min: 10,
			max: 100,
			step: 5,
			default: 60,
			group: "Aesthetics",
		},
	],
	defaultParams: {
		density: 20,
		speed: 2,
		fontSize: 4,
		color: "#00FF41",
		trailLength: 60,
	},
	render: (params, seed) => {
		const density = Math.floor(Number(params.density || 20));
		const speed = Number(params.speed || 2);
		const fontSize = Number(params.fontSize || 4);
		const color = String(params.color || "#00FF41");
		const trail = Number(params.trailLength || 60);

		// Deterministic random generator
		const pseudoRandom = (id: number) => {
			const x = Math.sin(seed + id) * 10000;
			return x - Math.floor(x);
		};

		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~".split("");
		const getChar = (id: number) => chars[Math.floor(pseudoRandom(id) * chars.length)];

		const drops: string[] = [];
		const columnWidth = 100 / density;

		for (let i = 0; i < density; i++) {
			const x = i * columnWidth + columnWidth / 2;
			const dur = (speed * (0.8 + pseudoRandom(i) * 0.4)).toFixed(2);
			const delay = (pseudoRandom(i + 100) * -speed).toFixed(2);
			const length = Math.floor(5 + pseudoRandom(i + 200) * 15);

			let columnText = "";
			for (let j = 0; j < length; j++) {
				const char = getChar(i * 10 + j);
				columnText += `<tspan x="0" dy="${fontSize}">${char}</tspan>`;
			}

			drops.push(`
				<g>
					<animateTransform 
						attributeName="transform" 
						type="translate" 
						from="${x} -100" 
						to="${x} 120" 
						dur="${dur}s" 
						begin="${delay}s" 
						repeatCount="indefinite" 
					/>
					<text 
						font-family="monospace" 
						font-size="${fontSize}" 
						fill="url(#matrixGradient-${seed})" 
						text-anchor="middle"
					>
						${columnText}
					</text>
				</g>
			`);
		}

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Matrix Rain</title>
				<defs>
					<linearGradient id="matrixGradient-${seed}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="${color}" stop-opacity="0" />
						<stop offset="${100 - trail}%" stop-color="${color}" stop-opacity="0.1" />
						<stop offset="100%" stop-color="${color}" stop-opacity="1" />
					</linearGradient>
				</defs>
				<rect width="100%" height="100%" fill="black" />
				${drops.join("")}
			</svg>
		`.trim();
	},
};
