<script lang="ts">
    import { appState } from "$lib/state/appState.svelte";
    import { recentEvents } from "$lib/services/telemetry.svelte";

    let isVisible = $state(false);

    function togglePanel(e: KeyboardEvent) {
        // Toggle with Ctrl+Shift+D
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
            e.preventDefault();
            isVisible = !isVisible;
        }
    }
</script>

<svelte:window onkeydown={togglePanel} />

{#if isVisible}
    <div class="debug-panel">
        <div class="header">
            <h3>Diagnostic Panel</h3>
            <button class="close-btn" onclick={() => (isVisible = false)}
                >&times;</button
            >
        </div>

        <div class="section">
            <h4>Application State</h4>
            <div class="data-row">
                <span class="label">generatorId:</span>
                <span class="value"
                    >{appState.activeGenerator?.id || "none"}</span
                >
            </div>
            <div class="data-row">
                <span class="label">seed:</span>
                <span class="value">{appState.activeLayer?.seed || 0}</span>
            </div>
            <details>
                <summary>Params</summary>
                <pre>{JSON.stringify(
                        appState.activeLayer?.params || {},
                        null,
                        2,
                    )}</pre>
            </details>
        </div>

        <div class="section">
            <h4>Recent Telemetry (Local)</h4>
            {#if recentEvents.length === 0}
                <div class="empty">No events yet.</div>
            {:else}
                <ul class="event-list">
                    {#each recentEvents as event}
                        <li class="event-item">
                            <div class="event-type">{event.event}</div>
                            <div class="event-meta">
                                gen: {event.generatorId}
                            </div>
                            <pre class="event-data">{JSON.stringify(
                                    event,
                                    (k, v) =>
                                        [
                                            "event",
                                            "generatorId",
                                            "timestamp",
                                        ].includes(k)
                                            ? undefined
                                            : v,
                                )}</pre>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
{/if}

<style>
    .debug-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        max-height: 80vh;
        background: rgba(30, 30, 46, 0.95);
        color: #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        font-family: monospace;
        font-size: 0.8rem;
        backdrop-filter: blur(4px);
        border: 1px solid #444;
        overflow: hidden;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: #11111a;
        border-bottom: 1px solid #444;
    }

    h3 {
        margin: 0;
        font-size: 0.85rem;
        color: #fff;
        text-transform: uppercase;
    }

    .close-btn {
        background: transparent;
        border: none;
        color: #aaa;
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
    }

    .close-btn:hover {
        color: white;
    }

    .section {
        padding: 0.75rem;
        border-bottom: 1px solid #333;
        overflow-y: auto;
    }

    .section:last-child {
        border-bottom: none;
    }

    h4 {
        margin: 0 0 0.5rem 0;
        color: #88f;
    }

    .data-row {
        display: flex;
        margin-bottom: 0.2rem;
    }

    .label {
        color: #aaa;
        width: 100px;
        flex-shrink: 0;
    }

    .value {
        color: #fff;
        word-break: break-all;
    }

    details {
        margin-top: 0.5rem;
    }

    summary {
        cursor: pointer;
        color: #aaa;
    }

    summary:hover {
        color: #fff;
    }

    pre {
        background: #11111a;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
        color: #aed;
        margin: 0.5rem 0 0 0;
        white-space: pre-wrap;
    }

    .event-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .event-item {
        background: #2a2a3e;
        padding: 0.4rem;
        border-radius: 4px;
    }

    .event-type {
        color: #ff9;
        font-weight: bold;
    }

    .event-meta {
        color: #aaa;
        font-size: 0.75rem;
    }

    .event-data {
        margin-top: 0.25rem;
        padding: 0.25rem;
        background: #11111a;
        font-size: 0.7rem;
        color: #aed;
    }

    .empty {
        color: #666;
        font-style: italic;
    }
</style>
