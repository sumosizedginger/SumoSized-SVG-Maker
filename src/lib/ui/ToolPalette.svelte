<script lang="ts">
    import { appState } from "../state/appState.svelte";
    import type { PaintTool } from "../engine/core/types";

    interface ToolDef {
        id: PaintTool;
        label: string;
        icon: string;
        group: string;
    }

    const tools: ToolDef[] = [
        // --- Selection ---
        {
            id: "pointer",
            label: "Pointer (V)",
            icon: "M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L5.5 3.21Z",
            group: "select",
        },
        {
            id: "move",
            label: "Move (G)",
            icon: "M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
            group: "select",
        },
        {
            id: "crop",
            label: "Crop (C)",
            icon: "M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z",
            group: "select",
        },
        {
            id: "transform",
            label: "Transform (S)",
            icon: "M7 14H5v5h5v-2H7v-3zm0-4h2V7h3V5H7v5zm8 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
            group: "select",
        },
        // --- Drawing ---
        {
            id: "pencil",
            label: "Pencil (P)",
            icon: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
            group: "draw",
        },
        {
            id: "brush",
            label: "Brush (B)",
            icon: "M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z",
            group: "draw",
        },
        {
            id: "eraser",
            label: "Eraser (E)",
            icon: "M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.78-.78 2.05 0 2.83l4.27 4.27c.39.39.9.59 1.41.59h8.55l5.59-5.59c.78-.78.78-2.05 0-2.83L15.14 3z",
            group: "draw",
        },
        // --- Shapes ---
        { id: "line", label: "Line (L)", icon: "M4 20L20 4", group: "shape" },
        {
            id: "rect",
            label: "Rectangle (R)",
            icon: "M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 14H5V5h14v14z",
            group: "shape",
        },
        {
            id: "ellipse",
            label: "Ellipse (O)",
            icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
            group: "shape",
        },
        // --- Utility ---
        {
            id: "text",
            label: "Text (T)",
            icon: "M5 4v3h5.5v12h3V7H19V4z",
            group: "util",
        },
    ];

    const isDrawingTool = (id: PaintTool) =>
        ["pencil", "brush", "eraser", "line", "rect", "ellipse"].includes(id);

    function selectTool(toolId: PaintTool) {
        appState.activeTool = toolId;
        // Auto-create a drawing layer if switching to a drawing tool
        if (isDrawingTool(toolId) || toolId === "text") {
            if (appState.activeLayer?.generatorId !== "free-draw") {
                appState.addLayer("free-draw");
            }
        }
    }

    let lastGroup = "";
</script>

<div class="tool-palette">
    {#each tools as tool, i}
        {#if tool.group !== lastGroup && i > 0}
            <div class="separator"></div>
        {/if}
        {@const _ = lastGroup = tool.group}
        <button
            class="tool-btn {appState.activeTool === tool.id ? 'active' : ''}"
            onclick={() => selectTool(tool.id)}
            aria-label={tool.label}
            title={tool.label}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                {#if tool.id === "line"}
                    <line
                        x1="4"
                        y1="20"
                        x2="20"
                        y2="4"
                        stroke="currentColor"
                        stroke-width="2"
                    />
                {:else}
                    <path d={tool.icon} />
                {/if}
            </svg>
        </button>
    {/each}

    {#if appState.documentViewBox.w !== 100 || appState.documentViewBox.h !== 100}
        <div class="separator"></div>
        <button
            class="tool-btn reset-zoom-btn"
            onclick={() => appState.resetGlobalCrop()}
            aria-label="Reset Zoom (Uncrop)"
            title="Reset Zoom (Uncrop)"
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path
                    d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6zM21 15l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z"
                />
            </svg>
        </button>
    {/if}

    <div class="separator"></div>

    <button
        class="tool-btn history-btn"
        class:disabled={!appState.canUndo}
        onclick={() => appState.undo()}
        aria-label="Undo (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
        disabled={!appState.canUndo}
    >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
                d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L3.2 8.2V14h5.8l-2.35-2.35c1.45-1.25 3.35-2.05 5.5-2.05 4.15 0 7.6 2.9 8.35 6.75l2.45-.45C21.95 11.2 17.75 8 12.5 8z"
            />
        </svg>
    </button>
    <button
        class="tool-btn history-btn"
        class:disabled={!appState.canRedo}
        onclick={() => appState.redo()}
        aria-label="Redo (Ctrl+Y)"
        title="Redo (Ctrl+Y)"
        disabled={!appState.canRedo}
    >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
                d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-5.25 0-9.45 3.2-10.45 7.9l2.45.45c.75-3.85 4.2-6.75 8.35-6.75 2.15 0 4.05.8 5.5 2.05L15 14h5.8V8.2l-2.4 2.4z"
            />
        </svg>
    </button>
</div>

<style>
    .tool-palette {
        width: 48px;
        background: #002244; /* Seahawks Navy */
        border-right: 1px solid #003153; /* Prussian Blue */
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.4rem 0;
        gap: 2px;
        z-index: 100;
        overflow-y: auto;
    }

    .separator {
        width: 28px;
        height: 1px;
        background: #003153; /* Prussian Blue */
        margin: 3px 0;
    }

    .tool-btn {
        width: 34px;
        height: 34px;
        border-radius: 4px;
        border: 1px solid transparent;
        background: transparent;
        color: #a0aec0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
    }

    .tool-btn:hover {
        background: #003153; /* Prussian Blue */
        color: white;
    }

    .tool-btn.active {
        background: #228b22; /* Forest Green */
        color: white;
        border-color: #4dff00; /* Action Green */
        box-shadow: 0 0 6px rgba(77, 255, 0, 0.4);
    }

    .reset-zoom-btn:hover {
        background: #7f1d1d;
        color: white;
    }

    .tool-btn.disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .tool-btn.disabled:hover {
        background: transparent;
        color: #a0aec0;
    }
</style>
