import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import type { EncoderBackend, FrameData, EncodeOptions } from "./encoder";

export class FFmpegEncoder implements EncoderBackend {
	name = "FFmpeg.wasm (Software)";
	private ffmpeg: FFmpeg | undefined;
	private options: EncodeOptions | undefined;
	private frameCount = 0;

	supports(format: string): boolean {
		return ["mov", "mp4", "webm"].includes(format);
	}

	async init(options: EncodeOptions): Promise<void> {
		this.options = options;
		const { mediaService: i } = await import("../services/mediaService");
		this.ffmpeg = await i.getFFmpeg();
		this.frameCount = 0;

		console.log(`[Encoder] ${this.name} initialized for ${options.format}`);
	}

	async encode(frame: FrameData): Promise<void> {
		if (!this.ffmpeg) throw new Error("FFmpeg not loaded");

		let canvas = frame.data as HTMLCanvasElement;

		// No scaling needed for video formats at the moment

		const dataUrl = canvas.toDataURL("image/png");
		const base64 = dataUrl.split(",")[1];
		const fileName = `frame_${frame.index.toString().padStart(5, "0")}.png`;

		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		await this.ffmpeg.writeFile(fileName, bytes);
		this.frameCount++;
	}

	async finalize(): Promise<Blob> {
		if (!this.ffmpeg || !this.options) throw new Error("FFmpeg not loaded");

		const { format, fps } = this.options;
		const outputName = `output.${format}`;

		let args: string[];
		args = [
			"-y",
			"-framerate",
			fps.toString(),
			"-i",
			"frame_%05d.png",
			"-c:v",
			"libx264",
			"-pix_fmt",
			"yuv420p",
			outputName,
		];

		console.log(`[Encoder] Executing FFmpeg: ffmpeg ${args.join(" ")}`);
		await this.ffmpeg.exec(args);
		const data = await this.ffmpeg.readFile(outputName);

		// Cleanup
		try {
			const files = await this.ffmpeg.listDir("/");
			for (const file of files) {
				if (!file.isDir) await this.ffmpeg.deleteFile(file.name);
			}
		} catch (e) {
			console.warn("FFmpeg cleanup failed", e);
		}

		const mimeType = format === "webm" ? "video/webm" : "video/mp4";
		return new Blob([data as any], { type: mimeType });
	}
}
