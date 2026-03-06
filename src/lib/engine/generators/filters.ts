import { z } from "zod";

export const blurFilterSchema = z.object({
	stdDeviation: z.number().min(0).max(50).default(5),
});

export const displacementFilterSchema = z.object({
	scale: z.number().min(0).max(100).default(20),
	baseFrequency: z.number().min(0.001).max(0.5).default(0.05),
	numOctaves: z.number().int().min(1).max(5).default(2),
});

export const colorMatrixSchema = z.object({
	type: z
		.enum(["matrix", "saturate", "hueRotate", "luminanceToAlpha"])
		.default("matrix"),
	values: z.string().default("1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"),
});

export interface FilterDefinition {
	id: string;
	name: string;
	schema: z.ZodObject<any>;
	render: (params: any, id: string) => string;
}

export const filterDefinitions: Record<string, FilterDefinition> = {
	blur: {
		id: "blur",
		name: "Gaussian Blur",
		schema: blurFilterSchema,
		render: (params, id) => `
			<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${params.stdDeviation}" />
			</filter>
		`,
	},
	displacement: {
		id: "displacement",
		name: "Turbulent Displacement",
		schema: displacementFilterSchema,
		render: (params, id) => `
			<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
				<feTurbulence type="fractalNoise" baseFrequency="${params.baseFrequency}" numOctaves="${params.numOctaves}" result="noise" />
				<feDisplacementMap in="SourceGraphic" in2="noise" scale="${params.scale}" xChannelSelector="R" yChannelSelector="G" />
			</filter>
		`,
	},
	"color-matrix": {
		id: "color-matrix",
		name: "Color Matrix",
		schema: colorMatrixSchema,
		render: (params, id) => `
			<filter id="${id}">
				<feColorMatrix type="${params.type}" values="${params.values}" />
			</filter>
		`,
	},
};
