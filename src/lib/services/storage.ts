import type { Layer } from '../core/types';

export interface Preset {
    id: string;
    name: string;
    layers: Layer[];
    createdAt: number;
}

const STORAGE_KEYS = {
    COMPOSITION_STATE: 'sumo_svg_composition_state',
    USER_PRESETS: 'sumo_svg_user_presets'
};

export function saveCompositionState(layers: Layer[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPOSITION_STATE, JSON.stringify(layers));
}

export function getCompositionState(): Layer[] | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.COMPOSITION_STATE);
    return data ? JSON.parse(data) : null;
}

export function saveUserPreset(preset: Preset) {
    if (typeof window === 'undefined') return;
    const presets = getUserPresets();
    presets.push(preset);
    localStorage.setItem(STORAGE_KEYS.USER_PRESETS, JSON.stringify(presets));
}

export function getUserPresets(): Preset[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.USER_PRESETS);
    return data ? JSON.parse(data) : [];
}

export function deleteUserPreset(id: string) {
    if (typeof window === 'undefined') return;
    const presets = getUserPresets().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.USER_PRESETS, JSON.stringify(presets));
}
