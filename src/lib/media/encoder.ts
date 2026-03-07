import { capabilities } from "./capabilities";

/**
 * Common frame data structure for all encoders.
 */
export interface FrameData {
	data: Uint8Array | ImageBitmap | HTMLCanvasElement;
	timestamp: number; // Microseconds
	index: number;
}

/**
 * Interface for media encoding backends.
 */
export interface EncoderBackend {
	name: string;
	supports(format: string): boolean;
	init(options: EncodeOptions): Promise<void>;
	encode(frame: FrameData): Promise<void>;
	finalize(): Promise<Blob>;
}

export interface EncodeOptions {
	format: string;
	width: number;
	height: number;
	fps: number;
	duration: number;
}

/**
 * Feature-detected encoder selection.
 */
export async function getBestEncoder(format: string): Promise<EncoderBackend> {
	if (capabilities.hasWebCodecs && ["mp4", "webm", "mov"].includes(format)) {
		const { WebCodecsEncoder } = await import("./webcodecsEncoder.ts");
		return new WebCodecsEncoder();
	}

	const { FFmpegEncoder } = await import("./ffmpegEncoder.ts");
	return new FFmpegEncoder();
}
