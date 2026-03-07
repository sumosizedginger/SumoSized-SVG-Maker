import {
	Output,
	Mp4OutputFormat,
	WebMOutputFormat,
	BufferTarget,
	CanvasSource,
} from "mediabunny";
import type { EncoderBackend, FrameData, EncodeOptions } from "./encoder";

export class WebCodecsEncoder implements EncoderBackend {
	name = "WebCodecs (Hardware Accelerated)";
	private output: any;
	private target: BufferTarget | undefined;
	private format: string | undefined;

	supports(format: string): boolean {
		return ["mp4", "webm", "mov"].includes(format);
	}

	private source: CanvasSource | undefined;

	async init(options: EncodeOptions): Promise<void> {
		this.format = options.format;
		this.target = new BufferTarget();
		const FormatClass =
			options.format === "webm" ? WebMOutputFormat : Mp4OutputFormat;

		this.output = new Output({
			format: new FormatClass(),
			target: this.target,
		});

		// Mediabunny VideoEncodingConfig expects shorthand codec names
		const config: any = {
			codec: this.format === "webm" ? "vp9" : "avc",
			width: options.width,
			height: options.height,
			bitrate: 5_000_000,
		};

		this.source = new CanvasSource(
			document.createElement("canvas"),
			config,
		); // We'll attach real canvas per frame
		this.output.addVideoTrack(this.source);
		await this.output.start();

		console.log(`[Encoder] ${this.name} initialized for ${options.format}`);
	}

	async encode(frame: FrameData): Promise<void> {
		if (!this.output || !this.source)
			throw new Error("Encoder not initialized");

		// Update canvas reference if needed (hacky but mediabunny's CanvasSource takes it in constructor)
		(this.source as any)._canvas = frame.data as HTMLCanvasElement;

		await this.source.add(frame.timestamp / 1_000_000, 1 / 24);
	}

	async finalize(): Promise<Blob> {
		if (!this.output || !this.target)
			throw new Error("Encoder not initialized");

		await this.output.finalize();
		const buffer = await this.target.buffer;

		const mimeType = this.format === "webm" ? "video/webm" : "video/mp4";
		return new Blob([buffer as any], { type: mimeType });
	}
}
