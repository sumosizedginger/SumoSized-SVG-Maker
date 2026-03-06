import { z } from "zod";
import type { SVGGenerator } from "../core/types";

export const imageLayerSchema = z.object({
    imageData: z.string().default(""), // Base64 or URL
    opacity: z.number().min(0).max(1).default(1),
    preserveAspectRatio: z.enum(["xMidYMid meet", "xMidYMid slice", "none"]).default("xMidYMid meet"),
});

export const imageLayer: SVGGenerator = {
    id: "image-layer",
    name: "Image Layer",
    description: "Import PNG, JPG, or WebP images into your SVG composition.",
    category: "Layers",
    tags: ["import", "raster", "texture"],
    version: "1.0.0",
    params: [
        {
            name: "imageData",
            label: "Image Data",
            type: "text",
            default: "",
            description: "Base64 encoded image or URL",
        },
        {
            name: "preserveAspectRatio",
            label: "Scaling Mode",
            type: "select",
            default: "xMidYMid meet",
            options: [
                { value: "xMidYMid meet", label: "Fit (Meet)" },
                { value: "xMidYMid slice", label: "Fill (Slice)" },
                { value: "none", label: "Stretch" },
            ],
        },
    ],
    defaultParams: {
        imageData: "",
        preserveAspectRatio: "xMidYMid meet",
    },
    schema: imageLayerSchema,
    render: (params) => {
        if (!params.imageData) {
            return `<rect width="100" height="100" fill="#2d3748" stroke="#4a5568" stroke-dasharray="4" /><text x="50" y="50" text-anchor="middle" fill="#718096" font-size="6">No Image Selected</text>`;
        }
        return `<image href="${params.imageData}" width="100" height="100" preserveAspectRatio="${params.preserveAspectRatio}" />`;
    },
};
