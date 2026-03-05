/**
 * Telemetry Service
 * A fire-and-forget logging service for app usage.
 * Designed to not block the UI and handle failures silently.
 */

// In a real app, this would point to an actual ingestion endpoint (e.g. PostHog, custom API)
const TELEMETRY_ENDPOINT = "https://api.example.com/telemetry";
const IS_ENABLED = true; // Feature flag

type TelemetryPayload = {
	generatorId: string;
	timestamp?: string;
	[key: string]: any;
};

export type { TelemetryPayload }; // Re-export for use elsewhere

export const recentEvents: TelemetryPayload[] = $state([]);
const MAX_EVENTS = 5;

/**
 * Internal helper to fire off the telemetry request asynchronously.
 */
async function sendBeacon(event: string, data: TelemetryPayload) {
	if (!IS_ENABLED) return;

	try {
		const payload = {
			event,
			...data,
			// Ensure we never send PII or raw SVGs
			timestamp: data.timestamp || new Date().toISOString(),
		};

		// Add to local history for Debug Panel
		recentEvents.unshift(payload);
		if (recentEvents.length > MAX_EVENTS) {
			recentEvents.pop();
		}

		// Fire and forget via fetch. keepalive ensures the request finishes even if the page unloads.
		fetch(TELEMETRY_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			keepalive: true,
		}).catch((err) => {
			// Silently swallow network errors so telemetry failures never break the app
			console.debug("Telemetry send failed:", err);
		});
	} catch (e) {
		// Broad catch to prevent any telemetry logic errors from bubbling up
		console.warn("Telemetry payload construction failed:", e);
	}
}

/**
 * Log a successful generator render.
 */
export function logRender(
	generatorId: string,
	durationMs: number,
	paramHash?: string,
) {
	sendBeacon("RENDER_SUCCESS", {
		generatorId,
		durationMs,
		paramHash,
	});
}

/**
 * Log when a user exports a generator's output.
 */
export function logExport(generatorId: string, format: "svg" | "png" | "copy") {
	sendBeacon("EXPORT", {
		generatorId,
		format,
	});
}

/**
 * Log when a generator throws an error during rendering.
 */
export function logError(
	generatorId: string,
	errorCode: string,
	details?: string,
) {
	sendBeacon("RENDER_ERROR", {
		generatorId,
		errorCode,
		details,
	});
}
