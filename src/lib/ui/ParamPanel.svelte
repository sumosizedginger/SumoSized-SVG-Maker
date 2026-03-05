<script lang="ts">
	import type { ParamDefinition } from "../core/types";
	import { palettes } from "../core/palettes";
	import { appState } from "../state/appState.svelte";

	interface Props {
		generatorId: string;
		params: ParamDefinition[];
		values: Record<string, any>;
		onUpdate: (key: string, value: any) => void;
	}

	let { generatorId, params, values, onUpdate }: Props = $props();

	// Group params by group label and apply filtering
	let groupedParams = $derived.by(() => {
		const groups: Record<string, ParamDefinition[]> = {};

		// Filter based on simpleMode
		const visibleParams = params.filter(
			(p) => !appState.simpleMode || !p.advanced,
		);

		visibleParams.forEach((p) => {
			const g = p.group || "General";
			if (!groups[g]) groups[g] = [];
			groups[g].push(p);
		});
		return groups;
	});

	const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

	function handleChange(name: string, event: Event) {
		const target = event.target as HTMLInputElement | HTMLSelectElement;
		let value: any = target.value;

		if (target.type === "number" || target.type === "range") {
			value = parseFloat(target.value);
		} else if (target.type === "checkbox") {
			value = (target as HTMLInputElement).checked;
		} else if (target.type === "color") {
			// Defensive: ensure we always get a valid hex color.
			// Some Chromium forks (e.g. Comet) can return empty/invalid
			// when Svelte 5 strips the value HTML attribute.
			if (!value || !HEX_COLOR_RE.test(value)) {
				const paramDef = params.find((p) => p.name === name);
				value = paramDef?.default ?? "#000000";
			}
			// Force-sync the HTML attribute so browsers that read
			// the attribute (not just the DOM property) stay in sync.
			target.setAttribute("value", value);
		}

		onUpdate(name, value);
	}

	/**
	 * Svelte action: force-set the `value` HTML attribute on a color input.
	 * Svelte 5 only sets the DOM property, which some browsers (e.g. Comet)
	 * don't read back correctly. This ensures the attribute is always present.
	 */
	function forceColorAttr(node: HTMLInputElement, initialValue: string) {
		const val =
			initialValue && HEX_COLOR_RE.test(initialValue)
				? initialValue
				: "#000000";
		node.setAttribute("value", val);
		node.value = val;

		return {
			update(newValue: string) {
				const v =
					newValue && HEX_COLOR_RE.test(newValue)
						? newValue
						: "#000000";
				node.setAttribute("value", v);
				node.value = v;
			},
		};
	}
</script>

<!-- Key on generatorId so all inputs fully remount when the generator changes -->
{#key generatorId}
	<div class="param-panel">
		<div class="panel-header">
			<div class="title-row">
				<div class="mode-toggle">
					<button
						class="toggle-btn"
						class:active={!appState.simpleMode}
						onclick={() =>
							(appState.simpleMode = !appState.simpleMode)}
						title="Toggle Advanced Controls"
					>
						{appState.simpleMode
							? "Show Advanced"
							: "Hide Advanced"}
					</button>
					<button
						class="random-btn"
						onclick={() => appState.randomizeSeed()}
						title="New Seed"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>

		{#each Object.entries(groupedParams) as [groupName, groupItems]}
			<div class="param-group">
				<h3>{groupName}</h3>
				{#each groupItems as param}
					<div class="param-field">
						<label for={param.name}>{param.label}</label>

						{#if param.type === "number" || param.type === "integer"}
							<div class="number-input">
								<input
									type="range"
									id={param.name}
									min={param.min}
									max={param.max}
									step={param.step}
									value={values[param.name] ?? param.default}
									oninput={(e) => handleChange(param.name, e)}
								/>
								<input
									type="number"
									min={param.min}
									max={param.max}
									step={param.step}
									value={values[param.name] ?? param.default}
									oninput={(e) => handleChange(param.name, e)}
								/>
							</div>
						{:else if param.type === "color"}
							<input
								type="color"
								id={param.name}
								use:forceColorAttr={values[param.name] ??
									param.default}
								oninput={(e) => handleChange(param.name, e)}
							/>
						{:else if param.type === "boolean"}
							<input
								type="checkbox"
								id={param.name}
								checked={values[param.name] ?? param.default}
								onchange={(e) => handleChange(param.name, e)}
							/>
						{:else if param.type === "select" || param.type === "palette"}
							<select
								id={param.name}
								value={values[param.name] ?? param.default}
								onchange={(e) => handleChange(param.name, e)}
							>
								{#if param.type === "palette"}
									{#each palettes as pal}
										<option value={pal.id}
											>{pal.name}</option
										>
									{/each}
								{:else}
									{#each param.options || [] as option}
										<option value={option.value}
											>{option.label}</option
										>
									{/each}
								{/if}
							</select>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/key}

<style>
	.param-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.param-group {
		border: 1px solid #eee;
		padding: 0.75rem;
		border-radius: 8px;
		background: #fafafa;
	}

	h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.4rem;
	}

	.panel-header {
		margin-bottom: 1rem;
	}

	.title-row {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 0.5rem;
	}

	.mode-toggle {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.toggle-btn {
		background: #f0f0f0;
		border: 1px solid #ddd;
		color: #666;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-btn:hover {
		background: #e0e0e0;
		color: #333;
	}

	.toggle-btn.active {
		background: #6366f1;
		color: white;
		border-color: transparent;
	}

	.random-btn {
		background: none;
		border: none;
		color: #666;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}

	.random-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #333;
	}

	.param-field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-bottom: 0.75rem;
	}

	.param-field:last-child {
		margin-bottom: 0;
	}

	label {
		font-weight: 600;
		font-size: 0.85rem;
	}

	.number-input {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	input[type="range"] {
		flex: 1;
	}

	input[type="number"] {
		width: 60px;
	}

	select,
	input[type="color"] {
		width: 100%;
		padding: 0.4rem;
		border-radius: 4px;
		border: 1px solid #ccc;
		box-sizing: border-box;
	}

	input[type="color"] {
		height: 36px;
		padding: 2px 4px;
		cursor: pointer;
	}
</style>
