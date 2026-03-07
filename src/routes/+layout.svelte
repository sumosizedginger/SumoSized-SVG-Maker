<script lang="ts">
	import { onMount } from "svelte";
	import favicon from "$lib/assets/favicon.svg";
	import { agentApi } from "$lib/services/agentApi";
	import DebugPanel from "$lib/ui/DebugPanel.svelte";

	let { children } = $props();

	onMount(() => {
		if (typeof window !== "undefined") {
			window.SumoSvgApp = agentApi;

			// AGGRESSIVE ZOMBIE PURGE: Force the browser to evaluate the new killer script
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker
					.register("/coi-serviceworker.js")
					.then((reg) => {
						console.log(
							"[Worker] Killer script registered, enforcing update...",
						);
						return reg.update();
					})
					.then((reg) => {
						console.log(
							"[Worker] Update successful. Forcing unregistration...",
						);
						return reg.unregister();
					})
					.then((success) => {
						if (success) {
							console.log(
								"[Worker] Zombie ServiceWorker successfully killed.",
							);
						}
					})
					.catch((err) => {
						console.log(
							"[Worker] Error during purge process:",
							err,
						);
					});
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<DebugPanel />
{@render children()}
