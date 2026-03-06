import { z } from "zod";
import type { SVGGenerator } from "../core/types";

export const unifiedImportSchema = z.object({
	sourceType: z.enum(["svg", "image", "video"]).default("image"),
	url: z.string().default(""),
	opacity: z.number().min(0).max(1).default(1),
	preserveAspectRatio: z
		.enum(["xMidYMid meet", "xMidYMid slice", "none"])
		.default("xMidYMid meet"),
	aspectRatio: z
		.enum([
			"original",
			"1:1",
			"4:3",
			"16:9",
			"21:9",
			"9:16",
			"2.39:1",
			"1.85:1",
			"2:3",
			"5:4",
		])
		.default("original"),
	loop: z.boolean().default(true),
	muted: z.boolean().default(true),
});

export const unifiedImport: SVGGenerator = {
	id: "unified-import",
	name: "Import Asset",
	description:
		"Import SVG vectors, Raster images (PNG/APNG/JPG/WebP/GIF), or Videos (MP4/WebM).",
	category: "Layers",
	tags: ["import", "raster", "vector", "video", "gif", "apng", "webp"],
	version: "1.1.0",
	params: [
		{
			name: "sourceType",
			label: "Type",
			type: "select",
			default: "image",
			options: [
				{ value: "svg", label: "SVG Vector" },
				{ value: "image", label: "Image / GIF" },
				{ value: "video", label: "Video" },
			],
		},
		{
			name: "url",
			label: "URL / Data URL",
			type: "text",
			default: "",
			description: "Base64 or direct URL of the asset",
		},
		{
			name: "preserveAspectRatio",
			label: "Scaling",
			type: "select",
			default: "xMidYMid meet",
			options: [
				{ value: "xMidYMid meet", label: "Fit" },
				{ value: "xMidYMid slice", label: "Fill" },
				{ value: "none", label: "Stretch" },
			],
		},
		{
			name: "aspectRatio",
			label: "Aspect Ratio",
			type: "select",
			default: "original",
			options: [
				{ value: "original", label: "Original (1:1 Box)" },
				{ value: "1:1", label: "Square (1:1)" },
				{ value: "4:3", label: "Standard (4:3)" },
				{ value: "16:9", label: "Widescreen (16:9)" },
				{ value: "21:9", label: "Ultrawide (21:9)" },
				{ value: "2.39:1", label: "Anamorphic (2.39:1)" },
				{ value: "1.85:1", label: "Cinema (1.85:1)" },
				{ value: "9:16", label: "Vertical (9:16)" },
				{ value: "2:3", label: "35mm (2:3)" },
				{ value: "5:4", label: "Classic (5:4)" },
			],
		},
	],
	defaultParams: {
		sourceType: "image",
		url: "",
		preserveAspectRatio: "xMidYMid meet",
		aspectRatio: "original",
		loop: true,
		muted: true,
	},
	schema: unifiedImportSchema,
	render: (params) => {
		if (!params.url) {
			return `<rect width="100" height="100" fill="#1a202c" stroke="#2d3748" stroke-dasharray="2" /><text x="50" y="50" text-anchor="middle" fill="#4a5568" font-size="5">No Asset Loaded</text>`;
		}

		let processedUrl = params.url;
		if (
			params.sourceType === "svg" &&
			params.url.trim().startsWith("<svg")
		) {
			// Basic sanitization for OSS safety: Remove script tags
			const sanitized = params.url.replace(
				/<script\b[^>]*>([\s\S]*?)<\/script>/gim,
				"",
			);
			// Convert raw SVG string to Data URI for <image> tag
			processedUrl = `data:image/svg+xml;base64,${btoa(sanitized)}`;
		}

		let renderWidth = 100;
		let renderHeight = 100;
		let renderX = 0;
		let renderY = 0;

		if (params.aspectRatio && params.aspectRatio !== "original") {
			const parts = params.aspectRatio.split(":");
			let wRatio = 1;
			let hRatio = 1;

			if (parts.length === 2) {
				wRatio = Number(parts[0]);
				hRatio = Number(parts[1]);
			} else if (params.aspectRatio.includes(":1")) {
				wRatio = Number(params.aspectRatio.split(":")[0]);
				hRatio = 1;
			}

			const targetRatio = wRatio / hRatio;

			if (targetRatio > 1) {
				// Landscape
				renderWidth = 100;
				renderHeight = 100 / targetRatio;
				renderY = (100 - renderHeight) / 2;
			} else {
				// Portrait or Square
				renderHeight = 100;
				renderWidth = 100 * targetRatio;
				renderX = (100 - renderWidth) / 2;
			}
		}

		if (params.sourceType === "video") {
			return `
				<foreignObject x="${renderX}" y="${renderY}" width="${renderWidth}" height="${renderHeight}">
					<video 
						src="${processedUrl}" 
						style="width:100%; height:100%; object-fit:${params.preserveAspectRatio === "none" ? "fill" : params.preserveAspectRatio === "xMidYMid slice" ? "cover" : "contain"};"
						${params.loop ? "loop" : ""} 
						${params.muted ? "muted" : ""} 
						autoplay 
						playsinline
					></video>
				</foreignObject>
			`;
		} else {
			// Handles PNG, JPG, GIF, and SVG (URL or Data URI)
			return `<image x="${renderX}" y="${renderY}" href="${processedUrl}" width="${renderWidth}" height="${renderHeight}" preserveAspectRatio="${params.preserveAspectRatio}" />`;
		}
	},
};
