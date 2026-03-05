<script lang="ts">
    import { appState } from "../state/appState.svelte";

    let isDrawing = $state(false);
    let currentPath = $state("");
    let shapeStart = $state({ x: 0, y: 0 });
    let shapeEnd = $state({ x: 0, y: 0 });
    let svgElement: SVGSVGElement;

    // Text tool inline input state
    let showTextInput = $state(false);
    let textInputValue = $state("");
    let textPlaceX = $state(0);
    let textPlaceY = $state(0);
    let textInputEl = $state<HTMLInputElement>();

    // Map screen to SVG viewBox coords
    function getCoords(e: PointerEvent | MouseEvent) {
        if (!svgElement) return { x: 0, y: 0 };
        const pt = svgElement.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svgElement.getScreenCTM();
        if (ctm) {
            const t = pt.matrixTransform(ctm.inverse());
            return { x: t.x, y: t.y };
        }
        return { x: 0, y: 0 };
    }

    // Pixel position for the floating input (screen coordinates)
    function getScreenPos(e: PointerEvent) {
        if (!svgElement) return { px: 0, py: 0 };
        const rect = svgElement.getBoundingClientRect();
        return { px: e.clientX - rect.left, py: e.clientY - rect.top };
    }

    function getToolType() {
        const tool = appState.activeTool;
        if (tool === "pencil" || tool === "brush" || tool === "eraser")
            return "freehand";
        if (tool === "line" || tool === "rect" || tool === "ellipse")
            return "shape";
        return "other";
    }

    function getStrokeWidth(): number {
        const tool = appState.activeTool;
        const base = Number(appState.activeLayer?.params?.strokeWidth ?? 1);
        if (tool === "brush") return Math.max(base * 3, 2);
        if (tool === "eraser") return Math.max(base * 5, 3);
        return base;
    }

    function getStrokeColor(): string {
        if (appState.activeTool === "eraser") return "#f0f0f0";
        return String(appState.activeLayer?.params?.strokeColor ?? "#ffffff");
    }

    function commitText() {
        if (!textInputValue.trim() || !appState.activeLayer) {
            showTextInput = false;
            textInputValue = "";
            return;
        }
        const existing = String(appState.activeLayer.params.pathData || "");
        const color = getStrokeColor();
        const fontSize = getStrokeWidth() * 3;
        const textEntry = `TEXT;${textPlaceX.toFixed(2)};${textPlaceY.toFixed(2)};${fontSize.toFixed(1)};${color};${textInputValue}`;
        appState.activeLayer.params.pathData = existing
            ? existing + "|" + textEntry
            : textEntry;
        appState.saveState();
        showTextInput = false;
        textInputValue = "";
    }

    function handleTextKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            commitText();
        } else if (e.key === "Escape") {
            showTextInput = false;
            textInputValue = "";
        }
    }

    function handlePointerDown(e: PointerEvent) {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        if (!appState.activeLayer) return;

        const { x, y } = getCoords(e);

        // Text tool: show inline input at click position
        if (appState.activeTool === "text") {
            // If already showing an input, commit it first
            if (showTextInput) commitText();
            textPlaceX = x;
            textPlaceY = y;
            const { px, py } = getScreenPos(e);
            showTextInput = true;
            textInputValue = "";
            // Focus the input after Svelte renders it
            requestAnimationFrame(() => {
                if (textInputEl) textInputEl.focus();
            });
            return;
        }

        isDrawing = true;

        if (getToolType() === "freehand") {
            currentPath = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else if (getToolType() === "shape") {
            shapeStart = { x, y };
            shapeEnd = { x, y };
        }

        (e.target as Element).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isDrawing) return;
        const { x, y } = getCoords(e);

        if (getToolType() === "freehand") {
            currentPath += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
        } else if (getToolType() === "shape") {
            shapeEnd = { x, y };
        }
    }

    function buildShapePath(): string {
        const tool = appState.activeTool;
        const x1 = shapeStart.x,
            y1 = shapeStart.y;
        const x2 = shapeEnd.x,
            y2 = shapeEnd.y;

        if (tool === "line") {
            return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
        }
        if (tool === "rect") {
            const rx = Math.min(x1, x2),
                ry = Math.min(y1, y2);
            const w = Math.abs(x2 - x1),
                h = Math.abs(y2 - y1);
            return `M ${rx.toFixed(2)} ${ry.toFixed(2)} h ${w.toFixed(2)} v ${h.toFixed(2)} h ${(-w).toFixed(2)} Z`;
        }
        if (tool === "ellipse") {
            const cx = (x1 + x2) / 2,
                cy = (y1 + y2) / 2;
            const rx = Math.abs(x2 - x1) / 2,
                ry = Math.abs(y2 - y1) / 2;
            return `M ${(cx - rx).toFixed(2)} ${cy.toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(cx + rx).toFixed(2)} ${cy.toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(cx - rx).toFixed(2)} ${cy.toFixed(2)} Z`;
        }
        return "";
    }

    function handlePointerUp(e: PointerEvent) {
        if (!isDrawing) return;
        isDrawing = false;
        try {
            (e.target as Element).releasePointerCapture(e.pointerId);
        } catch {}
        if (!appState.activeLayer) return;

        let newStroke = "";
        if (getToolType() === "freehand" && currentPath) {
            newStroke = currentPath;
        } else if (getToolType() === "shape") {
            newStroke = buildShapePath();
        }

        if (newStroke) {
            const existing = String(appState.activeLayer.params.pathData || "");
            const sw = getStrokeWidth();
            const color = getStrokeColor();
            const cap = String(appState.activeLayer.params?.linecap || "round");
            const strokeEntry = `${color};${sw};${cap};${newStroke}`;
            appState.activeLayer.params.pathData = existing
                ? existing + "|" + strokeEntry
                : strokeEntry;
            appState.saveState();
        }
        currentPath = "";
    }
</script>

<!-- The SVG overlay for drawing -->
<svg
    bind:this={svgElement}
    viewBox="{appState.documentViewBox.x} {appState.documentViewBox.y} {appState
        .documentViewBox.w} {appState.documentViewBox.h}"
    style="cursor: {appState.activeTool === 'text' ? 'text' : 'crosshair'};"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    aria-label="Drawing Surface"
    role="presentation"
>
    {#if isDrawing && getToolType() === "freehand" && currentPath}
        <path
            d={currentPath}
            fill="none"
            stroke={getStrokeColor()}
            stroke-width={getStrokeWidth()}
            stroke-linecap={appState.activeLayer?.params?.linecap || "round"}
            stroke-linejoin="round"
        />
    {/if}
    {#if isDrawing && getToolType() === "shape"}
        <path
            d={buildShapePath()}
            fill="none"
            stroke={getStrokeColor()}
            stroke-width={getStrokeWidth()}
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="1 1"
        />
    {/if}

    <!-- Text cursor indicator -->
    {#if showTextInput}
        <line
            x1={textPlaceX}
            y1={textPlaceY - 4}
            x2={textPlaceX}
            y2={textPlaceY + 1}
            stroke={getStrokeColor()}
            stroke-width="0.3"
        />
    {/if}
</svg>

<!-- Floating HTML text input (positioned above the SVG) -->
{#if showTextInput}
    <div
        class="text-input-overlay"
        style="left: {textPlaceX}%; top: {textPlaceY}%;"
    >
        <input
            bind:this={textInputEl}
            type="text"
            class="text-input"
            placeholder="Type text, Enter to place"
            bind:value={textInputValue}
            onkeydown={handleTextKeydown}
            onblur={commitText}
        />
    </div>
{/if}

<style>
    .text-input-overlay {
        position: absolute;
        z-index: 100;
        transform: translate(0, -50%);
        pointer-events: auto;
    }
    .text-input {
        background: rgba(0, 0, 0, 0.85);
        color: white;
        border: 1px solid #2563eb;
        border-radius: 3px;
        padding: 4px 8px;
        font-size: 14px;
        min-width: 120px;
        outline: none;
        font-family: sans-serif;
    }
    .text-input::placeholder {
        color: #666;
        font-size: 11px;
    }
</style>
