import type { SVGGenerator } from "../core/types";

// 2026 High-Performance Precision and Security Cap
const fix = (n: number) => Number(n.toFixed(2));
const esc = (t: string) =>
	t
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

export const textEffects: SVGGenerator = {
	id: "text-effects",
	name: "Advanced Text",
	category: "Typography",
	description: "Text effects including Arch, Circle, and Wave paths.",
	tags: ["text", "typography", "rainbow", "circle", "wave"],
	version: "1.0.0",
	params: [
		{
			name: "content",
			type: "text",
			label: "Text Content",
			default: "SUMOSIZED",
		},
		{
			name: "effect",
			type: "select",
			label: "Effect Type",
			options: [
				{ value: "straight", label: "Straight" },
				{ value: "arch", label: "Arch (Rainbow)" },
				{ value: "circle", label: "Circle" },
				{ value: "wave", label: "Wave" },
				{ value: "spiral", label: "Spiral" },
			],
			default: "arch",
		},
		{
			name: "fontSize",
			type: "number",
			label: "Font Size",
			min: 2,
			max: 200,
			step: 1,
			default: 8,
		},
		{
			name: "color",
			type: "color",
			label: "Text Color",
			default: "#4DFF00",
		},
		{
			name: "strokeColor",
			type: "color",
			label: "Border Color",
			default: "#000000",
		},
		{
			name: "strokeWidth",
			type: "number",
			label: "Border Width",
			min: 0,
			max: 20,
			step: 0.1,
			default: 0,
		},
		{
			name: "radius",
			type: "number",
			label: "Curve Radius / Amp",
			min: 1,
			max: 500,
			step: 1,
			default: 40,
		},
		{
			name: "spacing",
			type: "number",
			label: "Letter Spacing",
			min: -20,
			max: 50,
			step: 0.5,
			default: 0,
		},
		{
			name: "startOffset",
			type: "number",
			label: "Start Offset (%)",
			min: -100,
			max: 200,
			step: 1,
			default: 50,
		},
	],
	defaultParams: {
		content: "What in the fuck is going on here?",
		effect: "spiral",
		fontSize: 8,
		color: "#4DFF00",
		strokeColor: "#000000",
		strokeWidth: 0,
		radius: 40,
		spacing: 0,
		startOffset: 50,
	},
	render: (params, seed) => {
		const text = String(params.content || "SUMOSIZED");
		const effect = String(params.effect || "straight");
		const fontSize = Number(params.fontSize || 8);
		const color = String(params.color || "#4DFF00");
		const strokeColor = String(params.strokeColor || "#000000");
		const strokeWidth = Number(params.strokeWidth || 0);
		const r = Number(params.radius || 40);
		const spacing = Number(params.spacing || 0);
		const offset =
			params.startOffset !== undefined ? Number(params.startOffset) : 50;

		// 100% Deterministic ID to prevent snapshot regression and DOM collision
		const safeText = text.replace(/[^a-z0-9]/gi, "").substring(0, 10);
		const id = `path-${seed}-${effect}-${safeText}`;

		let pathData = "";
		let textAnchor = "middle";
		let startOffsetAttr = `${offset}%`;

		const textStyle = `letter-spacing: ${spacing}px; paint-order: stroke fill;`;
		const commonAttrs = `
			font-size="${fontSize}" 
			fill="${color}" 
			stroke="${strokeColor}" 
			stroke-width="${strokeWidth}"
			font-family="Montserrat, Inter, sans-serif" 
			font-weight="800" 
			text-anchor="middle" 
			dominant-baseline="middle"
			style="${textStyle}"
		`.trim();

		if (effect === "straight") {
			return `<text x="50" y="50" ${commonAttrs}>${text}</text>`;
		}

		if (effect === "arch") {
			// A wide, majestic arch that doesn't pinch at the ends.
			// Path is long enough to prevent truncation even with large fonts.
			const span = 150; // Start/end far outside to ensure coverage
			pathData = `M ${50 - span},${50 + r} Q 50,${50 - r * 1.2} ${50 + span},${50 + r}`;
		} else if (effect === "circle") {
			// Restore slider range: radius now maps naturally to the coordinate space.
			// We don't cap it at 48; if they want it huge, it's their choice, but we keep it centered.
			pathData = `M 50,${50 - r} A ${r},${r} 0 1 1 50,${50 + r} A ${r},${r} 0 1 1 50,${50 - r}`;
		} else if (effect === "wave") {
			// "Rolling Wave" logic: increase wavelength significantly as amplitude increases
			// to prevent letter collision/pinching.
			const waveLength = 100 + r * 1.5;
			const startX = 50 - waveLength * 2;
			pathData = `M ${startX},50 `;
			for (let i = 0; i < 4; i++) {
				const x0 = startX + i * waveLength;
				pathData += `Q ${x0 + waveLength / 4},${50 - r} ${x0 + waveLength / 2},50 T ${x0 + waveLength},50 `;
			}
		} else if (effect === "spiral") {
			// "Breathing Spiral": significantly faster growth rate (r/30) to prevent
			// letter overlapping in tight coils.
			const centerX = 50;
			const centerY = 50;
			const loops = 5; // Fewer loops, higher growth = cleaner look
			const points = [];
			const growth = 0.5 + r / 30;
			for (let theta = 0; theta < loops * 2 * Math.PI; theta += 0.2) {
				const currentRadius = 2 + growth * theta;
				const x = centerX + currentRadius * Math.cos(theta);
				const y = centerY + currentRadius * Math.sin(theta);
				points.push(`${fix(x)},${fix(y)}`);
			}
			const first = points.shift();
			pathData = `M ${first} L ${points.join(" ")}`;
			textAnchor = "start";
			startOffsetAttr = offset === 50 ? "0%" : `${offset}%`;
		}

		const escapedText = esc(text);

		return `
            <title>Advanced Text: ${escapedText}</title>
            <desc>Text rendered using the ${effect} effect with ${fontSize}px font size.</desc>
            <defs>
                <path id="${id}" d="${pathData}" fill="none" />
            </defs>
            <text 
				font-size="${fontSize}" 
				fill="${color}" 
				stroke="${strokeColor}"
				stroke-width="${strokeWidth}"
				font-family="Montserrat, Inter, sans-serif" 
				font-weight="800" 
				text-anchor="${textAnchor}" 
				dominant-baseline="middle"
				role="graphics-object" 
				aria-label="${escapedText}"
				style="${textStyle}"
			>
                <textPath 
                    href="#${id}" 
                    startOffset="${startOffsetAttr}"
					spacing="auto"
					method="align"
                >
                    ${escapedText}
                </textPath>
            </text>
        `.trim();
	},
};
