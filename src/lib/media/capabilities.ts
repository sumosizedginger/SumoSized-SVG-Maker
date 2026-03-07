export const capabilities = {
	get crossOriginIsolated() {
		return globalThis.crossOriginIsolated ?? false;
	},
	get hasWebCodecs() {
		return "VideoEncoder" in globalThis;
	},
	get hasSharedArrayBuffer() {
		return typeof SharedArrayBuffer !== "undefined";
	},
	get hasFileSystemAccess() {
		return "showSaveFilePicker" in globalThis;
	},
	get hasOffscreenCanvas() {
		return "OffscreenCanvas" in globalThis;
	},
};
