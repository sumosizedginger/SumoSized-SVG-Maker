import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Enable Cross-Origin Isolation for FFmpeg.wasm multithreading
	response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
	response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

	return response;
};
