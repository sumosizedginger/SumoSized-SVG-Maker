import { z } from "zod";
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
	schema: z.object({
		orbits: z.number().int().min(1).max(5),
		duration: z.number().min(0.5).max(10),
		paletteId: z.string(),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		usePalette: z.boolean(),
		thickness: z.number().min(0.1).max(5),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
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
	schema: z.object({
		density: z.number().min(5).max(100),
		speed: z.number().min(0.5).max(5),
		fontSize: z.number().min(2).max(10),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
		trailLength: z.number().min(10).max(100),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
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

		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~".split(
				"",
			);
		const getChar = (id: number) =>
			chars[Math.floor(pseudoRandom(id) * chars.length)];

		const drops: string[] = [];
		const columnWidth = viewBox.w / density;

		for (let i = 0; i < density; i++) {
			const x = viewBox.x + i * columnWidth + columnWidth / 2;
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
						from="${x} ${viewBox.y - 100}" 
						to="${x} ${viewBox.y + viewBox.h + 20}" 
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
			<svg width="100%" height="100%" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" xmlns="http://www.w3.org/2000/svg">
				<title>Matrix Rain</title>
				<defs>
					<linearGradient id="matrixGradient-${seed}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="${color}" stop-opacity="0" />
						<stop offset="${100 - trail}%" stop-color="${color}" stop-opacity="0.1" />
						<stop offset="100%" stop-color="${color}" stop-opacity="1" />
					</linearGradient>
				</defs>
				<rect x="${viewBox.x}" y="${viewBox.y}" width="${viewBox.w}" height="${viewBox.h}" fill="black" />
				${drops.join("")}
			</svg>
		`.trim();
	},
};

export const quantumPulse: SVGGenerator = {
	id: "anim-quantum-pulse",
	name: "Quantum Pulse",
	description: "A rhythmic, global scaling and opacity oscillation.",
	category: "Animations",
	tags: ["animation", "pulse", "breathing", "quantum"],
	version: "1.0.0",
	params: [
		{
			name: "frequency",
			label: "Breathing Rate",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "intensity",
			label: "Intensity",
			type: "number",
			min: 0,
			max: 1,
			step: 0.05,
			default: 0.2,
			group: "Aesthetics",
		},
		{
			name: "color",
			label: "Core Color",
			type: "color",
			default: "#9b5de5",
			group: "Colors",
		},
	],
	defaultParams: {
		frequency: 2,
		intensity: 0.2,
		color: "#9b5de5",
	},
	schema: z.object({
		frequency: z.number().min(0.1).max(10),
		intensity: z.number().min(0).max(1),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const frequency = Number(params.frequency || 2);
		const intensity = Number(params.intensity || 0.2);
		const color = String(params.color || "#9b5de5");

		const minScale = 1 - intensity;
		const maxScale = 1 + intensity;
		const minOpacity = 0.5 - intensity / 2;
		const maxOpacity = 1;

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Quantum Pulse</title>
				<defs>
					<radialGradient id="pulseGradient-${seed}" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stop-color="${color}" stop-opacity="1" />
						<stop offset="100%" stop-color="${color}" stop-opacity="0" />
					</radialGradient>
				</defs>
				<g transform-origin="50 50">
					<animateTransform 
						attributeName="transform" 
						type="scale" 
						values="${minScale}; ${maxScale}; ${minScale}" 
						dur="${(1 / frequency).toFixed(2)}s" 
						repeatCount="indefinite" 
					/>
					<animate 
						attributeName="opacity" 
						values="${minOpacity}; ${maxOpacity}; ${minOpacity}" 
						dur="${(1 / frequency).toFixed(2)}s" 
						repeatCount="indefinite" 
					/>
					<circle cx="50" cy="50" r="40" fill="url(#pulseGradient-${seed})" />
				</g>
			</svg>
		`.trim();
	},
};

export const kineticFlow: SVGGenerator = {
	id: "anim-kinetic-flow",
	name: "Kinetic Flow",
	description: "Liquid-like movement along a procedural noise field.",
	category: "Animations",
	tags: ["animation", "flow", "liquid", "noise"],
	version: "1.0.0",
	params: [
		{
			name: "count",
			label: "Density",
			type: "integer",
			min: 10,
			max: 150,
			step: 1,
			default: 40,
			group: "Geometry",
		},
		{
			name: "speed",
			label: "Flow Speed",
			type: "number",
			min: 0.1,
			max: 5,
			step: 0.1,
			default: 1.5,
			group: "Animation",
		},
		{
			name: "complexity",
			label: "Turbulence",
			type: "number",
			min: 0.01,
			max: 0.3,
			step: 0.01,
			default: 0.08,
			group: "Geometry",
		},
		{
			name: "color",
			label: "Flow Color",
			type: "color",
			default: "#00f5f4",
			group: "Colors",
		},
	],
	defaultParams: {
		count: 40,
		speed: 1.5,
		complexity: 0.08,
		color: "#00f5f4",
	},
	schema: z.object({
		count: z.number().int().min(10).max(150),
		speed: z.number().min(0.1).max(5),
		complexity: z.number().min(0.01).max(0.3),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const count = Number(params.count || 40);
		const speed = Number(params.speed || 1.5);
		const complexity = Number(params.complexity || 0.08);
		const color = String(params.color || "#00f5f4");

		let s = seed;
		const rand = () => {
			s = (s * 16807) % 2147483647;
			return (s - 1) / 2147483646;
		};

		const getAngle = (x: number, y: number) => {
			return (
				(Math.sin(x * complexity + seed) +
					Math.cos(y * complexity + seed)) *
				Math.PI *
				2
			);
		};

		const paths: string[] = [];
		for (let i = 0; i < count; i++) {
			let x = rand() * 100;
			let y = rand() * 100;
			let d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
			let length = 0;

			for (let j = 0; j < 30; j++) {
				const angle = getAngle(x, y);
				const dx = Math.cos(angle) * 3;
				const dy = Math.sin(angle) * 3;
				x += dx;
				y += dy;
				d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
				length += Math.sqrt(dx * dx + dy * dy);
				if (x < -10 || x > 110 || y < -10 || y > 110) break;
			}

			const dur = (5 / speed).toFixed(2);
			paths.push(`
				<path 
					d="${d}" 
					fill="none" 
					stroke="${color}" 
					stroke-width="0.6" 
					stroke-opacity="0.8" 
					stroke-dasharray="10 ${length}"
				>
					<animate 
						attributeName="stroke-dashoffset" 
						from="${length + 10}" 
						to="0" 
						dur="${dur}s" 
						repeatCount="indefinite" 
					/>
				</path>
			`);
		}

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: black;">
				<title>Kinetic Flow</title>
				<rect width="100" height="100" fill="black" />
				<g style="mix-blend-mode: screen;">
					${paths.join("")}
				</g>
			</svg>
		`.trim();
	},
};

export const glitchInterference: SVGGenerator = {
	id: "anim-glitch",
	name: "Glitch Interference",
	description: "Stochastic jitter and simulated RGB splitting.",
	category: "Animations",
	tags: ["animation", "glitch", "cyberpunk", "noise"],
	version: "1.0.0",
	params: [
		{
			name: "intensity",
			label: "Jitter Amount",
			type: "number",
			min: 1,
			max: 20,
			step: 1,
			default: 5,
			group: "Animation",
		},
		{
			name: "frequency",
			label: "Corruption Rate",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "split",
			label: "RGB Split",
			type: "number",
			min: 0,
			max: 5,
			step: 0.5,
			default: 1.5,
			group: "Aesthetics",
		},
		{
			name: "color",
			label: "Base Color",
			type: "color",
			default: "#ffffff",
			group: "Colors",
		},
	],
	defaultParams: {
		intensity: 5,
		frequency: 2,
		split: 1.5,
		color: "#ffffff",
	},
	schema: z.object({
		intensity: z.number().min(1).max(20),
		frequency: z.number().min(0.1).max(10),
		split: z.number().min(0).max(5),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const intensity = Number(params.intensity || 5);
		const frequency = Number(params.frequency || 2);
		const split = Number(params.split || 1.5);
		const color = String(params.color || "#ffffff");

		const dur = (1 / frequency).toFixed(2);

		// Deterministic random generator
		const pseudoRandom = (offset: number) => {
			const x = Math.sin(seed + offset) * 10000;
			return x - Math.floor(x);
		};

		// Create randomized keyframes for jitter
		const generateKeyframes = (range: number, offset: number) => {
			const steps = 6;
			let values = [];
			for (let i = 0; i < steps; i++) {
				const val = ((pseudoRandom(offset + i) - 0.5) * range).toFixed(
					2,
				);
				values.push(val);
			}
			values.push(values[0]); // Loop back
			return values.join("; ");
		};

		const jitterX = generateKeyframes(intensity, 1000);
		const jitterY = generateKeyframes(intensity, 2000);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: black;">
				<title>Glitch Interference</title>
				<defs>
					<filter id="glitchFilter-${seed}">
						<feOffset in="SourceGraphic" dx="${split}" dy="0" result="red" />
						<feOffset in="SourceGraphic" dx="-${split}" dy="0" result="cyan" />
						<feColorMatrix in="red" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red_only" />
						<feColorMatrix in="cyan" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="cyan_only" />
						<feBlend in="red_only" in2="cyan_only" mode="screen" result="split" />
						<feBlend in="split" in2="SourceGraphic" mode="screen" />
					</filter>
				</defs>
				
				<rect width="100" height="100" fill="black" />
				
				<g filter="url(#glitchFilter-${seed})">
					<g transform-origin="50 50">
						<animateTransform 
							attributeName="transform" 
							type="translate" 
							values="${jitterX}" 
							dur="${dur}s" 
							repeatCount="indefinite" 
							calcMode="discrete"
						/>
						
						<!-- Glitch Bars -->
						<rect x="10" y="20" width="80" height="2" fill="${color}" opacity="0.8">
							<animate attributeName="y" values="20; 80; 10; 50; 20" dur="${(Number(dur) * 1.5).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" />
							<animate attributeName="width" values="80; 20; 90; 40; 80" dur="${(Number(dur) * 0.7).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" />
						</rect>
						
						<rect x="10" y="70" width="80" height="1" fill="${color}" opacity="0.5">
							<animate attributeName="y" values="70; 10; 40; 90; 70" dur="${(Number(dur) * 2).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" />
							<animate attributeName="x" values="10; 50; 0; 30; 10" dur="${(Number(dur) * 0.5).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" />
						</rect>

						<text x="50" y="55" font-family="monospace" font-size="12" fill="${color}" text-anchor="middle" font-weight="bold">
							ERROR_SYSTEM_FAILURE
							<animate attributeName="opacity" values="1; 0; 1; 0.2; 1" dur="${(Number(dur) * 0.3).toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" />
						</text>
					</g>
				</g>
			</svg>
		`.trim();
	},
};

export const neonFlicker: SVGGenerator = {
	id: "anim-neon-flicker",
	name: "Neon Flicker",
	description:
		"Irregular hardware-failure simulation via drop-shadow and opacity.",
	category: "Animations",
	tags: ["animation", "neon", "flicker", "retro"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Flicker Speed",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 5,
			group: "Animation",
		},
		{
			name: "voltage",
			label: "Voltage (Dimming)",
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
			default: 0.4,
			group: "Aesthetics",
		},
		{
			name: "color",
			label: "Neon Color",
			type: "color",
			default: "#ff00ff",
			group: "Colors",
		},
	],
	defaultParams: {
		speed: 5,
		voltage: 0.4,
		color: "#ff00ff",
	},
	schema: z.object({
		speed: z.number().min(0.1).max(10),
		voltage: z.number().min(0).max(1),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 5);
		const voltage = Number(params.voltage || 0.4);
		const color = String(params.color || "#ff00ff");
		const bgColor = String(params.bgColor || "#050510");
		const minOpacity = (1 - voltage).toFixed(2);
		const dur = (1 / speed).toFixed(2);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Neon Flicker</title>
				<rect width="100" height="100" fill="${bgColor}" />
				<defs>
					<filter id="neonBlur-${seed}" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
				<g filter="url(#neonBlur-${seed})">
					<animate 
						attributeName="opacity" 
						values="1; ${minOpacity}; 1; 0.9; ${minOpacity}; 1" 
						keyTimes="0; 0.1; 0.2; 0.6; 0.7; 1" 
						dur="${dur}s" 
						repeatCount="indefinite" 
						calcMode="discrete" 
					/>
					<rect x="25" y="45" width="50" height="10" rx="2" fill="none" stroke="${color}" stroke-width="1.5" />
					<text x="50" y="52" font-family="Arial" font-size="6" fill="${color}" text-anchor="middle" font-weight="bold">NEON_LIVE</text>
				</g>
			</svg>
		`.trim();
	},
};

export const scanlineSweep: SVGGenerator = {
	id: "anim-scanline",
	name: "Scanline Sweep",
	description: "Vertical CRT sweep distortion.",
	category: "Animations",
	tags: ["animation", "crt", "scanline", "retro"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Sweep Speed",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "thickness",
			label: "Scan Thickness",
			type: "number",
			min: 1,
			max: 20,
			step: 1,
			default: 5,
			group: "Aesthetics",
		},
		{
			name: "bgColor",
			label: "Background Color",
			type: "color",
			default: "#111",
			group: "Colors",
		},
	],
	defaultParams: {
		speed: 2,
		thickness: 5,
		bgColor: "#111",
	},
	schema: z.object({
		speed: z.number().min(0.1).max(10),
		thickness: z.number().min(1).max(20),
		bgColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 2);
		const thickness = Number(params.thickness || 5);
		const bgColor = String(params.bgColor || "#111");
		const dur = (1 / speed).toFixed(2);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Scanline Sweep</title>
				<rect width="100" height="100" fill="${bgColor}" />
				<defs>
					<linearGradient id="scanline-${seed}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="white" stop-opacity="0" />
						<stop offset="50%" stop-color="white" stop-opacity="0.3" />
						<stop offset="100%" stop-color="white" stop-opacity="0" />
					</linearGradient>
				</defs>
				<rect width="100" height="100" fill="#111" />
				<rect width="100" height="${thickness}" fill="url(#scanlineGrad-${seed})">
					<animate attributeName="y" from="-${thickness}" to="100" dur="${dur}s" repeatCount="indefinite" />
				</rect>
				${Array.from({ length: 20 })
					.map(
						(_, i) =>
							`<line x1="0" y1="${i * 5}" x2="100" y2="${i * 5}" stroke="black" stroke-width="0.5" opacity="0.3" />`,
					)
					.join("")}
			</svg>
		`.trim();
	},
};

export const parallaxDrift: SVGGenerator = {
	id: "anim-parallax",
	name: "Parallax Drift",
	description:
		"Slow, orbital drift for background/foreground depth simulation.",
	category: "Animations",
	tags: ["animation", "parallax", "drift", "depth"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Drift Speed",
			type: "number",
			min: 0.1,
			max: 5,
			step: 0.1,
			default: 1,
			group: "Animation",
		},
		{
			name: "intensity",
			label: "Intensity",
			type: "number",
			min: 1,
			max: 20,
			step: 1,
			default: 10,
			group: "Aesthetics",
		},
	],
	defaultParams: {
		speed: 1,
		intensity: 10,
	},
	schema: z.object({
		speed: z.number().min(0.1).max(5),
		intensity: z.number().min(1).max(20),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 1);
		const intensity = Number(params.intensity || 10);
		const dur = (10 / speed).toFixed(2);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Parallax Drift</title>
				<g transform-origin="50 50">
					<animateTransform 
						attributeName="transform" 
						type="translate" 
						values="${-intensity}, 0; 0, ${-intensity}; ${intensity}, 0; 0, ${intensity}; ${-intensity}, 0" 
						dur="${dur}s" 
						repeatCount="indefinite" 
					/>
					<circle cx="50" cy="50" r="10" fill="gray" opacity="0.5" />
					<rect x="20" y="20" width="60" height="60" fill="none" stroke="gray" stroke-width="0.5" stroke-dasharray="2 2" />
				</g>
			</svg>
		`.trim();
	},
};

export const eventHorizon: SVGGenerator = {
	id: "anim-vortex",
	name: "Event Horizon",
	description: "Radial spin and vortex pull with warping scale.",
	category: "Animations",
	tags: ["animation", "vortex", "spin", "space"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Spin Speed",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "power",
			label: "Vortex Power",
			type: "number",
			min: 0.1,
			max: 2,
			step: 0.1,
			default: 1,
			group: "Aesthetics",
		},
	],
	defaultParams: {
		speed: 2,
		power: 1,
	},
	schema: z.object({
		speed: z.number().min(0.1).max(10),
		power: z.number().min(0.1).max(2),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 2);
		const power = Number(params.power || 1);
		const dur = (5 / speed).toFixed(2);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: black;">
				<title>Event Horizon</title>
				<g transform-origin="50 50">
					<animateTransform 
						attributeName="transform" 
						type="rotate" 
						from="0" to="360" 
						dur="${dur}s" 
						repeatCount="indefinite" 
					/>
					${Array.from({ length: 12 })
						.map((_, i) => {
							const angle = (i * Math.PI * 2) / 12;
							const x = 50 + Math.cos(angle) * 30;
							const y = 50 + Math.sin(angle) * 30;
							return `
							<circle cx="${x}" cy="${y}" r="${2 * power}" fill="white" opacity="${0.1 + (i / 12) * 0.9}">
								<animate attributeName="r" values="${2 * power}; ${8 * power}; ${2 * power}" dur="${dur}s" repeatCount="indefinite" />
							</circle>
						`;
						})
						.join("")}
				</g>
			</svg>
		`.trim();
	},
};

export const chromaDisplacement: SVGGenerator = {
	id: "anim-chroma",
	name: "Chroma Displacement",
	description: "Color-shifting prism paths with refractive rotation.",
	category: "Animations",
	tags: ["animation", "chroma", "prism", "color"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Rotation Speed",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 1,
			group: "Animation",
		},
	],
	defaultParams: {
		speed: 1,
	},
	schema: z.object({
		speed: z.number().min(0.1).max(10),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 1);
		const dur = (10 / speed).toFixed(2);

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Chroma Displacement</title>
				<defs>
					<linearGradient id="chromaGrad-${seed}" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#ff0000" />
						<stop offset="33%" stop-color="#00ff00" />
						<stop offset="66%" stop-color="#0000ff" />
						<stop offset="100%" stop-color="#ff0000" />
						<animateTransform 
							attributeName="gradientTransform" 
							type="rotate" 
							from="0 0.5 0.5" to="360 0.5 0.5" 
							dur="${dur}s" 
							repeatCount="indefinite" 
						/>
					</linearGradient>
				</defs>
				<rect width="100" height="100" fill="url(#chromaGrad-${seed})" opacity="0.6" />
			</svg>
		`.trim();
	},
};

export const starfieldJump: SVGGenerator = {
	id: "anim-starfield",
	name: "Starfield Jump",
	description: "Hyper-speed particle zoom toward the viewer.",
	category: "Animations",
	tags: ["animation", "stars", "space", "zoom"],
	version: "1.0.0",
	params: [
		{
			name: "density",
			label: "Star Density",
			type: "integer",
			min: 50,
			max: 500,
			step: 10,
			default: 200,
			group: "Geometry",
		},
		{
			name: "speed",
			label: "Velocity",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 3,
			group: "Animation",
		},
	],
	defaultParams: {
		density: 200,
		speed: 3,
	},
	schema: z.object({
		density: z.number().int().min(50).max(500),
		speed: z.number().min(0.1).max(10),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const density = Number(params.density || 200);
		const speed = Number(params.speed || 3);
		const dur = (5 / speed).toFixed(2);

		let s = seed;
		const rand = () => {
			s = (s * 16807) % 2147483647;
			return (s - 1) / 2147483646;
		};

		const stars = Array.from({ length: density })
			.map((_, i) => {
				const x = (rand() * 100).toFixed(2);
				const y = (rand() * 100).toFixed(2);
				const delay = (rand() * -5).toFixed(2);
				return `
				<circle cx="${x}" cy="${y}" r="0.2" fill="white">
					<animate attributeName="r" values="0; 1; 0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />
					<animateTransform 
						attributeName="transform" 
						type="scale" 
						values="0; 5" 
						dur="${dur}s" 
						begin="${delay}s" 
						repeatCount="indefinite" 
						additive="sum"
					/>
				</circle>
			`;
			})
			.join("");

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: black;">
				<title>Starfield Jump</title>
				<g transform-origin="50 50">
					${stars}
				</g>
			</svg>
		`.trim();
	},
};

export const neuralSynthesis: SVGGenerator = {
	id: "anim-neural",
	name: "Neural Synthesis",
	description: "Blinking synaptic nodes and firing patterns.",
	category: "Animations",
	tags: ["animation", "neural", "network", "nodes"],
	version: "1.0.0",
	params: [
		{
			name: "nodes",
			label: "Node Count",
			type: "integer",
			min: 5,
			max: 30,
			step: 1,
			default: 15,
			group: "Geometry",
		},
	],
	defaultParams: {
		nodes: 15,
	},
	schema: z.object({
		nodes: z.number().int().min(5).max(30),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const count = Number(params.nodes || 15);

		let s = seed;
		const rand = () => {
			s = (s * 16807) % 2147483647;
			return (s - 1) / 2147483646;
		};

		const nodeList = Array.from({ length: count }).map((_, i) => ({
			x: rand() * 100,
			y: rand() * 100,
			delay: rand() * 3,
		}));

		const lines = [];
		for (let i = 0; i < nodeList.length; i++) {
			for (let j = i + 1; j < nodeList.length; j++) {
				const dist = Math.hypot(
					nodeList[i].x - nodeList[j].x,
					nodeList[i].y - nodeList[j].y,
				);
				if (dist < 30) {
					lines.push(`
						<line x1="${nodeList[i].x}" y1="${nodeList[i].y}" x2="${nodeList[j].x}" y2="${nodeList[j].y}" stroke="white" stroke-width="0.1" opacity="0.2">
							<animate attributeName="opacity" values="0.2; 0.8; 0.2" dur="3s" begin="${nodeList[i].delay}s" repeatCount="indefinite" />
						</line>
					`);
				}
			}
		}

		const nodes = nodeList
			.map(
				(n) => `
			<circle cx="${n.x}" cy="${n.y}" r="1" fill="#4ade80">
				<animate attributeName="r" values="1; 1.5; 1" dur="2s" begin="${n.delay}s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.5; 1; 0.5" dur="2s" begin="${n.delay}s" repeatCount="indefinite" />
			</circle>
		`,
			)
			.join("");

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Neural Synthesis</title>
				<rect width="100" height="100" fill="#020617" />
				${lines.join("")}
				${nodes}
			</svg>
		`.trim();
	},
};

export const vectorMorphing: SVGGenerator = {
	id: "anim-morph",
	name: "Vector Morphing",
	description: "Fluid path transition between geometric primitives.",
	category: "Animations",
	tags: ["animation", "morph", "path", "fluid"],
	version: "1.0.0",
	params: [
		{
			name: "speed",
			label: "Morph Speed",
			type: "number",
			min: 0.1,
			max: 10,
			step: 0.1,
			default: 2,
			group: "Animation",
		},
		{
			name: "color",
			label: "Shape Color",
			type: "color",
			default: "#3b82f6",
			group: "Colors",
		},
	],
	defaultParams: {
		speed: 2,
		color: "#3b82f6",
	},
	schema: z.object({
		speed: z.number().min(0.1).max(10),
		color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
	}),
	render: (params, seed, viewBox = { x: 0, y: 0, w: 100, h: 100 }) => {
		const speed = Number(params.speed || 2);
		const color = String(params.color || "#3b82f6");
		const dur = (5 / speed).toFixed(2);

		// Square path
		const path1 = "M 30,30 L 70,30 L 70,70 L 30,70 Z";
		// Triangle path
		const path2 = "M 50,20 L 80,80 L 20,80 L 50,20 Z";
		// Circle-ish (diamond for simple morph)
		const path3 = "M 50,10 L 90,50 L 50,90 L 10,50 Z";

		return `
			<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<title>Vector Morphing</title>
				<path d="${path1}" fill="${color}" opacity="0.8">
					<animate attributeName="d" values="${path1}; ${path2}; ${path3}; ${path1}" dur="${dur}s" repeatCount="indefinite" />
				</path>
			</svg>
		`.trim();
	},
};
