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
</script>

<div class="layer-panel">
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
        gap: 0.25rem;
    }

    .empty-state {
        padding: 1rem;
        text-align: center;
        color: #888;
        font-size: 0.85rem;
        background: #f9f9f9;
        border: 1px dashed #ccc;
        border-radius: 4px;
    }

    .layer-item {
        background: #f4f4f4;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s;
        overflow: hidden;
    }

    .layer-item:hover {
        border-color: #bbb;
    }

    .layer-item.active {
        background: #fff;
        border-color: #1e1e2e;
        border-left: 4px solid #1e1e2e;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
        border-top: 1px solid #eee;
        background: #fafafa;
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
        color: #666;
        text-transform: uppercase;
    }

    .control-row select,
    .control-row input[type="range"] {
        width: 100%;
        padding: 0.2rem;
        font-size: 0.8rem;
    }
</style>
