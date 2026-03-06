<script lang="ts">
	import { appState } from "$lib/state/appState.svelte";
	import { fade, fly } from "svelte/transition";

	let format = $state<
		"png" | "mov" | "gif" | "svg" | "jpeg" | "webp" | "webm" | "mp4"
	>("png");
	let isRendering = $state(false);
	let isExportingAssets = $state(false);
	let preset = $state("social-reels");
	let fps = $state(24);

	const presets: Record<
		string,
		{ name: string; w: number; h: number; category: string }
	> = {
		"social-reels": {
			name: "Instagram Reels / TikTok (9:16)",
			w: 1080,
			h: 1920,
			category: "Social",
		},
		"social-post": {
			name: "Instagram Post (4:5)",
			w: 1080,
			h: 1350,
			category: "Social",
		},
		"youtube-hd": {
			name: "YouTube HD (16:9)",
			w: 1920,
			h: 1080,
			category: "Video",
		},
		"cinematic-4k": {
			name: "Cinematic 4K (16:9)",
			w: 3840,
			h: 2160,
			category: "Video",
		},
		"print-poster": {
			name: "Print Poster (3:4)",
			w: 3000,
			h: 4000,
			category: "Print",
		},
		"print-square": {
			name: "Print Square (1:1)",
			w: 3000,
			h: 3000,
			category: "Print",
		},
		"custom-2k": {
			name: "Elite 2K (Square)",
			w: 2048,
			h: 2048,
			category: "Custom",
		},
	};

	async function handleRender() {
		isRendering = true;
		const p = presets[preset];
		try {
			await appState.renderComposition(format, {
				width: p.w,
				height: p.h,
				fps,
				duration: appState.playbackDuration,
			});
		} finally {
			isRendering = false;
		}
	}

	async function handleExportAssets() {
		isExportingAssets = true;
		try {
			await appState.exportOriginalAssets();
		} finally {
			isExportingAssets = false;
		}
	}
</script>

{#if appState.isExportDrawerOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="drawer-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={() => (appState.isExportDrawerOpen = false)}
	></div>

	<div class="export-drawer" transition:fly={{ x: 400, duration: 300 }}>
		<div class="drawer-header">
			<div class="title-group">
				<h3>Save & Export</h3>
				<p>Production-grade delivery suite. 🦾⚡</p>
			</div>
			<button
				class="close-btn"
				onclick={() => (appState.isExportDrawerOpen = false)}
				aria-label="Close drawer"
			>
				&times;
			</button>
		</div>

		<div class="drawer-content">
			<section class="export-section">
				<h4>1. Original Assets</h4>
				<p class="section-desc">
					Download all raw files in a ZIP bundle.
				</p>
				<button
					class="secondary-btn"
					onclick={handleExportAssets}
					disabled={isExportingAssets}
				>
					{#if isExportingAssets}
						<span class="loader small"></span> Bundling...
					{:else}
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="currentColor"
						>
							<path
								d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
							/>
						</svg>
						Export Original Assets (ZIP)
					{/if}
				</button>
			</section>

			<hr class="divider" />

			<section class="export-section">
				<h4>2. Composition Render</h4>
				<p class="section-desc">
					Generate a single-file asset from layers.
				</p>

				<div class="options-grid">
					<div class="option full">
						<label for="preset">Industry Preset</label>
						<select id="preset" bind:value={preset}>
							{#each Object.entries(presets) as [id, data]}
								<option value={id}
									>{data.category}: {data.name}</option
								>
							{/each}
						</select>
					</div>

					<div class="option">
						<label for="format">Output Format</label>
						<select id="format" bind:value={format}>
							<option value="png">Static Image (PNG)</option>
							<option value="jpeg">Photo/Print (JPEG)</option>
							<option value="webp">Web Optimized (WebP)</option>
							<option value="svg">Vector Graphic (SVG)</option>
							<option value="mov">Professional Video (MOV)</option
							>
							<option value="mp4">Universal Video (MP4)</option>
							<option value="webm"
								>Web Optimized Video (WebM)</option
							>
							<option value="gif">Animated GIF</option>
						</select>
					</div>

					{#if format === "mov" || format === "mp4" || format === "gif" || format === "webm"}
						<div class="option" transition:fade>
							<label for="fps">FPS</label>
							<input
								id="fps"
								type="number"
								bind:value={fps}
								min="1"
								max="60"
							/>
						</div>
						<div class="option" transition:fade>
							<label for="duration">Duration (sec)</label>
							<input
								id="duration"
								type="number"
								bind:value={appState.playbackDuration}
								min="1"
								max={appState.MAX_DURATION}
							/>
						</div>
					{/if}
				</div>

				<button
					class="render-btn"
					class:rendering={isRendering}
					onclick={handleRender}
					disabled={isRendering}
				>
					{#if isRendering}
						<span class="loader"></span>
						<div class="render-info">
							<span
								>{appState.renderingStatus ||
									"Preparing..."}</span
							>
						</div>
					{:else}
						🚀 Render Master Asset
					{/if}
				</button>
			</section>
		</div>
	</div>
{/if}

<style>
	.drawer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 2000;
	}

	.export-drawer {
		position: fixed;
		top: 0;
		right: 0;
		width: 400px;
		height: 100vh;
		background: #002244;
		border-left: 2px solid #003153;
		box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
		z-index: 2001;
		display: flex;
		flex-direction: column;
	}

	.drawer-header {
		padding: 1.5rem;
		background: #001a33;
		border-bottom: 1px solid #003153;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.title-group h3 {
		margin: 0;
		color: #4dff00;
		font-size: 1.25rem;
		letter-spacing: 0.02em;
	}

	.title-group p {
		margin: 0.2rem 0 0 0;
		font-size: 0.8rem;
		color: #a0aec0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: #a0aec0;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		margin-top: -0.5rem;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: white;
	}

	.drawer-content {
		padding: 1.5rem;
		flex: 1;
		overflow-y: auto;
	}

	.export-section {
		margin-bottom: 2rem;
	}

	.export-section h4 {
		margin: 0 0 0.5rem 0;
		color: #f7fafc;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.section-desc {
		font-size: 0.85rem;
		color: #a0aec0;
		margin-bottom: 1rem;
	}

	.divider {
		border: 0;
		border-top: 1px solid #003153;
		margin: 1.5rem 0;
	}

	.options-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.option {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.option.full {
		grid-column: span 2;
	}

	label {
		font-size: 0.7rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
	}

	select,
	input {
		background: #1f2328;
		border: 1px solid #003153;
		color: white;
		padding: 0.6rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.render-btn,
	.secondary-btn {
		width: 100%;
		padding: 0.85rem;
		border: none;
		border-radius: 8px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.render-btn {
		background: #228b22;
		color: white;
	}

	.render-btn:hover:not(:disabled) {
		background: #4dff00;
		color: #002244;
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(77, 255, 0, 0.4);
	}

	.secondary-btn {
		background: #003153;
		color: #a0aec0;
		border: 1px solid #004d80;
	}

	.secondary-btn:hover:not(:disabled) {
		background: #004d80;
		color: white;
		border-color: #4dff00;
	}

	.render-btn.rendering {
		background: #003153;
		cursor: wait;
	}

	.loader {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loader.small {
		width: 14px;
		height: 14px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
