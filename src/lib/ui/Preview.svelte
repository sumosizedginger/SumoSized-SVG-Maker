<script lang="ts">
	import { tick } from "svelte";

	interface Props {
		svg: string;
		isAnimation?: boolean;
	}

	let { svg, isAnimation = false }: Props = $props();

	let containerEl: HTMLDivElement;
	let playing = $state(true);

	// When SVG changes, re-apply pause state after render
	$effect(() => {
		// Access svg to make this reactive
		void svg;
		tick().then(() => {
			const svgEl = containerEl?.querySelector("svg");
			if (!svgEl) return;
			if (!playing) {
				svgEl.pauseAnimations?.();
			} else {
				svgEl.unpauseAnimations?.();
			}
		});
	});

	function togglePlay() {
		const svgEl = containerEl?.querySelector("svg");
		if (!svgEl) return;
		if (playing) {
			svgEl.pauseAnimations?.();
		} else {
			svgEl.unpauseAnimations?.();
		}
		playing = !playing;
	}
</script>

<div class="preview-outer">
	<div class="svg-wrapper" bind:this={containerEl}>
		{@html svg}
	</div>

	{#if isAnimation}
		<div class="playback-bar">
			<button
				class="play-btn"
				onclick={togglePlay}
				aria-label={playing ? "Pause" : "Play"}
			>
				{#if playing}
					<!-- Pause icon -->
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="currentColor"
					>
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
					Pause
				{:else}
					<!-- Play icon -->
					<svg
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="currentColor"
					>
						<polygon points="5,3 19,12 5,21" />
					</svg>
					Play
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.preview-outer {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		min-height: 0;
	}

	.svg-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		background: #f0f0f0;
		border-radius: 8px 8px 0 0;
		border: 1px solid #ddd;
		border-bottom: none;
	}

	:global(.svg-wrapper svg) {
		width: 100%;
		height: 100%;
		display: block;
		overflow: hidden;
	}

	.playback-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: #1a1a1a;
		border: 1px solid #ddd;
		border-top: none;
		border-radius: 0 0 8px 8px;
	}

	.play-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		background: #333;
		color: white;
		border: 1px solid #555;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		width: auto;
	}

	.play-btn:hover {
		background: #555;
	}
</style>
