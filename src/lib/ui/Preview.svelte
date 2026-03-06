<script lang="ts">
	import { tick } from "svelte";
	import { appState } from "../state/appState.svelte";
	import DrawingSurface from "./DrawingSurface.svelte";
	import CanvasInteract from "./CanvasInteract.svelte";

	interface Props {
		svg: string;
		isAnimation?: boolean;
	}

	let { svg, isAnimation = false }: Props = $props();

	let containerEl: HTMLDivElement;
	let playing = $state(true);

	// Sync SVG playhead with appState.currentTime
	$effect(() => {
		const time = appState.currentTime;
		tick().then(() => {
			const svgEl = containerEl?.querySelector("svg");
			if (!svgEl) return;
			// Only set if not playing, or if manually scrubbed
			// For simplicity in v1, we always set it when state changes
			try {
				svgEl.setCurrentTime(time);
			} catch (e) {
				// Some browsers might be picky about SMIL state
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

	function handleTimelineInput(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		appState.setCurrentTime(val);
		if (playing) {
			const svgEl = containerEl?.querySelector("svg");
			svgEl?.pauseAnimations?.();
			playing = false;
		}
	}

	let aspectRatioStyle = $derived(
		`--aspect-ratio: ${appState.documentAspectRatio.replace(":", "/")}`,
	);
</script>

<div class="preview-outer">
	<div class="svg-wrapper" bind:this={containerEl} style={aspectRatioStyle}>
		{@html svg}
		{#if ["pencil", "brush", "eraser", "line", "rect", "ellipse", "text"].includes(appState.activeTool)}
			<DrawingSurface />
		{/if}
		{#if ["move", "crop", "pointer", "transform"].includes(appState.activeTool)}
			<CanvasInteract />
		{/if}
	</div>

	{#if isAnimation}
		<div class="playback-bar">
			<button
				class="play-btn"
				onclick={togglePlay}
				aria-label={playing ? "Pause" : "Play"}
			>
				{#if playing}
					<svg
						viewBox="0 0 24 24"
						width="18"
						height="18"
						fill="currentColor"
					>
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
				{:else}
					<svg
						viewBox="0 0 24 24"
						width="18"
						height="18"
						fill="currentColor"
					>
						<polygon points="5,3 19,12 5,21" />
					</svg>
				{/if}
			</button>

			<div class="timeline-container">
				<span class="time-display"
					>{appState.currentTime.toFixed(2)}s</span
				>
				<input
					type="range"
					class="timeline-slider"
					min="0"
					max={appState.playbackDuration}
					step="0.01"
					value={appState.currentTime}
					oninput={handleTimelineInput}
				/>
				<span class="time-display">{appState.playbackDuration}s</span>
			</div>
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
		background: #1f2328; /* Charcoal Blue */
		border-radius: 8px 8px 0 0;
		border: 1px solid #003153; /* Prussian Blue */
		border-bottom: none;
		position: relative;
		/* Aspect Ratio Fitting */
		aspect-ratio: var(--aspect-ratio, 1/1);
		max-width: 100%;
		max-height: 100%;
		margin: auto;
	}

	:global(.svg-wrapper > svg:first-child) {
		width: 100%;
		height: 100%;
		display: block;
		overflow: hidden;
		/* 2026 GPU Promotion: Ensure composition is handled by the compositor during active transforms */
		will-change: transform;
	}

	/* Overlay SVGs (DrawingSurface, CanvasInteract) */
	:global(.svg-wrapper > svg:not(:first-child)) {
		position: absolute !important;
		top: 0 !important;
		left: 0 !important;
		width: 100% !important;
		height: 100% !important;
		z-index: 50 !important;
		touch-action: none;
	}

	.playback-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.6rem 1.25rem;
		background: #001a33; /* Darker navy */
		border: 1px solid #003153;
		border-top: none;
		border-radius: 0 0 8px 8px;
	}

	.timeline-container {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.time-display {
		font-family: "JetBrains Mono", monospace;
		font-size: 0.75rem;
		color: #4dff00;
		min-width: 45px;
	}

	.timeline-slider {
		flex: 1;
		appearance: none;
		height: 6px;
		background: #003153;
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.timeline-slider::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		background: #4dff00;
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(77, 255, 0, 0.5);
		transition: transform 0.1s;
	}

	.timeline-slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}

	.play-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: #003153; /* Prussian Blue */
		color: #4dff00;
		border: 1px solid #082567;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s;
	}

	.play-btn:hover {
		background: #082567;
		border-color: #4dff00;
		transform: scale(1.1);
		box-shadow: 0 0 15px rgba(77, 255, 0, 0.3);
	}
</style>
