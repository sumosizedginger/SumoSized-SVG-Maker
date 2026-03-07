import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { appState } from "$lib/state/appState.svelte";

export class MediaService {
	private ffmpeg: FFmpeg | null = null;
	private loadPromise: Promise<void> | null = null;

	async load() {
		if (this.ffmpeg) return;
		if (this.loadPromise) return this.loadPromise;

		this.loadPromise = (async () => {
			try {
				const ffmpeg = new FFmpeg();
				ffmpeg.on("log", ({ message }) => {
					console.log("[FFmpeg]", message);
				});

				const baseURL = "/ffmpeg";
				try {
					await ffmpeg.load({
						coreURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.js`,
							"text/javascript",
						),
						wasmURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.wasm`,
							"application/wasm",
						),
						workerURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.worker.js`,
							"text/javascript",
						),
					});
				} catch (err) {
					console.warn(
						"[FFmpeg] MT Load failed, retrying without worker...",
						err,
					);
					await ffmpeg.load({
						coreURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.js`,
							"text/javascript",
						),
						wasmURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.wasm`,
							"application/wasm",
						),
					});
				}

				this.ffmpeg = ffmpeg;
				console.log("[FFmpeg] Loaded successfully from CDN (v0.12.10)");
			} catch (e) {
				console.error("[FFmpeg] Load Failed", e);
				this.loadPromise = null;
				throw e;
			}
		})();

		return this.loadPromise;
	}

	async getFFmpeg() {
		await this.load();
		if (!this.ffmpeg) throw new Error("FFmpeg failing to load");
		return this.ffmpeg;
	}
}

export const mediaService = new MediaService();
