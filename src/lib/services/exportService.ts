import { getBestEncoder } from "../media/encoder";
import { captureFrames } from "../media/frameCapturer";

/**
 * High-level service to handle all artifact exports.
 */
export const exportService = {
	async export(
		svgElement: SVGSVGElement,
		format: string,
		options: {
			width: number;
			height: number;
			fps: number;
			duration: number;
		},
		onProgress?: (status: string) => void,
	): Promise<Blob> {
		if (["png", "jpeg", "webp", "svg"].includes(format)) {
			return this.exportStatic(svgElement, format, options);
		}

		return this.exportAnimation(svgElement, format, options, onProgress);
	},

	async exportStatic(
		svgElement: SVGSVGElement,
		format: string,
		options: { width: number; height: number },
	): Promise<Blob> {
		const { width, height } = options;

		const svgData = new XMLSerializer().serializeToString(svgElement);

		if (format === "svg") {
			return new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
		}

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d")!;

		const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
		const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
		const img = new Image();

		return new Promise((resolve, reject) => {
			img.onload = () => {
				if (format === "jpeg") {
					ctx.fillStyle = "black";
					ctx.fillRect(0, 0, width, height);
				}
				ctx.drawImage(img, 0, 0, width, height);

				const mimeType =
					format === "jpeg"
						? "image/jpeg"
						: format === "webp"
							? "image/webp"
							: "image/png";
				canvas.toBlob((b) => resolve(b!), mimeType, 0.95);
			};
			img.onerror = reject;
			img.src = dataUrl;
		});
	},

	async exportAnimation(
		svgElement: SVGSVGElement,
		format: string,
		options: {
			width: number;
			height: number;
			fps: number;
			duration: number;
		},
		onProgress?: (status: string) => void,
	): Promise<Blob> {
		const encoder = await getBestEncoder(format);
		await encoder.init({ ...options, format });

		if (onProgress) onProgress(`Engine: ${encoder.name} initialized...`);

		const frames = captureFrames(
			svgElement,
			options.duration,
			options.fps,
			options.width,
			options.height,
		);

		const totalFrames = options.duration * options.fps;
		console.log(`[Export] Starting capture of ${totalFrames} frames...`);

		for await (const frame of frames) {
			await encoder.encode(frame);
			if (onProgress) {
				const percent = Math.round((frame.index / totalFrames) * 100);
				onProgress(
					`${encoder.name}: ${percent}% (${(frame.timestamp / 1000000).toFixed(1)}s)`,
				);
			}
			if (frame.index % 10 === 0)
				console.log(
					`[Export] Encoded frame ${frame.index}/${totalFrames}`,
				);
		}

		if (onProgress) onProgress("Finalizing container...");
		return encoder.finalize();
	},
};
