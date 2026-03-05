<script lang="ts">
    import { appState } from "../state/appState.svelte";

    let isInteracting = $state(false);
    let startX = $state(0);
    let startY = $state(0);

    // For Move
    let initialTx = 0;
    let initialTy = 0;

    // For Crop draft
    let cropDraftX = $state(0);
    let cropDraftY = $state(0);
    let cropDraftW = $state(0);
    let cropDraftH = $state(0);

    let svgElement: SVGSVGElement;

    function getCoords(e: PointerEvent) {
        if (!svgElement) return { x: 0, y: 0 };
        const pt = svgElement.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svgElement.getScreenCTM();
        if (ctm) {
            const transformed = pt.matrixTransform(ctm.inverse());
            return { x: transformed.x, y: transformed.y };
        }
        return { x: 0, y: 0 };
    }

    let initialTrans = { x: 0, y: 0, sx: 1, sy: 1 };
    let activeHandle = $state<string | null>(null);

    let bbox = $state({ x: 0, y: 0, width: 100, height: 100 });

    $effect(() => {
        const layer = appState.activeLayer;
        if (!layer || !svgElement) return;

        // Track dependencies to ensure re-measurement if content changes
        const dummy1 = layer.params;
        const dummy2 = layer.seed;

        requestAnimationFrame(() => {
            const g = document.querySelector(
                `.layer-${layer.id}`,
            ) as SVGGElement | null;
            if (g) {
                try {
                    const b = g.getBBox();
                    if (b.width > 0 && b.height > 0) {
                        bbox = {
                            x: b.x,
                            y: b.y,
                            width: b.width,
                            height: b.height,
                        };
                    } else {
                        bbox = { x: 0, y: 0, width: 100, height: 100 };
                    }
                } catch (e) {}
            }
        });
    });

    function handlePointerDown(e: PointerEvent) {
        if (e.button !== 0) return;

        // Crop works globally — doesn't need an active layer
        if (appState.activeTool === "crop") {
            isInteracting = true;
            const { x, y } = getCoords(e);
            startX = x;
            startY = y;
            cropDraftX = x;
            cropDraftY = y;
            cropDraftW = 0;
            cropDraftH = 0;
            (e.target as Element).setPointerCapture(e.pointerId);
            return;
        }

        // Move/Transform requires an active layer
        if (!appState.activeLayerId) return;

        isInteracting = true;
        const { x, y } = getCoords(e);
        startX = x;
        startY = y;

        const tr = appState.activeLayer?.transforms;
        if (tr) {
            initialTrans = { x: tr.x, y: tr.y, sx: tr.scaleX, sy: tr.scaleY };
        }

        if (appState.activeTool === "transform") {
            // Check if we hit a handle
            const target = e.target as SVGElement;
            const handleId = target.getAttribute("data-handle");
            if (handleId) {
                activeHandle = handleId;
            } else {
                activeHandle = "move"; // default to move if clicking inside but not on handle
            }
        }

        (e.target as Element).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isInteracting) return;

        const { x: curX, y: curY } = getCoords(e);

        if (appState.activeTool === "crop") {
            const cx = Math.min(curX, startX);
            const cy = Math.min(curY, startY);
            const cw = Math.abs(curX - startX);
            const ch = Math.abs(curY - startY);

            cropDraftX = Number(cx.toFixed(2));
            cropDraftY = Number(cy.toFixed(2));
            cropDraftW = Number(cw.toFixed(2));
            cropDraftH = Number(ch.toFixed(2));
            return;
        }

        // Move/Transform requires an active layer
        if (!appState.activeLayer) return;

        const dx = curX - startX;
        const dy = curY - startY;
        const tr = appState.activeLayer.transforms;

        if (appState.activeTool === "move") {
            tr.x = Number((initialTrans.x + dx).toFixed(2));
            tr.y = Number((initialTrans.y + dy).toFixed(2));
        } else if (appState.activeTool === "transform") {
            if (activeHandle === "move") {
                tr.x = Number((initialTrans.x + dx).toFixed(2));
                tr.y = Number((initialTrans.y + dy).toFixed(2));
            } else if (activeHandle) {
                // Scaling logic based on actual layer bounds
                const baseW = Math.max(0.1, bbox.width);
                const baseH = Math.max(0.1, bbox.height);
                const s_x = bbox.x / baseW;
                const s_y = bbox.y / baseH;

                let newSx = initialTrans.sx;
                let newSy = initialTrans.sy;
                let newTx = initialTrans.x;
                let newTy = initialTrans.y;

                if (activeHandle.includes("right")) {
                    newSx = initialTrans.sx + dx / baseW;
                    newTx = initialTrans.x - dx * s_x;
                } else if (activeHandle.includes("left")) {
                    newSx = initialTrans.sx - dx / baseW;
                    newTx = initialTrans.x + dx * (1 + s_x);
                }

                if (activeHandle.includes("bottom")) {
                    newSy = initialTrans.sy + dy / baseH;
                    newTy = initialTrans.y - dy * s_y;
                } else if (activeHandle.includes("top")) {
                    newSy = initialTrans.sy - dy / baseH;
                    newTy = initialTrans.y + dy * (1 + s_y);
                }

                tr.scaleX = Number(Math.max(0.01, newSx).toFixed(4));
                tr.scaleY = Number(Math.max(0.01, newSy).toFixed(4));
                tr.x = Number(newTx.toFixed(2));
                tr.y = Number(newTy.toFixed(2));
            }
        }
    }

    function handlePointerUp(e: PointerEvent) {
        if (!isInteracting) return;
        isInteracting = false;
        activeHandle = null;
        try {
            (e.target as Element).releasePointerCapture(e.pointerId);
        } catch (err) {}

        if (
            appState.activeTool === "crop" &&
            cropDraftW > 1 &&
            cropDraftH > 1
        ) {
            appState.setGlobalCrop(
                cropDraftX,
                cropDraftY,
                cropDraftW,
                cropDraftH,
            );
            cropDraftW = 0;
            cropDraftH = 0;
        } else if (appState.activeTool === "crop") {
            cropDraftW = 0;
            cropDraftH = 0;
        } else {
            appState.saveState();
        }
    }

    // Transform Bounding Box Calculation
    let bounds = $derived.by(() => {
        if (!appState.activeLayer) return null;
        const tr = appState.activeLayer.transforms;
        const w = bbox.width * tr.scaleX;
        const h = bbox.height * tr.scaleY;
        const x1 = tr.x + bbox.x * tr.scaleX;
        const y1 = tr.y + bbox.y * tr.scaleY;
        return { x: x1, y: y1, w, h };
    });
</script>

<svg
    bind:this={svgElement}
    viewBox="{appState.documentViewBox.x} {appState.documentViewBox.y} {appState
        .documentViewBox.w} {appState.documentViewBox.h}"
    preserveAspectRatio="xMidYMid meet"
    style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:40;touch-action:none;overflow:visible;cursor:{appState.activeTool ===
        'move' || appState.activeTool === 'transform'
        ? isInteracting
            ? 'grabbing'
            : 'grab'
        : appState.activeTool === 'crop'
          ? 'crosshair'
          : 'default'}"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    aria-label="Canvas Interaction"
    role="presentation"
>
    {#if appState.activeTool === "crop" && isInteracting && cropDraftW > 0}
        <rect
            x={appState.documentViewBox.x}
            y={appState.documentViewBox.y}
            width={appState.documentViewBox.w}
            height={appState.documentViewBox.h}
            fill="rgba(0,0,0,0.5)"
        />
        <rect
            x={cropDraftX}
            y={cropDraftY}
            width={cropDraftW}
            height={cropDraftH}
            fill="rgba(0,0,0,0)"
        />
        <rect
            x={cropDraftX}
            y={cropDraftY}
            width={cropDraftW}
            height={cropDraftH}
            fill="none"
            stroke="#4DFF00"
            stroke-width="0.5"
            stroke-dasharray="2 2"
        />
        <circle cx={cropDraftX} cy={cropDraftY} r="1" fill="#4DFF00" />
        <circle
            cx={cropDraftX + cropDraftW}
            cy={cropDraftY}
            r="1"
            fill="#4DFF00"
        />
        <circle
            cx={cropDraftX}
            cy={cropDraftY + cropDraftH}
            r="1"
            fill="#4DFF00"
        />
        <circle
            cx={cropDraftX + cropDraftW}
            cy={cropDraftY + cropDraftH}
            r="1"
            fill="#4DFF00"
        />
        <text
            x={cropDraftX + cropDraftW / 2}
            y={cropDraftY - 1.5}
            text-anchor="middle"
            fill="#4DFF00"
            font-size="3"
            font-family="sans-serif"
            >{cropDraftW.toFixed(0)} &times; {cropDraftH.toFixed(0)}</text
        >
    {/if}

    {#if appState.activeTool === "transform" && bounds}
        <!-- Bounding Box -->
        <rect
            x={bounds.x}
            y={bounds.y}
            width={bounds.w}
            height={bounds.h}
            fill="rgba(77, 255, 0, 0.05)"
            stroke="#4DFF00"
            stroke-width="0.3"
            stroke-dasharray="1 1"
            pointer-events="all"
        />

        <!-- Handles -->
        {@const hs = 2}<!-- handle size -->
        <!-- Corners -->
        <rect
            x={bounds.x - hs / 2}
            y={bounds.y - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="top-left"
            style="cursor: nwse-resize"
        />
        <rect
            x={bounds.x + bounds.w - hs / 2}
            y={bounds.y - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="top-right"
            style="cursor: nesw-resize"
        />
        <rect
            x={bounds.x - hs / 2}
            y={bounds.y + bounds.h - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="bottom-left"
            style="cursor: nesw-resize"
        />
        <rect
            x={bounds.x + bounds.w - hs / 2}
            y={bounds.y + bounds.h - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="bottom-right"
            style="cursor: nwse-resize"
        />

        <!-- Sides -->
        <rect
            x={bounds.x + bounds.w / 2 - hs / 2}
            y={bounds.y - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="top"
            style="cursor: ns-resize"
        />
        <rect
            x={bounds.x + bounds.w / 2 - hs / 2}
            y={bounds.y + bounds.h - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="bottom"
            style="cursor: ns-resize"
        />
        <rect
            x={bounds.x - hs / 2}
            y={bounds.y + bounds.h / 2 - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="left"
            style="cursor: ew-resize"
        />
        <rect
            x={bounds.x + bounds.w - hs / 2}
            y={bounds.y + bounds.h / 2 - hs / 2}
            width={hs}
            height={hs}
            fill="white"
            stroke="#4DFF00"
            stroke-width="0.2"
            data-handle="right"
            style="cursor: ew-resize"
        />
    {/if}
</svg>
