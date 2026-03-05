import type { SVGGenerator } from "../core/types";

// The Blinking Skull Masterpiece (God Mode Demonstration)
const defaultBlinkingSkull = `<path d="M50 20 c-15 0-25 10-25 25 c0 10 5 18 12 22 v8 c0 3 2 5 5 5 h16 c3 0 5-2 5-5 v-8 c7-4 12-12 12-22 c0-15-10-25-25-25 z M50 65c-6 0-10-4-10-4l2-2s2 2 8 2 8-2 8-2l2 2s-4 4-10 4z" fill="#f0f0f0" stroke="#333" stroke-width="1" fill-rule="evenodd" />
<ellipse cx="42" cy="44" rx="4" ry="4" fill="#000"><animate attributeName="ry" values="4; 0; 4; 4; 4" keyTimes="0; 0.05; 0.1; 0.5; 1" dur="4s" repeatCount="indefinite" /><animate attributeName="cy" values="44; 44; 44; 44; 44" keyTimes="0; 0.05; 0.1; 0.5; 1" dur="4s" repeatCount="indefinite" /></ellipse>
<ellipse cx="58" cy="44" rx="4" ry="4" fill="#000"><animate attributeName="ry" values="4; 0; 4; 4; 4" keyTimes="0; 0.05; 0.1; 0.5; 1" dur="4s" repeatCount="indefinite" /><animate attributeName="cy" values="44; 44; 44; 44; 44" keyTimes="0; 0.05; 0.1; 0.5; 1" dur="4s" repeatCount="indefinite" /></ellipse>`;

export const svgImport: SVGGenerator = {
	id: "svg-import",
	name: "SVG Import",
	category: "Custom",
	description: "Import custom SVG markup as a layer.",
	tags: ["custom", "import", "upload", "markup", "skull"],
	version: "1.1.0",
	params: [
		{
			name: "svgData",
			type: "text",
			label: "SVG Markup",
			default: defaultBlinkingSkull,
		},
	],
	defaultParams: {
		svgData: defaultBlinkingSkull,
	},
	render: (params) => {
		const raw = String(params.svgData || "");

		// Remove XML prologs, doctypes, and comments
		let content = raw
			.replace(/<\?xml.*?\?>/gi, "")
			.replace(/<!DOCTYPE.*?>/gi, "")
			.replace(/<!--[\s\S]*?-->/g, "");

		// Strip ALL <svg> and </svg> tags to ensure valid nesting in the composition.
		// We use a global case-insensitive replace.
		content = content.replace(/<svg[^>]*>/gi, "");
		content = content.replace(/<\/svg>/gi, "");

		return `
            <title>Imported SVG</title>
            <desc>Custom vector artwork imported by the user.</desc>
            <g>${content}</g>
        `;
	},
};
