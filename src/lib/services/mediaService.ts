import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { appState } from "$lib/state/appState.svelte";

export class MediaService {
	private ffmpeg: FFmpeg | null = null;
	private loading = false;

	async load() {
		if (this.ffmpeg) return;
		if (this.loading) return;

		this.loading = true;
		try {
			const ffmpeg = new FFmpeg();

			ffmpeg.on("log", ({ message }) => {
				console.log("[FFmpeg]", message);
				if (message.includes("Fatal") || message.includes("Error")) {
					console.error("[FFmpeg Fatal]", message);
				}
			});

			const LOAD_TIMEOUT_MS = 20000;
			const timeout = new Promise<never>((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error(
								"FFmpeg load timed out after 20s — local package loading failed",
							),
						),
					LOAD_TIMEOUT_MS,
				),
			);

			await Promise.race([
				ffmpeg.load({
					coreURL: await toBlobURL(
						`/ffmpeg/ffmpeg-core.js`,
						"text/javascript",
					),
					wasmURL: await toBlobURL(
						`/ffmpeg/ffmpeg-core.wasm`,
						"application/wasm",
					),
				}),
				timeout,
			]);

			this.ffmpeg = ffmpeg;
		} catch (e) {
			console.error("FFmpeg Load Failed", e);
			throw e;
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Captures animation frames and encodes them into a video/GIF.
	 */
	async exportAnimation(
		format: "mov" | "gif" | "webm" | "mp4" = "mov",
		duration: number = 3,
		fps: number = 24,
		width: number = 1080,
		height: number = 1080,
	) {
		await this.load();
		if (!this.ffmpeg) throw new Error("FFmpeg not loaded");

		console.log(
			`Starting ${format} export: ${duration}s @ ${fps}fps (${width}x${height})`,
		);

		try {
			const svgElement = document.querySelector(
				".svg-wrapper > svg",
			) as SVGSVGElement | null;
			if (!svgElement)
				throw new Error(
					"Main Preview SVG element not found in .svg-wrapper",
				);

			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d")!;

			const totalFrames = Math.floor(duration * fps);
			const serializer = new XMLSerializer();
			const img = new Image();

			// Prepare for encoding
			for (let i = 0; i < totalFrames; i++) {
				const time = i / fps;
				appState.renderingStatus = `Capturing Frame ${i + 1}/${totalFrames}...`;
				svgElement.setCurrentTime(time);

				// Force layout/repaint for capture
				const svgData = serializer.serializeToString(svgElement);
				const svgBlob = new Blob([svgData], {
					type: "image/svg+xml;charset=utf-8",
				});
				const url = URL.createObjectURL(svgBlob);

				await new Promise((resolve, reject) => {
					const timeout = setTimeout(
						() => reject(new Error("Frame capture timeout")),
						5000,
					);
					img.onload = () => {
						clearTimeout(timeout);
						ctx.fillStyle = "black"; // Background for transparency handling
						ctx.fillRect(0, 0, width, height);
						ctx.drawImage(img, 0, 0, width, height);
						URL.revokeObjectURL(url);
						resolve(null);
					};
					img.onerror = () => {
						clearTimeout(timeout);
						reject(new Error("Image load error"));
					};
					img.src = url;
				});

				// Write frame to FFmpeg virtual FS
				const frameData = await new Promise<Uint8Array>((resolve) => {
					canvas.toBlob((blob) => {
						const reader = new FileReader();
						reader.onloadend = () =>
							resolve(
								new Uint8Array(reader.result as ArrayBuffer),
							);
						reader.readAsArrayBuffer(blob!);
					}, "image/png");
				});

				await this.ffmpeg.writeFile(
					`frame${i.toString().padStart(5, "0")}.png`,
					frameData,
				);
			}

			appState.renderingStatus = `Encoding ${format.toUpperCase()} (${format === "gif" ? "Fast" : "H.264 High Profile"})...`;

			// Run FFmpeg command for selected format
			if (format === "mov" || format === "mp4") {
				// High-quality H.264 output
				await this.ffmpeg.exec([
					"-framerate",
					fps.toString(),
					"-i",
					"frame%05d.png",
					"-c:v",
					"libx264",
					"-pix_fmt",
					"yuv420p",
					"-preset",
					"ultrafast",
					"-crf",
					"18",
					"output.mp4",
				]);
			} else if (format === "webm") {
				await this.ffmpeg.exec([
					"-framerate",
					fps.toString(),
					"-i",
					"frame%05d.png",
					"-c:v",
					"libvpx-vp9",
					"-pix_fmt",
					"yuv420p",
					"-crf",
					"30",
					"-b:v",
					"0",
					"output.webm",
				]);
			} else {
				await this.ffmpeg.exec([
					"-framerate",
					fps.toString(),
					"-i",
					"frame%05d.png",
					"-vf",
					"split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
					"output.gif",
				]);
			}

			const outputExt =
				format === "mov" || format === "mp4"
					? "mp4"
					: format === "webm"
						? "webm"
						: "gif";
			const data = await this.ffmpeg.readFile(`output.${outputExt}`);

			// Cleanup FS
			const files = await this.ffmpeg.listDir(".");
			for (const file of files) {
				if (
					file.name.startsWith("frame") ||
					file.name.startsWith("output")
				) {
					await this.ffmpeg.deleteFile(file.name);
				}
			}

			const mimeType =
				format === "mov" || format === "mp4"
					? "video/mp4"
					: format === "webm"
						? "video/webm"
						: "image/gif";
			return new Blob([data as any], { type: mimeType });
		} catch (error) {
			console.error("[MediaService] Export Failed", error);
			appState.renderingStatus = `Error: ${error instanceof Error ? error.message : "Encoding Failed"}`;
			// Let the error show for 3 seconds then clear
			setTimeout(() => {
				if (appState.renderingStatus.startsWith("Error:")) {
					appState.renderingStatus = "";
				}
			}, 3000);
			throw error;
		} finally {
			// Ensure status is cleared if NOT an error
			if (
				appState.renderingStatus &&
				!appState.renderingStatus.startsWith("Error:")
			) {
				appState.renderingStatus = "";
			}
		}
	}
}

export const mediaService = new MediaService();
