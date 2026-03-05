<script lang="ts">
	import { generators } from "$lib/core/registry";
	import { appState } from "$lib/state/appState.svelte";
	import Preview from "$lib/ui/Preview.svelte";
	import ParamPanel from "$lib/ui/ParamPanel.svelte";
	import PresetManager from "$lib/ui/PresetManager.svelte";
	import LayerPanel from "$lib/ui/LayerPanel.svelte";

	import { copyToClipboard } from "$lib/utils/export";
	import { logExport } from "$lib/services/telemetry.svelte";
	import GeneratorGallery from "$lib/ui/GeneratorGallery.svelte";

	let searchQuery = $state("");
	let selectedCategory = $state("All");
	let variants = $state<{ layers: any[]; svg: string }[]>([]);
	let showGallery = $state(false);

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
			"Shareable URL copied to clipboard! Anyone with this link can view your composition.",
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

		if (e.key.toLowerCase() === "r") {
			appState.randomizeSeed();
		} else if (e.key.toLowerCase() === "n") {
			showGallery = true;
		} else if (e.key.toLowerCase() === "v") {
			handleGenerateVariants();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
	<header>
		<h1>SumoSized SVG Generator</h1>
		<div class="header-actions">
			<button class="header-btn" onclick={() => (showGallery = true)}
				>+ New Layer</button
			>
			<button class="header-btn share" onclick={handleShare}
				>Share URL</button
			>
		</div>
	</header>

	<div class="layout">
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

{#if showGallery}
	<div class="modal-overlay" onclick={() => (showGallery = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<GeneratorGallery onSelect={() => (showGallery = false)} />
		</div>
	</div>
{/if}

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
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			sans-serif;
		background: #fafafa;
		color: #333;
	}

	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	header {
		flex-shrink: 0;
		background: #1e1e2e;
		color: white;
		padding: 0.6rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
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
		background: var(--accent-primary, #6366f1);
		border-color: transparent;
	}

	h1 {
		margin: 0;
		font-size: 1.25rem;
		letter-spacing: 0.03em;
	}

	/* Three-column layout; takes remaining height */
	.layout {
		display: grid;
		grid-template-columns: 220px 1fr 280px;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	/* ── Sidebar ─────────────────────────────────── */
	.sidebar {
		border-right: 1px solid #ddd;
		background: #fff;
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
		border: 1px solid #ddd;
		border-radius: 4px;
		width: 100%;
		font-size: 0.85rem;
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
		background: #f4f4f4;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.generator-list button:hover {
		background: #eee;
	}

	.generator-list button.active {
		background: #1e1e2e;
		color: white;
		border-color: #1e1e2e;
	}

	.generator-list button.active .gen-cat {
		color: #aaa;
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
		color: #555;
		margin: 0 0 0.5rem 0;
	}

	/* ── Preview ─────────────────────────────────── */
	.main-content {
		min-height: 0;
		overflow: hidden;
		padding: 0.75rem;
		background: #f5f5f7;
		display: flex;
		flex-direction: column;
	}

	/* ── Controls ────────────────────────────────── */
	.controls {
		border-left: 1px solid #ddd;
		background: #fff;
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
		border-top: 1px solid #eee;
		font-size: 0.85rem;
		color: #555;
	}

	.seed-btn {
		padding: 0.3rem 0.75rem;
		font-size: 0.8rem;
		background: #f0f0f0;
		border: 1px solid #ccc;
		border-radius: 4px;
		cursor: pointer;
		width: auto;
	}

	.seed-btn:hover {
		background: #e0e0e0;
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
		background: white;
		padding: 0.75rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
		margin-bottom: 1rem;
	}

	.action-group {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		background: #fff;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: #f4f4f4;
	}

	.action-btn.primary {
		background: #1e1e2e;
		color: white;
		border-color: #1e1e2e;
	}

	.action-btn.primary:hover {
		background: #2a2a3e;
	}

	.action-btn.secondary {
		border-color: #1e1e2e;
		color: #1e1e2e;
	}

	.variants-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		flex-shrink: 0;
		height: 120px;
	}

	.variant-card {
		background: white;
		border: 1px solid #ddd;
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
		border-color: #1e1e2e;
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
