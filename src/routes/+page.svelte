<script lang="ts">
	import { base } from "$app/paths";
	import { generators } from "$lib/engine/core/registry";
	import { appState } from "$lib/state/appState.svelte";
	import Preview from "$lib/ui/Preview.svelte";
	import ParamPanel from "$lib/ui/ParamPanel.svelte";
	import PresetManager from "$lib/ui/PresetManager.svelte";
	import LayerPanel from "$lib/ui/LayerPanel.svelte";
	import ToolPalette from "$lib/ui/ToolPalette.svelte";

	import { copyToClipboard } from "$lib/utils/export";
	import { logExport } from "$lib/services/telemetry.svelte";
	import GeneratorGallery from "$lib/ui/GeneratorGallery.svelte";
	import ExportPanel from "$lib/ui/ExportPanel.svelte";

	let searchQuery = $state("");
	let selectedCategory = $state("All");
	let variants = $state<{ layers: any[]; svg: string }[]>([]);

	const categories = ["All", ...new Set(generators.map((g) => g.category))];

	let filteredGenerators = $derived(
		generators.filter((g) => {
			const matchesSearch =
				g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				g.tags.some((t) =>
					t.toLowerCase().includes(searchQuery.toLowerCase()),
				);
			const matchesCategory =
				selectedCategory === "All" || g.category === selectedCategory;
			return matchesSearch && matchesCategory;
		}),
	);

	let isAnimation = $derived(
		appState.activeGenerator?.category === "Animations",
	);

	function handleParamUpdate(key: string, value: any) {
		appState.updateParam(key, value);
	}

	function handleGenerateVariants() {
		variants = appState.generateVariants(4);
	}

	function applyVariant(variant: { layers: any[] }) {
		appState.layers = JSON.parse(JSON.stringify(variant.layers));
		appState.saveState();
		variants = []; // clear variants after applying
	}

	async function handleExport() {
		const svg = appState.renderedSvg;
		const id = appState.activeGenerator?.id || "sumo-composition";

		logExport(id, "copy");

		const success = await copyToClipboard(svg);
		if (success) {
			alert(
				"SVG code copied to clipboard!\n\nTo save it:\n1. Open Notepad (or any text editor)\n2. Paste the code\n3. Save the file as 'my-art.svg'",
			);
		}
	}

	function handleShare() {
		const url = appState.generateShareUrl();
		copyToClipboard(url);
		alert(
			"Shareable URL copied to clipboard!\n\nIt is also synced to your browser address bar.",
		);
	}

	// Hotkeys
	function handleKeydown(e: KeyboardEvent) {
		// Ignore if typing in an input
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement ||
			e.target instanceof HTMLSelectElement
		)
			return;

		const key = e.key.toLowerCase();

		// Tool switching hotkeys
		const toolKeys: Record<string, any> = {
			v: "pointer",
			g: "move",
			s: "transform",
			c: "crop",
			p: "pencil",
			b: "brush",
			e: "eraser",
			l: "line",
			u: "rect",
			o: "ellipse",
			t: "text",
		};

		if (toolKeys[key]) {
			appState.activeTool = toolKeys[key];
			// Auto-create drawing layer for draw tools
			const drawTools = [
				"pencil",
				"brush",
				"eraser",
				"line",
				"rect",
				"ellipse",
				"text",
			];
			if (
				drawTools.includes(toolKeys[key]) &&
				appState.activeLayer?.generatorId !== "free-draw"
			) {
				appState.addLayer("free-draw");
			}
			return;
		}

		if (key === "r" && !e.ctrlKey) {
			appState.randomizeSeed();
		} else if (key === "n") {
			appState.isGalleryOpen = true;
		} else if (e.ctrlKey && key === "z") {
			e.preventDefault();
			appState.undo();
		} else if (e.ctrlKey && (key === "y" || (e.shiftKey && key === "z"))) {
			e.preventDefault();
			appState.redo();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
	<header>
		<img
			src="{base}/logo.svg"
			alt="SumoSized SVG Maker"
			class="header-logo"
		/>
		<h1 class="sr-only">SumoSized SVG Generator</h1>
		<div class="header-actions">
			<button
				class="header-btn gallery-btn"
				onclick={() => (appState.isGalleryOpen = true)}
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					><rect x="3" y="3" width="7" height="7"></rect><rect
						x="14"
						y="3"
						width="7"
						height="7"
					></rect><rect x="14" y="14" width="7" height="7"
					></rect><rect x="3" y="14" width="7" height="7"></rect></svg
				>
				Open Gallery
			</button>
			<button class="header-btn share" onclick={handleShare}
				>Copy Share Link</button
			>
		</div>
	</header>

	<div class="layout">
		<ToolPalette />
		<!-- Sidebar: generator list + presets -->
		<aside class="sidebar">
			<div class="sidebar-inner">
				<div class="sidebar-section">
					<h2>Generators</h2>
					<div class="filters">
						<input
							type="text"
							placeholder="Search..."
							bind:value={searchQuery}
							class="search-input"
						/>
						<select
							bind:value={selectedCategory}
							class="category-select"
						>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
					<ul class="generator-list">
						{#each filteredGenerators as gen}
							<li>
								<button
									class:active={appState.activeGenerator
										?.id === gen.id}
									onclick={() => {
										appState.setGenerator(gen.id);
										variants = [];
									}}
								>
									<span class="gen-name">{gen.name}</span>
									<span class="gen-cat">{gen.category}</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>

				<div class="sidebar-section presets-section">
					<h2>Presets</h2>
					<PresetManager />
				</div>
			</div>
		</aside>

		<!-- Main preview -->
		<section class="main-content">
			<div class="preview-container">
				<Preview svg={appState.renderedSvg} {isAnimation} />
			</div>

			<div class="actions-panel">
				<div class="action-group" style="align-items: center;">
					<button
						class="action-btn primary"
						style="font-size: 1rem; padding: 0.6rem 1.2rem;"
						onclick={handleExport}
					>
						Copy SVG Code
					</button>
					<span
						style="font-size: 0.75rem; color: #666; max-width: 200px; line-height: 1.2;"
					>
						(Paste into a text editor and save as .svg)
					</span>
				</div>
				<div class="action-group">
					<button
						class="action-btn secondary"
						onclick={handleGenerateVariants}
					>
						Generate Variants
					</button>
				</div>
			</div>

			{#if variants.length > 0}
				<div class="variants-grid">
					{#each variants as variant}
						<button
							class="variant-card"
							onclick={() => applyVariant(variant)}
						>
							{@html variant.svg}
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Right: layers + params + seed -->
		<aside class="controls">
			<div class="controls-inner">
				<div class="layers-section">
					<h2>Layers</h2>
					<div class="layers-scroll">
						<LayerPanel />
					</div>
				</div>

				{#if appState.activeLayer}
					<div class="params-section">
						<h2>
							Parameters <span class="layer-hint"
								>({appState.activeLayer.name})</span
							>
						</h2>
						<div class="params-scroll">
							<ParamPanel
								generatorId={appState.activeLayer.generatorId}
								params={appState.activeGenerator?.params || []}
								values={appState.activeLayer.params}
								onUpdate={handleParamUpdate}
							/>
						</div>
						<div class="seed-control">
							<span>Seed: {appState.activeLayer.seed}</span>
							<button
								class="seed-btn"
								onclick={() => appState.randomizeSeed()}
								>Randomize</button
							>
						</div>
					</div>
				{/if}
			</div>
		</aside>
	</div>
</main>

{#if appState.isGalleryOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (appState.isGalleryOpen = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<GeneratorGallery
				onSelect={() => (appState.isGalleryOpen = false)}
			/>
		</div>
	</div>
{/if}

<ExportPanel />

<style>
	.layers-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.layers-scroll {
		overflow-y: auto;
		flex: 1;
		padding-right: 0.2rem;
	}

	.params-section {
		display: flex;
		flex-direction: column;
		flex: 2;
		min-height: 0;
		border-top: 1px solid #ddd;
		padding-top: 0.75rem;
	}

	.layer-hint {
		font-size: 0.7rem;
		font-weight: normal;
		color: #888;
		text-transform: none;
	}

	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		overflow: hidden;
		font-family:
			-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		background: #1f2328; /* Charcoal Blue */
		color: #e2e8f0;
	}

	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	header {
		flex-shrink: 0;
		background: #082567; /* Dark Sapphire */
		color: white;
		padding: 0.6rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #4dff00; /* Action Green accent */
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.header-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.header-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.header-btn.share {
		background: #228b22; /* Forest Green */
		border-color: transparent;
		color: white;
	}

	.header-btn.share:hover {
		background: #4dff00; /* Action Green */
		color: #002244;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
		letter-spacing: 0.03em;
	}

	.header-logo {
		height: 54px;
		width: auto;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Four-column layout; takes remaining height */
	.layout {
		display: grid;
		grid-template-columns: 48px 220px 1fr 280px;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.sidebar {
		border-right: 1px solid #002244;
		background: #002147; /* Oxford Blue */
		min-height: 0;
		overflow: hidden;
	}

	.sidebar-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow-y: auto;
		padding: 0.75rem;
		gap: 1rem;
	}

	.sidebar-section {
		flex-shrink: 0;
	}

	.presets-section {
		border-top: 1px solid #eee;
		padding-top: 0.75rem;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.6rem;
	}

	.search-input,
	.category-select {
		padding: 0.45rem 0.6rem;
		border: 1px solid #003153; /* Prussian Blue */
		background: #1f2328; /* Charcoal Blue */
		color: white;
		border-radius: 4px;
		width: 100%;
		font-size: 0.85rem;
	}

	.search-input::placeholder {
		color: #888;
	}

	.generator-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	/* Override the global button style in sidebar only */
	.generator-list button {
		width: 100%;
		padding: 0.45rem 0.6rem;
		text-align: left;
		background: #002244; /* Seahawks Navy */
		border: 1px solid #003153; /* Prussian Blue */
		color: #e2e8f0;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.generator-list button:hover {
		background: #003153; /* Prussian Blue */
		border-color: #228b22; /* Forest Green */
	}

	.generator-list button.active {
		background: #191970; /* Midnight Blue */
		color: white;
		border-color: #4dff00; /* Action Green */
		box-shadow: 0 0 0 1px #4dff00;
	}

	.generator-list button.active .gen-cat {
		color: #a0aec0;
	}

	.gen-name {
		font-weight: 600;
		font-size: 0.85rem;
	}
	.gen-cat {
		font-size: 0.72rem;
		color: #888;
	}

	h2 {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #a0aec0;
		margin: 0 0 0.5rem 0;
	}

	/* ── Preview ─────────────────────────────────── */
	.main-content {
		min-height: 0;
		overflow: hidden;
		padding: 0.75rem;
		background: #1f2328; /* Charcoal Blue */
		display: flex;
		flex-direction: column;
	}

	/* ── Controls ────────────────────────────────── */
	.controls {
		border-left: 1px solid #002244;
		background: #002147; /* Oxford Blue */
		min-height: 0;
		overflow: hidden;
	}

	.controls-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 0.75rem;
		gap: 0.5rem;
	}

	.params-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}

	.seed-control {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-top: 1px solid #003153;
		font-size: 0.85rem;
		color: #a0aec0;
	}

	.seed-btn {
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
		background: #003153;
		color: white;
		border: 1px solid #082567;
		border-radius: 4px;
		cursor: pointer;
		width: auto;
	}

	.seed-btn:hover {
		background: #191970;
		border-color: #228b22;
	}

	.preview-container {
		flex: 1;
		min-height: 0;
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.actions-panel {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
		background: #082567; /* Dark Sapphire */
		padding: 0.75rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		margin-bottom: 1rem;
		border: 1px solid #191970;
	}

	.action-group {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #003153;
		background: #002244;
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: #191970;
		border-color: #228b22;
	}

	.action-btn.primary {
		background: #002147;
		color: white;
		border-color: #4dff00;
	}

	.action-btn.primary:hover {
		background: #003153;
		box-shadow: 0 0 8px rgba(77, 255, 0, 0.4);
	}

	.action-btn.secondary {
		border-color: #228b22;
		color: #4dff00;
	}

	.variants-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		flex-shrink: 0;
		height: 120px;
	}

	.variant-card {
		background: #002244;
		border: 1px solid #003153;
		border-radius: 8px;
		padding: 0.25rem;
		cursor: pointer;
		transition:
			transform 0.1s,
			border-color 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* Style the raw SVG string injected via @html */
	:global(.variant-card svg) {
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}

	.variant-card:hover {
		transform: scale(1.02);
		border-color: #4dff00;
		box-shadow: 0 0 10px rgba(77, 255, 0, 0.2);
	}

	/* Modal Overlay */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-content {
		max-width: 90%;
		max-height: 90%;
	}
</style>
