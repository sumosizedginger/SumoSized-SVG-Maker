import { appState } from '$lib/state/appState.svelte';
import { generators, getGenerator } from '$lib/core/registry';
import type { ParamDefinition } from '$lib/core/types';
import type { Preset } from '$lib/services/storage';

export interface SumoSvgAppAPI {
    listGenerators(): { id: string; name: string; category: string; tags: string[] }[];
    getGeneratorSchema(id: string): {
        id: string;
        name: string;
        description: string;
        params: ParamDefinition[];
    } | null;
    getCurrentState(): {
        generatorId: string;
        params: Record<string, any>;
        seed: number;
    } | null;
    setGenerator(id: string): boolean;
    setParams(params: Record<string, any>): boolean;
    setSeed(seed: number): boolean;
    renderNow(): string; // returns SVG markup of current state
    getPreviewDataURL(): Promise<string>; // optional: data URL PNG/JPEG for critique
    savePreset(name: string, description?: string, tags?: string[]): boolean;
    listPresets(generatorId?: string): Partial<Preset>[];
}

class AgentAPI implements SumoSvgAppAPI {
    listGenerators() {
        return generators.map(g => ({
            id: g.id,
            name: g.name,
            category: g.category,
            tags: g.tags
        }));
    }

    getGeneratorSchema(id: string) {
        const gen = getGenerator(id);
        if (!gen) return null;
        return {
            id: gen.id,
            name: gen.name,
            description: gen.description,
            params: gen.params
        };
    }

    getCurrentState() {
        try {
            return {
                generatorId: appState.activeGenerator?.id || 'composition',
                params: { ...(appState.activeLayer?.params || {}) },
                seed: appState.activeLayer?.seed || 0
            };
        } catch (e) {
            console.error("AgentAPI: Failed to get current state", e);
            return null;
        }
    }

    setGenerator(idOrName: string) {
        try {
            // Try exact ID first
            let gen = getGenerator(idOrName);

            // Fallback to searching by name (case-insensitive fuzzy match)
            if (!gen) {
                gen = generators.find(g => g.name.toLowerCase().includes(idOrName.toLowerCase()));
            }

            if (!gen) return false;
            appState.setGenerator(gen.id);
            return true;
        } catch (e) {
            console.error("AgentAPI: Failed to set generator", e);
            return false;
        }
    }

    setParams(params: Record<string, any>) {
        try {
            if (appState.activeLayer && appState.activeGenerator) {
                appState.activeLayer.params = { ...appState.activeGenerator.defaultParams, ...appState.activeLayer.params, ...params };
                appState.saveState();
                return true;
            }
            return false;
        } catch (e) {
            console.error("AgentAPI: Failed to set params", e);
            return false;
        }
    }

    setSeed(seed: number) {
        try {
            if (typeof seed !== 'number') return false;
            if (appState.activeLayer) {
                appState.activeLayer.seed = seed;
                appState.saveState();
                return true;
            }
            return false;
        } catch (e) {
            console.error("AgentAPI: Failed to set seed", e);
            return false;
        }
    }

    renderNow() {
        try {
            return appState.renderedSvg;
        } catch (e) {
            console.error("AgentAPI: Failed to render", e);
            return "";
        }
    }

    async getPreviewDataURL() {
        try {
            const svg = appState.renderedSvg;
            return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        } catch (e) {
            console.error("AgentAPI: Failed to get preview data URL", e);
            return "";
        }
    }

    savePreset(name: string, description?: string, tags?: string[]) {
        try {
            // The appState.savePreset just takes a name currently, ignoring desc and tags for now.
            appState.savePreset(name);
            return true;
        } catch (e) {
            console.error("AgentAPI: Failed to save preset", e);
            return false;
        }
    }

    listPresets(generatorId?: string) {
        try {
            const presets = appState.userPresets;
            if (generatorId) {
                return presets.filter((p: Preset) => p.layers && p.layers.some(l => l.generatorId === generatorId));
            }
            return presets;
        } catch (e) {
            console.error("AgentAPI: Failed to list presets", e);
            return [];
        }
    }
}

export const agentApi = new AgentAPI();
