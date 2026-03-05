export interface Palette {
	id: string;
	name: string;
	colors: string[];
}

export const palettes: Palette[] = [
	{
		id: "minimal-dark",
		name: "Minimal Dark",
		colors: ["#1a1a1a", "#333333", "#4d4d4d", "#666666"],
	},
	{
		id: "neon-vibe",
		name: "Neon Vibe",
		colors: ["#00f5d4", "#00bbf9", "#fee440", "#f15bb5", "#9b5de5"],
	},
	{
		id: "pastel-dreams",
		name: "Pastel Dreams",
		colors: [
			"#ffadad",
			"#ffd6a5",
			"#fdffb6",
			"#caffbf",
			"#9bf6ff",
			"#a0c4ff",
			"#bdb2ff",
			"#ffc6ff",
		],
	},
	{
		id: "ocean-deep",
		name: "Ocean Deep",
		colors: [
			"#03045e",
			"#023e8a",
			"#0077b6",
			"#0096c7",
			"#00b4d8",
			"#48cae4",
			"#90e0ef",
			"#caf0f8",
		],
	},
	{
		id: "earthy-tones",
		name: "Earthy Tones",
		colors: ["#283618", "#606c38", "#fefae0", "#dda15e", "#bc6c25"],
	},
	{
		id: "nordic",
		name: "Nordic",
		colors: [
			"#2e3440",
			"#3b4252",
			"#434c5e",
			"#4c566a",
			"#d8dee9",
			"#e5e9f0",
			"#eceff4",
		],
	},
	{
		id: "sunset-boulevard",
		name: "Sunset Boulevard",
		colors: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
	},
	{
		id: "monochrome-silver",
		name: "Monochrome Silver",
		colors: [
			"#f8f9fa",
			"#e9ecef",
			"#dee2e6",
			"#ced4da",
			"#adb5bd",
			"#6c757d",
			"#495057",
			"#343a40",
			"#212529",
		],
	},
	{
		id: "high-contrast",
		name: "High Contrast",
		colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
	},
	{
		id: "cyberpunk",
		name: "Cyberpunk",
		colors: ["#0d0221", "#261447", "#ff0054", "#ffbd00", "#390099"],
	},
];

export function getPalette(id: string): Palette | undefined {
	return palettes.find((p) => p.id === id);
}

/**
 * Maps a palette to role-based colors (bg, fg, accent, etc.)
 */
export function getPaletteRole(
	palette: Palette,
	role: "bg" | "fg" | "accent" | "secondary" | "neutral",
	index: number = 0,
): string {
	const colors = palette.colors;
	switch (role) {
		case "bg":
			return colors[0];
		case "fg":
			return colors[colors.length - 1];
		case "accent":
			return colors[Math.min(1, colors.length - 1)];
		case "secondary":
			return colors[Math.min(2, colors.length - 1)];
		case "neutral":
			return colors[Math.floor(colors.length / 2)];
		default:
			return colors[index % colors.length];
	}
}
