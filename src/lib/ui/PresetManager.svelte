<script lang="ts">
    import { appState } from "$lib/state/appState.svelte";

    let newPresetName = $state("");

    function handleSave() {
        if (newPresetName.trim()) {
            appState.savePreset(newPresetName.trim());
            newPresetName = "";
        }
    }
</script>

<div class="preset-manager">
    <div class="save-preset">
        <input
            type="text"
            bind:value={newPresetName}
            placeholder="Preset Name"
        />
        <button onclick={handleSave} disabled={!newPresetName.trim()}
            >Save current State</button
        >
    </div>

    <div class="preset-list">
        <h3>User Presets</h3>
        {#if appState.userPresets.length === 0}
            <p class="empty">No presets saved yet.</p>
        {:else}
            <ul>
                {#each appState.userPresets as preset}
                    <li>
                        <button
                            class="preset-btn"
                            onclick={() => appState.applyPreset(preset)}
                        >
                            {preset.name}
                            <span class="date"
                                >{new Date(
                                    preset.createdAt,
                                ).toLocaleDateString()}</span
                            >
                        </button>
                        <button
                            class="delete-btn"
                            onclick={() => appState.deletePreset(preset.id)}
                            title="Delete preset">×</button
                        >
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</div>

<style>
    .preset-manager {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1rem;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #eee;
    }

    .save-preset {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    input {
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .save-preset button {
        padding: 0.6rem;
        background: #333;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .save-preset button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    h3 {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #666;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .preset-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0.6rem;
        background: #f4f4f4;
        border: 1px solid #eee;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
    }

    .preset-btn:hover {
        background: #eee;
    }

    .date {
        font-size: 0.7rem;
        color: #888;
    }

    .delete-btn {
        width: 30px;
        background: #ff444411;
        color: #ff4444;
        border: 1px solid #ff444433;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .delete-btn:hover {
        background: #ff444422;
    }

    .empty {
        font-size: 0.85rem;
        color: #999;
        font-style: italic;
    }
</style>
