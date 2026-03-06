import { z } from "zod";
import type { SVGGenerator } from "../core/types";

export const unifiedImportSchema = z.object({
    sourceType: z.enum(["svg", "image", "video"]).default("image"),
    url: z.string().default(""),
    opacity: z.number().min(0).max(1).default(1),
    preserveAspectRatio: z.enum(["xMidYMid meet", "xMidYMid slice", "none"]).default("xMidYMid meet"),
    loop: z.boolean().default(true),
    muted: z.boolean().default(true),
});

export const unifiedImport: SVGGenerator = {
    id: "unified-import",
    name: "Import Asset",
    description: "Import SVG vectors, Raster images (PNG/APNG/JPG/WebP/GIF), or Videos (MP4/WebM).",
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
    ],
    defaultParams: {
        sourceType: "image",
        url: "",
        preserveAspectRatio: "xMidYMid meet",
        loop: true,
        muted: true,
    },
    schema: unifiedImportSchema,
    render: (params) => {
        if (!params.url) {
            return `<rect width="100" height="100" fill="#1a202c" stroke="#2d3748" stroke-dasharray="2" /><text x="50" y="50" text-anchor="middle" fill="#4a5568" font-size="5">No Asset Loaded</text>`;
        }

        let processedUrl = params.url;
        if (params.sourceType === "svg" && params.url.trim().startsWith("<svg")) {
            // Convert raw SVG string to Data URI for <image> tag
            processedUrl = `data:image/svg+xml;base64,${btoa(params.url)}`;
        }

        if (params.sourceType === "video") {
            return `
				<foreignObject width="100" height="100">
					<video 
						src="${processedUrl}" 
						style="width:100%; height:100%; object-fit:${params.preserveAspectRatio === 'none' ? 'fill' : params.preserveAspectRatio === 'xMidYMid slice' ? 'cover' : 'contain'};"
						${params.loop ? 'loop' : ''} 
						${params.muted ? 'muted' : ''} 
						autoplay 
						playsinline
					></video>
				</foreignObject>
			`;
        } else {
            // Handles PNG, JPG, GIF, and SVG (URL or Data URI)
            return `<image href="${processedUrl}" width="100" height="100" preserveAspectRatio="${params.preserveAspectRatio}" />`;
        }
    },
};
