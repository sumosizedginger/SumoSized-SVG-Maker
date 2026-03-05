import { generators, getGenerator } from '$lib/core/registry';
import * as storage from '$lib/services/storage';
import type { SVGGenerator, Layer, BlendMode } from '$lib/core/types';
import type { Preset } from '$lib/services/storage';
import { logRender, logError } from '$lib/services/telemetry.svelte';

class AppState {
    layers = $state<Layer[]>([]);
    activeLayerId = $state<string | null>(null);
    userPresets = $state<Preset[]>([]);

    activeLayer = $derived(this.layers.find(l => l.id === this.activeLayerId) || null);
    activeGenerator = $derived(this.activeLayer ? getGenerator(this.activeLayer.generatorId) : null);

    renderedSvg = $derived.by(() => {
        const start = performance.now();
        try {
            let innerSvgs = "";

            for (const layer of this.layers) {
                if (!layer.visible) continue;
                const gen = getGenerator(layer.generatorId);
                if (!gen) continue;

                const svgString = gen.render(layer.params, layer.seed);

                const blendStyle = `mix-blend-mode: ${layer.blendMode}; opacity: ${layer.opacity};`;

                innerSvgs += `\n<!-- Layer: ${layer.name} -->\n<g class="layer-${layer.id}" style="${blendStyle}">\n${svgString}\n</g>\n`;
            }

            const composedSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">\n${innerSvgs}</svg>`;

            const duration = performance.now() - start;
            setTimeout(() => {
                logRender('composite', duration);
            }, 0);
            return composedSvg;

        } catch (e) {
            console.error("Render failed", e);
            setTimeout(() => {
                logError('composite', 'RENDER_CRASH', String(e));
            }, 0);
            return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#fee"/><text x="50" y="50" text-anchor="middle" fill="red" font-family="sans-serif" font-size="8">Render Error</text></svg>`;
        }
    });

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private mergeParams(defaults: Record<string, any>, saved: Record<string, any>) {
        const cleanedSaved = Object.fromEntries(
            Object.entries(saved).filter(([_, v]) => v != null && v !== '')
        );
        return { ...defaults, ...cleanedSaved };
    }

    init() {
        // One-time migration: nuke all corrupted states
        const CURRENT_VERSION = '4'; // bumped for layers
        const savedVersion = localStorage.getItem('sumo_svg_version');
        if (savedVersion !== CURRENT_VERSION) {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sumo_svg_state_') || key === 'sumo_svg_last_generator' || key === 'sumo_svg_composition_state')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            localStorage.setItem('sumo_svg_version', CURRENT_VERSION);
        }

        const savedState = storage.getCompositionState();
        if (savedState && savedState.length > 0) {
            this.layers = savedState;
            this.activeLayerId = this.layers[this.layers.length - 1].id;
        } else {
            // Default: single layer with the first generator
            this.addLayer(generators[0].id);
        }

        // Load user presets
        this.userPresets = storage.getUserPresets();
    }

    addLayer(generatorId: string) {
        const gen = getGenerator(generatorId);
        if (!gen) return;

        const newLayer: Layer = {
            id: Math.random().toString(36).substring(2, 9),
            name: `${gen.name} Layer`,
            generatorId: gen.id,
            params: { ...gen.defaultParams },
            seed: Math.floor(Math.random() * 1000000),
            visible: true,
            blendMode: 'normal',
            opacity: 1.0
        };

        this.layers = [...this.layers, newLayer];
        this.activeLayerId = newLayer.id;
        this.saveState();
    }

    setGenerator(id: string) {
        // In layer mode, if they click a generator, we ADD it as a new layer.
        this.addLayer(id);
    }

    removeLayer(id: string) {
        this.layers = this.layers.filter(l => l.id !== id);
        if (this.activeLayerId === id) {
            this.activeLayerId = this.layers.length > 0 ? this.layers[this.layers.length - 1].id : null;
        }
        this.saveState();
    }

    updateLayer(id: string, updates: Partial<Layer>) {
        this.layers = this.layers.map(l => l.id === id ? { ...l, ...updates } : l);
        this.saveState();
    }

    updateParam(key: string, value: any) {
        if (!this.activeLayerId) return;
        this.layers = this.layers.map(l => {
            if (l.id === this.activeLayerId) {
                return { ...l, params: { ...l.params, [key]: value } };
            }
            return l;
        });
        this.saveState();
    }

    randomizeSeed() {
        if (!this.activeLayerId) return;
        this.layers = this.layers.map(l => {
            if (l.id === this.activeLayerId) {
                return { ...l, seed: Math.floor(Math.random() * 1000000) };
            }
            return l;
        });
        this.saveState();
    }

    generateVariants(count: number = 4) {
        // Generates variations across ALL layers (stacked effects) to show full composition variations
        const variants: { layers: Layer[]; svg: string }[] = [];
        if (this.layers.length === 0) return variants;

        for (let i = 0; i < count; i++) {
            const variantLayers = this.layers.map(layer => {
                const gen = getGenerator(layer.generatorId);
                if (!gen) return layer;

                const variantSeed = Math.floor(Math.random() * 1000000);
                const variantParams = { ...layer.params };

                // Jitter parameters slightly
                for (const paramDef of gen.params) {
                    if (paramDef.type === 'number' || paramDef.type === 'integer') {
                        const min = paramDef.min ?? 0;
                        const max = paramDef.max ?? 100;
                        const range = max - min;
                        // +/- 15% mutation
                        const jitter = (Math.random() * 0.3 - 0.15) * range;
                        let val = variantParams[paramDef.name] + jitter;

                        val = Math.max(min, Math.min(max, val));

                        if (paramDef.type === 'integer') {
                            val = Math.round(val);
                        }
                        variantParams[paramDef.name] = val;
                    } else if (paramDef.type === 'boolean') {
                        // 20% chance to flip toggles
                        if (Math.random() < 0.2) {
                            variantParams[paramDef.name] = !variantParams[paramDef.name];
                        }
                    }
                }

                return { ...layer, params: variantParams, seed: variantSeed };
            });

            try {
                // Render full composition
                let innerSvgs = "";
                for (const layer of variantLayers) {
                    if (!layer.visible) continue;
                    const gen = getGenerator(layer.generatorId);
                    if (!gen) continue;

                    const svgString = gen.render(layer.params, layer.seed);
                    const blendStyle = `mix-blend-mode: ${layer.blendMode}; opacity: ${layer.opacity};`;
                    innerSvgs += `\n<!-- Layer: ${layer.name} -->\n<g class="layer-${layer.id}" style="${blendStyle}">\n${svgString}\n</g>\n`;
                }

                const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="background-color: transparent;">\n${innerSvgs}</svg>`;
                variants.push({ layers: variantLayers, svg });
            } catch (e) {
                console.error("Variant generation failed", e);
            }
        }
        return variants;
    }

    saveState() {
        storage.saveCompositionState(this.layers);
    }

    savePreset(name: string) {
        const preset: Preset = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            layers: JSON.parse(JSON.stringify(this.layers)), // deep copy
            createdAt: Date.now()
        };
        storage.saveUserPreset(preset);
        this.userPresets = storage.getUserPresets();
    }

    deletePreset(id: string) {
        storage.deleteUserPreset(id);
        this.userPresets = storage.getUserPresets();
    }

    applyPreset(preset: Preset) {
        // Deep copy preset layers to avoid mutation
        this.layers = JSON.parse(JSON.stringify(preset.layers));
        if (this.layers.length > 0) {
            this.activeLayerId = this.layers[this.layers.length - 1].id;
        } else {
            this.activeLayerId = null;
        }
        this.saveState();
    }
}

export const appState = new AppState();
