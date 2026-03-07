/*!
 * Zombie ServiceWorker Killer - v2 (Bulletproof)
 * Forces the browser to detach from the old coi-serviceworker and use the direct network.
 */

self.addEventListener("install", function () {
	// Force this worker to activate immediately
	self.skipWaiting();
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		// Take control of all clients and immediately unregister
		self.clients.claim().then(() => {
			return self.registration.unregister();
		}),
	);
});

// Notice: NO fetch listener.
// A service worker without a fetch listener will not intercept any network traffic.
