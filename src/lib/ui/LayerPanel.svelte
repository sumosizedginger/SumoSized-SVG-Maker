<script lang="ts">
    import { appState } from "$lib/state/appState.svelte";
    import type { BlendMode } from "$lib/core/types";

    // Reverse layers so top is first (visual representation like Photoshop)
    let displayLayers = $derived([...appState.layers].reverse());

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
        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
        }
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
    async function handleImportSVG() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".svg";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const text = await file.text();

            // Atomic add: avoids intermediate render of placeholder circle
            appState.addLayer("svg-import", { svgData: text });
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
                        // Verify we have real dimensions
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
    <button class="import-btn" onclick={handleImportSVG}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
                d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            />
        </svg>
        Import SVG
    </button>
    {#if displayLayers.length === 0}
        <div class="empty-state">No layers. Click a generator to add one.</div>
    {:else}
        {#each displayLayers as layer (layer.id)}
            <div
                class="layer-item"
                class:active={appState.activeLayerId === layer.id}
                onclick={() => (appState.activeLayerId = layer.id)}
                draggable="true"
                ondragstart={(e) => handleDragStart(e, layer.id)}
                ondragover={handleDragOver}
                ondrop={(e) => handleDrop(e, layer.id)}
                role="button"
                tabindex="0"
                onkeydown={(e) =>
                    e.key === "Enter" && (appState.activeLayerId = layer.id)}
            >
                <div class="layer-header">
                    <div class="drag-handle">⋮⋮</div>
                    <input
                        type="checkbox"
                        title="Toggle Visibility"
                        checked={layer.visible}
                        onclick={(e) => e.stopPropagation()}
                        onchange={(e) =>
                            appState.updateLayer(layer.id, {
                                visible: e.currentTarget.checked,
                            })}
                    />
                    <span class="layer-name">{layer.name}</span>
                    <button
                        class="delete-btn"
                        title="Delete Layer"
                        onclick={(e) => {
                            e.stopPropagation();
                            appState.removeLayer(layer.id);
                        }}>×</button
                    >
                </div>

                {#if appState.activeLayerId === layer.id}
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

    .import-btn {
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
        margin-bottom: 0.25rem;
    }

    .import-btn:hover {
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
    }

    .drag-handle {
        color: #aaa;
        cursor: grab;
        font-size: 0.8rem;
        padding: 0 0.2rem;
    }

    .drag-handle:active {
        cursor: grabbing;
    }

    .layer-name {
        flex: 1;
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
</style>
