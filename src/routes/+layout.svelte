<script lang="ts">
	import { onMount } from "svelte";
	import favicon from "$lib/assets/favicon.svg";
	import { agentApi } from "$lib/services/agentApi";
	import DebugPanel from "$lib/ui/DebugPanel.svelte";

	let { children } = $props();

	onMount(() => {
		if (typeof window !== "undefined") {
			window.SumoSvgApp = agentApi;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<DebugPanel />
{@render children()}
