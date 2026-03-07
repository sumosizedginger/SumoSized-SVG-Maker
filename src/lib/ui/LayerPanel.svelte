<script lang="ts">
	import { appState } from "$lib/state/appState.svelte";
	import type { BlendMode } from "$lib/engine/core/types";
	import { filterDefinitions } from "$lib/engine/generators/filters";

	// Reverse layers so top is first (visual representation like Photoshop)
	let displayLayers = $derived([...appState.layers].reverse());

	let isDraggingId = $state<string | null>(null);

	const blendModes: BlendMode[] = [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity",
	];

	function handleDragStart(e: DragEvent, id: string) {
		// Prevent dragging if the user is interacting with an input, select, or button
		const target = e.target as HTMLElement;
		if (
			target.tagName === "INPUT" ||
			target.tagName === "SELECT" ||
			target.tagName === "BUTTON" ||
			target.closest("button")
		) {
			e.preventDefault();
			return;
		}

		if (e.dataTransfer) {
			e.dataTransfer.setData("text/plain", id);
			e.dataTransfer.effectAllowed = "move";
			isDraggingId = id;
		}
	}

	function handleDragEnd() {
		isDraggingId = null;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
	}

	function handleDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		const draggedId = e.dataTransfer?.getData("text/plain");
		if (!draggedId || draggedId === targetId) return;

		const currentLayers = [...appState.layers];
		const draggedIdx = currentLayers.findIndex((l) => l.id === draggedId);
		const targetIdx = currentLayers.findIndex((l) => l.id === targetId);

		if (draggedIdx !== -1 && targetIdx !== -1) {
			const [draggedLayer] = currentLayers.splice(draggedIdx, 1);
			currentLayers.splice(targetIdx, 0, draggedLayer);
			appState.layers = currentLayers;
			appState.saveState();
		}
	}
	async function handleImport() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".svg,.png,.apng,.jpg,.jpeg,.webp,.mp4,.webm";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			let url = "";
			let sourceType: "svg" | "image" | "video" = "image";

			if (file.name.toLowerCase().endsWith(".svg")) {
				url = await file.text();
				sourceType = "svg";
			} else if (
				file.name.toLowerCase().endsWith(".mp4") ||
				file.name.toLowerCase().endsWith(".webm")
			) {
				url = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.readAsDataURL(file);
				});
				sourceType = "video";
			} else {
				// PNG, JPG, etc.
				url = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.readAsDataURL(file);
				});
				sourceType = "image";
			}

			// Use unified-import for everything
			appState.addLayer("unified-import", {
				url,
				sourceType,
				name: file.name,
			});

			const newLayerId = appState.activeLayerId;

			let retries = 0;
			const attemptFit = () => {
				if (!newLayerId) return;
				const g = document.querySelector(
					`.layer-${newLayerId}`,
				) as SVGGElement | null;

				if (g && g.getBBox) {
					try {
						const b = g.getBBox();
						if (b.width > 2 && b.height > 2) {
							appState.fitLayerToCanvas(newLayerId);
							return;
						}
					} catch (err) {}
				}

				if (retries < 30) {
					retries++;
					requestAnimationFrame(attemptFit);
				}
			};
			requestAnimationFrame(attemptFit);
		};
		input.click();
	}
</script>

<div class="layer-panel">
	<div class="panel-actions">
		<button class="import-btn" onclick={handleImport}>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
				<path
					d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
				/>
			</svg>
			Import
		</button>
		<button
			class="export-assets-btn"
			onclick={() => (appState.isExportDrawerOpen = true)}
			title="Open Export & Save Hub"
		>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
				<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
			</svg>
			Export Assets
		</button>
		<div class="selection-actions">
			<button
				class="batch-btn"
				onclick={() => appState.toggleSelectAll(true)}
				title="Select All for Export"
			>
				Select All
			</button>
			<button
				class="batch-btn"
				onclick={() => appState.toggleSelectAll(false)}
				title="Deselect All"
			>
				Clear
			</button>
		</div>
	</div>

	<div class="document-settings">
		<label class="doc-label" for="ratio-select"
			>Aspect Ratio (Nano Standard)</label
		>
		<select
			id="ratio-select"
			name="ratio-select"
			class="ratio-select"
			value={appState.documentAspectRatio}
			onchange={(e) =>
				appState.setDocumentAspectRatio(e.currentTarget.value)}
		>
			<optgroup label="Standard">
				<option value="1:1">1:1 Square</option>
				<option value="4:3">4:3 TV</option>
				<option value="3:4">3:4 Tablet</option>
				<option value="16:9">16:9 HD</option>
				<option value="9:16">9:16 Reels/TikTok</option>
			</optgroup>
			<optgroup label="Photography">
				<option value="3:2">3:2 Classic</option>
				<option value="2:3">2:3 Portrait</option>
				<option value="5:4">5:4 Print</option>
				<option value="4:5">4:5 Vertical</option>
			</optgroup>
			<optgroup label="Cinematic & Extreme">
				<option value="21:9">21:9 Ultra-Wide</option>
				<option value="4:1">4:1 Panorama</option>
				<option value="1:4">1:4 Vertical Slice</option>
				<option value="8:1">8:1 Horizon</option>
				<option value="1:8">1:8 Skyscraper</option>
			</optgroup>
		</select>
	</div>
	{#if displayLayers.length === 0}
		<div class="empty-state">No layers. Click a generator to add one.</div>
	{:else}
		{#each displayLayers as layer (layer.id)}
			<div
				class="layer-item"
				class:active={appState.activeLayerId === layer.id}
				ondragover={handleDragOver}
				ondrop={(e) => handleDrop(e, layer.id)}
				role="presentation"
			>
				<div
					class="layer-header"
					draggable="true"
					role="button"
					tabindex="0"
					aria-expanded={appState.activeLayerId === layer.id}
					aria-label={`Toggle ${layer.name} controls`}
					ondragstart={(e) => handleDragStart(e, layer.id)}
					ondragend={handleDragEnd}
					onclick={(e) => {
						e.stopPropagation();
						if (appState.activeLayerId === layer.id) {
							appState.activeLayerId = null;
						} else {
							appState.activeLayerId = layer.id;
						}
					}}
					onkeydown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							if (appState.activeLayerId === layer.id) {
								appState.activeLayerId = null;
							} else {
								appState.activeLayerId = layer.id;
							}
						}
					}}
				>
					<div class="drag-handle">⋮⋮</div>
					<span class="chevron" aria-hidden="true">
						{appState.activeLayerId === layer.id ? "▾" : "▸"}
					</span>
					<input
						type="checkbox"
						id="visible-{layer.id}"
						name="visible-{layer.id}"
						title="Toggle Visibility"
						class="visibility-checkbox"
						checked={layer.visible}
						onclick={(e) => e.stopPropagation()}
						onchange={(e) =>
							appState.updateLayer(layer.id, {
								visible: e.currentTarget.checked,
							})}
					/>
					<input
						type="checkbox"
						id="selected-{layer.id}"
						name="selected-{layer.id}"
						title="Select for Export (Elite Choice)"
						class="selection-checkbox"
						checked={layer.selected}
						onchange={(e) => {
							e.stopPropagation();
							appState.toggleLayerSelection(layer.id);
						}}
					/>
					<span class="layer-name">{layer.name}</span>
					<div class="layer-actions">
						{#if layer.generatorId === "unified-import"}
							<button
								class="recover-btn"
								title="Recover Original Asset (.mov, .png, .svg, etc.)"
								onclick={(e) => {
									e.stopPropagation();
									appState.exportLayerAsset(layer.id);
								}}
							>
								<svg
									viewBox="0 0 24 24"
									width="14"
									height="14"
									fill="currentColor"
								>
									<path
										d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
									/>
								</svg>
							</button>
						{/if}
						<button
							class="delete-btn"
							title="Delete Layer"
							onclick={(e) => {
								e.stopPropagation();
								appState.removeLayer(layer.id);
							}}>×</button
						>
					</div>
				</div>

				{#if appState.activeLayerId === layer.id && !isDraggingId}
					<div
						class="layer-controls"
						onclick={(e) => e.stopPropagation()}
						onkeydown={(e) => e.stopPropagation()}
						role="presentation"
					>
						<div class="control-row">
							<label for={`blend-${layer.id}`}>Blend</label>
							<select
								id={`blend-${layer.id}`}
								name={`blend-${layer.id}`}
								value={layer.blendMode}
								onchange={(e) =>
									appState.updateLayer(layer.id, {
										blendMode: e.currentTarget
											.value as BlendMode,
									})}
							>
								{#each blendModes as mode}
									<option value={mode}>{mode}</option>
								{/each}
							</select>
						</div>
						<div class="control-row">
							<label for={`opacity-${layer.id}`}
								>Opacity ({Math.round(
									layer.opacity * 100,
								)}%)</label
							>
							<input
								id={`opacity-${layer.id}`}
								type="range"
								min="0"
								max="1"
								step="0.05"
								value={layer.opacity}
								oninput={(e) =>
									appState.updateLayer(layer.id, {
										opacity: parseFloat(
											e.currentTarget.value,
										),
									})}
							/>
						</div>
						<div class="control-row">
							<label for={`scaleX-${layer.id}`}
								>Scale X ({layer.transforms.scaleX.toFixed(
									2,
								)})</label
							>
							<input
								id={`scaleX-${layer.id}`}
								type="range"
								min="0.1"
								max="10"
								step="0.1"
								value={layer.transforms.scaleX}
								oninput={(e) =>
									appState.updateLayer(layer.id, {
										transforms: {
											...layer.transforms,
											scaleX: parseFloat(
												e.currentTarget.value,
											),
										},
									})}
							/>
						</div>
						<div class="control-row">
							<label for={`scaleY-${layer.id}`}
								>Scale Y ({layer.transforms.scaleY.toFixed(
									2,
								)})</label
							>
							<input
								id={`scaleY-${layer.id}`}
								type="range"
								min="0.1"
								max="10"
								step="0.1"
								value={layer.transforms.scaleY}
								oninput={(e) =>
									appState.updateLayer(layer.id, {
										transforms: {
											...layer.transforms,
											scaleY: parseFloat(
												e.currentTarget.value,
											),
										},
									})}
							/>
						</div>
						<div class="control-row">
							<label for={`rotation-${layer.id}`}
								>Rotation ({layer.transforms.rotation.toFixed(
									0,
								)}°)</label
							>
							<input
								id={`rotation-${layer.id}`}
								type="range"
								min="0"
								max="360"
								step="1"
								value={layer.transforms.rotation}
								oninput={(e) =>
									appState.updateLayer(layer.id, {
										transforms: {
											...layer.transforms,
											rotation: parseFloat(
												e.currentTarget.value,
											),
										},
									})}
							/>
						</div>
						<div class="divider"></div>

						<div class="control-row">
							<label for={`filter-${layer.id}`}>Filter FX</label>
							<select
								id={`filter-${layer.id}`}
								value={layer.filter?.type || ""}
								onchange={(e) => {
									const type = e.currentTarget.value;
									if (!type) {
										appState.updateLayer(layer.id, {
											filter: undefined,
										});
									} else {
										const def = filterDefinitions[type];
										const defaultParams = {
											...def.schema.parse({}),
										};
										// Reset specific defaults for Color Matrix types
										if (type === "color-matrix") {
											defaultParams.type = "matrix";
											defaultParams.values =
												"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0";
										}
										appState.updateLayer(layer.id, {
											filter: {
												id: `filter-${layer.id}`,
												type,
												params: defaultParams,
											},
										});
									}
								}}
							>
								<option value="">None</option>
								{#each Object.values(filterDefinitions) as def}
									<option value={def.id}>{def.name}</option>
								{/each}
							</select>
						</div>

						{#if layer.filter && filterDefinitions[layer.filter.type]}
							<div class="filter-params">
								{#if layer.filter.type === "blur"}
									<div class="control-row sub">
										<label for={`blur-std-${layer.id}`}
											>Strength ({layer.filter.params
												.stdDeviation})</label
										>
										<input
											id={`blur-std-${layer.id}`}
											type="range"
											min="0"
											max="50"
											step="1"
											value={layer.filter.params
												.stdDeviation}
											oninput={(e) => {
												const f = layer.filter!;
												appState.updateLayer(layer.id, {
													filter: {
														...f,
														params: {
															...f.params,
															stdDeviation:
																parseFloat(
																	e
																		.currentTarget
																		.value,
																),
														},
													},
												});
											}}
										/>
									</div>
								{:else if layer.filter.type === "displacement"}
									<div class="control-row sub">
										<label for={`disp-scale-${layer.id}`}
											>Scale ({layer.filter.params
												.scale})</label
										>
										<input
											id={`disp-scale-${layer.id}`}
											type="range"
											min="0"
											max="100"
											step="1"
											value={layer.filter.params.scale}
											oninput={(e) => {
												const f = layer.filter!;
												appState.updateLayer(layer.id, {
													filter: {
														...f,
														params: {
															...f.params,
															scale: parseFloat(
																e.currentTarget
																	.value,
															),
														},
													},
												});
											}}
										/>
									</div>
									<div class="control-row sub">
										<label for={`disp-freq-${layer.id}`}
											>Freq ({layer.filter.params
												.baseFrequency})</label
										>
										<input
											id={`disp-freq-${layer.id}`}
											type="range"
											min="0.001"
											max="0.5"
											step="0.001"
											value={layer.filter.params
												.baseFrequency}
											oninput={(e) => {
												const f = layer.filter!;
												appState.updateLayer(layer.id, {
													filter: {
														...f,
														params: {
															...f.params,
															baseFrequency:
																parseFloat(
																	e
																		.currentTarget
																		.value,
																),
														},
													},
												});
											}}
										/>
									</div>
									<div class="control-row sub">
										<label for={`disp-octaves-${layer.id}`}
											>Noise Detail ({layer.filter.params
												.numOctaves})</label
										>
										<input
											id={`disp-octaves-${layer.id}`}
											type="range"
											min="1"
											max="5"
											step="1"
											value={layer.filter.params
												.numOctaves}
											oninput={(e) => {
												const f = layer.filter!;
												appState.updateLayer(layer.id, {
													filter: {
														...f,
														params: {
															...f.params,
															numOctaves:
																parseInt(
																	e
																		.currentTarget
																		.value,
																),
														},
													},
												});
											}}
										/>
									</div>
									<div class="control-row sub">
										<label for={`cm-type-${layer.id}`}
											>Matrix Type</label
										>
										<select
											id={`cm-type-${layer.id}`}
											value={layer.filter.params.type}
											onchange={(e) => {
												const f = layer.filter!;
												const newType =
													e.currentTarget.value;
												let newValues = f.params.values;

												// Clamp/Set defaults on type change to fix jumpy UI
												if (newType === "matrix")
													newValues =
														"1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0";
												else if (newType === "saturate")
													newValues = "1";
												else if (
													newType === "hueRotate"
												)
													newValues = "0";
												else if (
													newType ===
													"luminanceToAlpha"
												)
													newValues = "";

												appState.updateLayer(layer.id, {
													filter: {
														...f,
														params: {
															...f.params,
															type: newType,
															values: newValues,
														},
													},
												});
											}}
										>
											<option value="matrix"
												>Matrix</option
											>
											<option value="saturate"
												>Saturate</option
											>
											<option value="hueRotate"
												>Hue Rotate</option
											>
											<option value="luminanceToAlpha"
												>Luminance to Alpha</option
											>
										</select>
									</div>
									{#if layer.filter.params.type === "saturate" || layer.filter.params.type === "hueRotate"}
										<div class="control-row sub">
											<label for={`cm-val-${layer.id}`}
												>Value ({layer.filter.params
													.values})</label
											>
											<input
												id={`cm-val-${layer.id}`}
												type="range"
												min={layer.filter.params
													.type === "hueRotate"
													? "0"
													: "0"}
												max={layer.filter.params
													.type === "hueRotate"
													? "360"
													: "10"}
												step="0.1"
												value={parseFloat(
													layer.filter.params.values,
												) || 0}
												oninput={(e) => {
													const f = layer.filter!;
													appState.updateLayer(
														layer.id,
														{
															filter: {
																...f,
																params: {
																	...f.params,
																	values: e
																		.currentTarget
																		.value,
																},
															},
														},
													);
												}}
											/>
										</div>
									{/if}
								{/if}
							</div>
						{/if}

						<div class="control-row">
							<label for={`mask-${layer.id}`}>Mask (Alpha)</label>
							<select
								id={`mask-${layer.id}`}
								value={layer.maskLayerId || ""}
								onchange={(e) =>
									appState.updateLayer(layer.id, {
										maskLayerId:
											e.currentTarget.value || undefined,
									})}
							>
								<option value="">None</option>
								{#each appState.layers.filter((l) => l.id !== layer.id) as other}
									<option value={other.id}
										>{other.name}</option
									>
								{/each}
							</select>
						</div>

						<div class="divider"></div>

						<div class="control-row action-row">
							<button
								class="layer-action-btn"
								onclick={() =>
									appState.fitLayerToCanvas(layer.id)}
								title="Scale and Center to fit 100x100 exactly"
							>
								Fit to Canvas
							</button>
							<button
								class="layer-action-btn"
								onclick={() => appState.centerLayer(layer.id)}
								title="Center in the 100x100 canvas without scaling"
							>
								Center
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.layer-panel {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.panel-actions {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.import-btn,
	.export-assets-btn {
		flex: 1;
		background: #003153; /* Prussian Blue */
		border: 1px solid #082567; /* Dark Sapphire */
		color: #4dff00; /* Action Green */
		padding: 0.6rem;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
	}

	.import-btn:hover,
	.export-assets-btn:hover {
		background: #082567;
		box-shadow: 0 0 10px rgba(77, 255, 0, 0.2);
		border-color: #4dff00;
	}

	.empty-state {
		padding: 1rem;
		text-align: center;
		color: #a0aec0;
		font-size: 0.85rem;
		background: #002244; /* Seahawks Navy */
		border: 1px dashed #003153; /* Prussian Blue */
		border-radius: 4px;
	}

	.layer-item {
		background: #002244; /* Seahawks Navy */
		border: 1px solid #003153; /* Prussian Blue */
		border-radius: 4px;
		cursor: pointer;
		user-select: none;
		transition: all 0.2s;
		overflow: hidden;
		color: #e2e8f0;
	}

	.layer-item:hover {
		border-color: #228b22; /* Forest Green */
	}

	.layer-item.active {
		background: #191970; /* Midnight Blue */
		border-color: #4dff00; /* Action Green */
		border-left: 4px solid #4dff00;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.layer-header {
		display: flex;
		align-items: center;
		padding: 0.5rem;
		gap: 0.5rem;
		cursor: grab;
	}

	.layer-header:active {
		cursor: grabbing;
	}

	.chevron {
		font-size: 0.7rem;
		color: #888;
		width: 12px;
		display: inline-block;
		transition: transform 0.2s;
	}

	.drag-handle {
		color: #aaa;
		font-size: 0.8rem;
		padding: 0 0.2rem;
		pointer-events: none; /* Let header handle the interaction */
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.document-settings {
		padding: 0.75rem;
		background: #002244;
		border: 1px solid #1a1a1a;
		border-radius: 6px;
		margin-bottom: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.doc-label {
		font-size: 0.65rem;
		font-weight: bold;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ratio-select {
		background: #1f2328;
		border: 1px solid #003153;
		color: white;
		padding: 0.4rem;
		border-radius: 4px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.selection-actions {
		display: flex;
		gap: 0.25rem;
		margin-top: 0.25rem;
		width: 100%;
	}

	.batch-btn {
		flex: 1;
		background: #003153; /* Prussian Blue */
		border: 1px solid #1a1a1a;
		color: #a0aec0;
		padding: 0.25rem;
		border-radius: 4px;
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.batch-btn:hover {
		background: #191970; /* Midnight Blue */
		color: white;
		border-color: #2b6cb0;
	}

	.visibility-checkbox,
	.selection-checkbox {
		cursor: pointer;
		accent-color: #2b6cb0; /* Professional Blue */
		width: 14px;
		height: 14px;
	}

	.selection-checkbox {
		accent-color: #228b22; /* Success Green for Export */
	}

	.layer-name {
		flex: 1;
		font-size: 0.85rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.layer-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.recover-btn {
		background: none;
		border: none;
		color: #555;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.recover-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #228b22; /* Forest Green */
	}

	.delete-btn {
		background: none;
		border: none;
		color: #999;
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.2rem;
	}

	.delete-btn:hover {
		color: #e63946;
	}

	.layer-controls {
		padding: 0.5rem;
		border-top: 1px solid #003153; /* Prussian Blue */
		background: #002147; /* Oxford Blue */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-row {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.control-row label {
		font-size: 0.75rem;
		color: #a0aec0;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.control-row select,
	.control-row input[type="range"] {
		width: 100%;
		padding: 0.2rem;
		font-size: 0.8rem;
	}

	.action-row {
		flex-direction: row;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.layer-action-btn {
		flex: 1;
		background: #003153; /* Prussian Blue */
		border: 1px solid #002244; /* Seahawks Navy */
		color: #e2e8f0;
		padding: 0.3rem;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.layer-action-btn:hover {
		background: #191970; /* Midnight Blue */
		border-color: #228b22; /* Forest Green */
		color: white;
	}

	.divider {
		height: 1px;
		background: #003153;
		margin: 0.25rem 0;
	}

	.filter-params {
		padding-left: 0.5rem;
		border-left: 2px solid #003153;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.control-row.sub label {
		font-size: 0.65rem;
		color: #718096;
		white-space: normal; /* Allow sub-labels for filters to wrap if long */
	}
</style>
