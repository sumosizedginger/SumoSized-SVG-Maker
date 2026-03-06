<script lang="ts">
	import { generators, getGenerator } from "$lib/engine/core/registry";
	import { appState } from "$lib/state/appState.svelte";
	import {
		STARTER_TEMPLATES,
		type StarterTemplate,
	} from "$lib/engine/core/starters";

	let { onSelect } = $props<{ onSelect: () => void }>();
	let activeTab = $state<"generators" | "templates">("generators");

	function addGenerator(id: string) {
		appState.addLayer(id);
		onSelect();
	}

	function applyTemplate(starter: StarterTemplate) {
		appState.applyStarter(starter);
		onSelect();
	}

	function renderTemplatePreview(starter: StarterTemplate) {
		let inner = "";
		starter.layers.forEach((l) => {
			const gen = getGenerator(l.generatorId!);
			if (gen) {
				const svg = gen.render(
					{ ...gen.defaultParams, ...l.params },
					42,
					{ x: 0, y: 0, w: 100, h: 100 },
				);
				const blend = `mix-blend-mode: ${l.blendMode || "normal"}; opacity: ${l.opacity ?? 1.0};`;
				inner += `<g style="${blend}">${svg}</g>`;
			}
		});
		return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${inner}</svg>`;
	}
</script>

<div class="gallery-container">
	<div class="gallery-header">
		<div class="header-main">
			<h2>Gallery</h2>
			<div class="tabs">
				<button
					class:active={activeTab === "generators"}
					onclick={() => (activeTab = "generators")}
					>Generators</button
				>
				<button
					class:active={activeTab === "templates"}
					onclick={() => (activeTab = "templates")}>Templates</button
				>
			</div>
		</div>
		<p>
			{activeTab === "generators"
				? "Select a mathematical engine to add as a new layer."
				: "Choose a pre-designed aesthetic stack to start fresh."}
		</p>
	</div>

	{#if activeTab === "generators"}
		<div class="gallery-grid">
			{#each generators as gen}
				<button class="gen-card" onclick={() => addGenerator(gen.id)}>
					<div class="thumb">
						{@html gen.render(gen.defaultParams, 42, {
							x: 0,
							y: 0,
							w: 100,
							h: 100,
						})}
					</div>
					<div class="info">
						<span class="name">{gen.name}</span>
						<span class="category">{gen.category}</span>
					</div>
				</button>
			{/each}
		</div>
	{:else}
		<div class="gallery-grid">
			{#each STARTER_TEMPLATES as starter}
				<button
					class="gen-card template"
					onclick={() => applyTemplate(starter)}
				>
					<div class="thumb">
						{@html renderTemplatePreview(starter)}
					</div>
					<div class="info">
						<span class="name">{starter.name}</span>
						<span class="category">Template</span>
						<p class="tpl-desc">{starter.description}</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gallery-container {
		padding: 1.5rem;
		background: #002244; /* Seahawks Navy */
		border: 1px solid #003153; /* Prussian Blue */
		border-radius: 12px;
		max-width: 900px;
		width: 90vw;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
		color: #e2e8f0;
	}

	.gallery-header {
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #003153;
		padding-bottom: 1rem;
	}

	.header-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.tabs {
		display: flex;
		background: #082567; /* Dark Sapphire */
		border: 1px solid #003153;
		padding: 0.25rem;
		border-radius: 8px;
		gap: 0.25rem;
	}

	.tabs button {
		padding: 0.4rem 1rem;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		background: transparent;
		color: #a0aec0;
		transition: all 0.2s;
	}

	.tabs button.active {
		background: #003153; /* Prussian Blue */
		color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	h2 {
		margin: 0;
		font-size: 1.5rem;
		color: white;
	}

	p {
		margin: 0.5rem 0 0;
		color: #a0aec0;
		font-size: 0.9rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.gen-card {
		background: #002147; /* Oxford Blue */
		border: 1px solid #003153;
		border-radius: 8px;
		padding: 0.5rem;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gen-card:hover {
		border-color: #228b22; /* Forest Green */
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
		background: #003153;
	}

	.thumb {
		aspect-ratio: 1;
		background: #1f2328; /* Charcoal Blue */
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.thumb :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}

	.info {
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: 600;
		font-size: 0.9rem;
		color: white;
	}

	.category {
		font-size: 0.75rem;
		color: #a0aec0;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.tpl-desc {
		font-size: 0.75rem;
		color: #718096;
		margin: 0.25rem 0 0;
		line-height: normal;
	}

	.gen-card.template {
		min-height: 220px;
	}
</style>
