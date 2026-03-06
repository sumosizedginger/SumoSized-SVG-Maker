import { generators, getGenerator } from "$lib/engine/core/registry";
import * as storage from "$lib/services/storage";
import { HistoryManager } from "./history.svelte";
import type { Preset } from "$lib/services/storage";
import type {
	SVGGenerator,
	Layer,
	BlendMode,
	PaintTool,
} from "$lib/engine/core/types";
import { logRender, logError } from "$lib/services/telemetry.svelte";
import LZString from "lz-string";
import { STARTER_TEMPLATES, type StarterTemplate } from "$lib/engine/core/starters";
import { filterDefinitions } from "$lib/engine/generators/filters";

class AppState {
	layers = $state<Layer[]>([]);
	activeLayerId = $state<string | null>(null);
	userPresets = $state<Preset[]>([]);
	simpleMode = $state(false); // Default to showing all parameters for discovery
	isGalleryOpen = $state(false); // Controls global modal visibility
	activeTool: PaintTool = $state("pointer");
	documentViewBox = $state({ x: 0, y: 0, w: 100, h: 100 }); // Global canvas viewport

	private historyManager = new HistoryManager();

	get canUndo() {
		return this.historyManager.canUndo;
	}
	get canRedo() {
		return this.historyManager.canRedo;
	}

	activeLayer = $derived(
		this.layers.find((l) => l.id === this.activeLayerId) || null,
	);
	activeGenerator = $derived(
		this.activeLayer ? getGenerator(this.activeLayer.generatorId) : null,
	);

	renderedSvg = $derived.by(() => {
		const start = performance.now();
		try {
			let innerSvgs = "";

			for (const layer of this.layers) {
				if (!layer.visible) continue;
				const gen = getGenerator(layer.generatorId);
				if (!gen) continue;

				let svgString = gen.render(layer.params, layer.seed);

				// Strip the outer <svg> wrapper from generator output.
				// Generators return full SVG documents with their own viewBox,
				// but we compose them inside a single outer SVG. Nested SVGs
				// with percentage widths break when the outer viewBox changes (crop/zoom).
				svgString = svgString
					.replace(/^<svg[^>]*>/, "")
					.replace(/<\/svg>\s*$/, "");

				const blendStyle = `mix-blend-mode: ${layer.blendMode}; opacity: ${layer.opacity};`;

				const tr = layer.transforms || {
					x: 0,
					y: 0,
					scaleX: 1,
					scaleY: 1,
					rotation: 0,
				};
				// Fallback for older saved states
				const sx =
					tr.scaleX !== undefined
						? tr.scaleX
						: (tr as any).scale || 1;
				const sy =
					tr.scaleY !== undefined
						? tr.scaleY
						: (tr as any).scale || 1;
				const transformAttr = `transform="translate(${tr.x}, ${tr.y}) scale(${sx}, ${sy}) rotate(${tr.rotation}, 50, 50)"`;

				let filterAttr = "";
				if (layer.filter && filterDefinitions[layer.filter.type]) {
					filterAttr = `filter="url(#filter-${layer.id})"`;
				}

				let maskAttr = "";
				if (layer.maskLayerId) {
					maskAttr = `mask="url(#mask-${layer.id})"`;
				}

				innerSvgs += `\n<!-- Layer: ${layer.name} -->\n<g class="layer-${layer.id}" role="graphics-object" aria-label="${layer.name}" style="${blendStyle}" ${transformAttr} ${filterAttr} ${maskAttr}>\n${svgString}\n</g>\n`;
			}

			// Generate Global Defs (Filters & Masks)
			let defContent = "";
			for (const layer of this.layers) {
				if (layer.filter && filterDefinitions[layer.filter.type]) {
					const filterDef = filterDefinitions[layer.filter.type];
					defContent += filterDef.render(layer.filter.params, `filter-${layer.id}`);
				}
				if (layer.maskLayerId) {
					const maskSourceLayer = this.layers.find(l => l.id === layer.maskLayerId);
					if (maskSourceLayer) {
						const gen = getGenerator(maskSourceLayer.generatorId);
						if (gen) {
							let maskSvg = gen.render(maskSourceLayer.params, maskSourceLayer.seed);
							maskSvg = maskSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
							defContent += `\n<mask id="mask-${layer.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">\n${maskSvg}\n</mask>\n`;
						}
					}
				}
			}

			const defs = defContent ? `<defs>\n${defContent}\n</defs>\n` : "";

			const composedSvg = `<svg viewBox="${this.documentViewBox.x} ${this.documentViewBox.y} ${this.documentViewBox.w} ${this.documentViewBox.h}" \n     xmlns="http://www.w3.org/2000/svg" \n     width="100%" height="100%" \n     role="graphics-document" \n     aria-label="SumoSized SVG Composition">\n${defs}${innerSvgs}</svg>`;

			const duration = performance.now() - start;
			setTimeout(() => {
				logRender("composite", duration);
			}, 0);
			return composedSvg;
		} catch (e) {
			console.error("Render failed", e);
			setTimeout(() => {
				logError("composite", "RENDER_CRASH", String(e));
			}, 0);
			return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#fee"/><text x="50" y="50" text-anchor="middle" fill="red" font-family="sans-serif" font-size="8">Render Error</text></svg>`;
		}
	});

	constructor() {
		if (typeof window !== "undefined") {
			this.init();

			// Listen for hash changes to support remote state injection
			window.addEventListener("hashchange", () => this.loadFromHash());
		}
	}

	private mergeParams(
		defaults: Record<string, any>,
		saved: Record<string, any>,
	) {
		const cleanedSaved = Object.fromEntries(
			Object.entries(saved).filter(([_, v]) => v != null && v !== ""),
		);
		return { ...defaults, ...cleanedSaved };
	}

	init() {
		// One-time migration: nuke all corrupted states
		const CURRENT_VERSION = "4"; // bumped for layers
		const savedVersion = localStorage.getItem("sumo_svg_version");
		if (savedVersion !== CURRENT_VERSION) {
			const keysToRemove: string[] = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (
					key &&
					(key.startsWith("sumo_svg_state_") ||
						key === "sumo_svg_last_generator" ||
						key === "sumo_svg_composition_state")
				) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((k) => localStorage.removeItem(k));
			localStorage.setItem("sumo_svg_version", CURRENT_VERSION);
		}

		const savedState = storage.getCompositionState();
		if (savedState && savedState.length > 0) {
			this.layers = savedState;
			this.activeLayerId = this.layers[this.layers.length - 1].id;
		} else {
			// "Golden Preset" Onboarding Setup
			this.addGoldenPreset();
			// Automatically pop open the Gallery on first visit so they know it exists!
			this.isGalleryOpen = true;
		}

		// Try to load from URL hash if present (overrides local storage)
		this.loadFromHash();

		// Load user presets
		this.userPresets = storage.getUserPresets();

		// Initial commit
		this.commit();
	}

	serializeState(): string {
		const state = {
			l: this.layers.map((l) => ({
				id: l.id,
				n: l.name,
				g: l.generatorId,
				p: l.params,
				s: l.seed,
				v: l.visible,
				b: l.blendMode,
				o: l.opacity,
				t: l.transforms,
				f: l.filter,
				m: l.maskLayerId,
			})),
			v: {
				x: this.documentViewBox.x,
				y: this.documentViewBox.y,
				w: this.documentViewBox.w,
				h: this.documentViewBox.h,
			},
		};
		const json = JSON.stringify(state);
		return LZString.compressToEncodedURIComponent(json);
	}

	loadFromHash() {
		if (typeof window === "undefined") return;
		const hash = window.location.hash.substring(1);
		if (!hash || hash.length < 10) return;

		try {
			const decompressed =
				LZString.decompressFromEncodedURIComponent(hash);
			if (!decompressed) return;

			const data = JSON.parse(decompressed);
			if (data && data.l) {
				this.layers = data.l.map((l: any) => ({
					id: l.id || Math.random().toString(36).substring(2, 9),
					name: l.n || "Imported Layer",
					generatorId: l.g,
					params: l.p,
					seed: l.s,
					visible: l.v !== undefined ? l.v : true,
					blendMode: l.b || "normal",
					opacity: l.o !== undefined ? l.o : 1.0,
					transforms: l.t
						? {
							x: l.t.x || 0,
							y: l.t.y || 0,
							scaleX:
								l.t.scaleX !== undefined
									? l.t.scaleX
									: l.t.scale || 1,
							scaleY:
								l.t.scaleY !== undefined
									? l.t.scaleY
									: l.t.scale || 1,
							rotation: l.t.rotation || 0,
							cropX: l.t.cropX,
							cropY: l.t.cropY,
							cropW: l.t.cropW,
							cropH: l.t.cropH,
						}
						: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
					filter: l.f,
					maskLayerId: l.m,
				}));
				if (this.layers.length > 0) {
					this.activeLayerId = this.layers[this.layers.length - 1].id;
				}

				if (data.v) {
					this.documentViewBox = {
						x: data.v.x,
						y: data.v.y,
						w: data.v.w,
						h: data.v.h,
					};
				} else {
					this.documentViewBox = { x: 0, y: 0, w: 100, h: 100 };
				}

				console.log("State successfully loaded from URL hash");
			}
		} catch (e) {
			console.error("Failed to parse state from hash", e);
		}
	}

	updateUrlHash() {
		if (typeof window === "undefined") return;
		const hash = this.serializeState();
		// Use replaceState so we don't spam the browser back-history,
		// but the address bar always accurately reflects the shareable URL!
		window.history.replaceState(null, "", `#${hash}`);
	}

	generateShareUrl(): string {
		const hash = this.serializeState();
		return `${window.location.origin}${window.location.pathname}#${hash}`;
	}

	addLayer(generatorId: string, initialParams?: Record<string, any>) {
		const gen = getGenerator(generatorId);
		if (!gen) return;

		const newLayer: Layer = {
			id: Math.random().toString(36).substring(2, 9),
			name: `${gen.name} Layer`,
			generatorId: gen.id,
			params: initialParams
				? { ...gen.defaultParams, ...initialParams }
				: { ...gen.defaultParams },
			seed: Math.floor(Math.random() * 1000000),
			visible: true,
			blendMode: "normal",
			opacity: 1.0,
			transforms: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
			filter: undefined,
			maskLayerId: undefined,
		};

		this.layers = [...this.layers, newLayer];
		this.activeLayerId = newLayer.id;
		this.commit();
	}

	setGenerator(id: string) {
		// In layer mode, if they click a generator, we ADD it as a new layer.
		this.addLayer(id);
	}

	removeLayer(id: string) {
		this.layers = this.layers.filter((l) => l.id !== id);
		if (this.activeLayerId === id) {
			this.activeLayerId =
				this.layers.length > 0
					? this.layers[this.layers.length - 1].id
					: null;
		}
		this.commit();
	}

	updateLayer(id: string, updates: Partial<Layer>) {
		this.layers = this.layers.map((l) =>
			l.id === id ? { ...l, ...updates } : l,
		);
		this.commit();
	}

	updateParam(key: string, value: any) {
		if (!this.activeLayerId) return;
		this.layers = this.layers.map((l) => {
			if (l.id === this.activeLayerId) {
				return { ...l, params: { ...l.params, [key]: value } };
			}
			return l;
		});
		this.commit();
	}

	fitLayerToCanvas(id: string) {
		this.layers = this.layers.map((l) => {
			if (l.id === id) {
				if (typeof document !== "undefined") {
					const g = document.querySelector(
						`.layer-${id}`,
					) as SVGGElement | null;
					if (g) {
						try {
							const b = g.getBBox();
							const baseW = Math.max(0.1, b.width);
							const baseH = Math.max(0.1, b.height);
							// Fit uniformly
							const scale = Math.min(100 / baseW, 100 / baseH);
							const scaledW = baseW * scale;
							const scaledH = baseH * scale;
							// Center it in 100x100
							const tx = 50 - scaledW / 2 - b.x * scale;
							const ty = 50 - scaledH / 2 - b.y * scale;

							return {
								...l,
								transforms: {
									...l.transforms,
									x: Number(tx.toFixed(2)),
									y: Number(ty.toFixed(2)),
									scaleX: Number(scale.toFixed(4)),
									scaleY: Number(scale.toFixed(4)),
									rotation: 0,
								},
							};
						} catch (e) { }
					}
				}
			}
			return l;
		});
		this.commit();
	}

	centerLayer(id: string) {
		this.layers = this.layers.map((l) => {
			if (l.id === id) {
				if (typeof document !== "undefined") {
					const g = document.querySelector(
						`.layer-${id}`,
					) as SVGGElement | null;
					if (g) {
						try {
							const b = g.getBBox();
							const tr = l.transforms;
							const scaledW = b.width * tr.scaleX;
							const scaledH = b.height * tr.scaleY;
							const tx = 50 - scaledW / 2 - b.x * tr.scaleX;
							const ty = 50 - scaledH / 2 - b.y * tr.scaleY;

							return {
								...l,
								transforms: {
									...l.transforms,
									x: Number(tx.toFixed(2)),
									y: Number(ty.toFixed(2)),
								},
							};
						} catch (e) { }
					}
				}
			}
			return l;
		});
		this.commit();
	}

	randomizeSeed() {
		if (!this.activeLayerId) return;
		this.layers = this.layers.map((l) => {
			if (l.id === this.activeLayerId) {
				return { ...l, seed: Math.floor(Math.random() * 1000000) };
			}
			return l;
		});
		this.commit();
	}

	setGlobalCrop(x: number, y: number, w: number, h: number) {
		if (w <= 0 || h <= 0) return;
		this.documentViewBox = { x, y, w, h };
		this.commit();
		// Drop tool down to pointer so they don't accidentally crop again immediately
		this.activeTool = "pointer";
	}

	resetGlobalCrop() {
		this.documentViewBox = { x: 0, y: 0, w: 100, h: 100 };
		this.commit();
	}

	addGoldenPreset() {
		const golden = STARTER_TEMPLATES.find((t) => t.id === "golden-core");
		if (golden) {
			this.applyStarter(golden);
		}
	}

	applyStarter(starter: StarterTemplate) {
		this.layers = starter.layers.map((l) => {
			const gen = getGenerator(l.generatorId!);
			return {
				id: Math.random().toString(36).substring(2, 9),
				name: l.name || `${gen?.name} Layer`,
				generatorId: l.generatorId!,
				params: { ...gen?.defaultParams, ...(l.params || {}) },
				seed: Math.floor(Math.random() * 1000000),
				visible: true,
				blendMode: l.blendMode || "normal",
				opacity: l.opacity !== undefined ? l.opacity : 1.0,
				transforms: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
			} as Layer;
		});
		if (this.layers.length > 0) {
			this.activeLayerId = this.layers[this.layers.length - 1].id;
		}
		this.commit();
	}

	generateVariants(count: number = 4) {
		const variants: { layers: Layer[]; svg: string }[] = [];
		if (this.layers.length === 0) return variants;

		for (let i = 0; i < count; i++) {
			const variantLayers = this.layers.map((layer) => {
				const gen = getGenerator(layer.generatorId);
				if (!gen) return layer;

				const variantSeed = Math.floor(Math.random() * 1000000);
				const variantParams = { ...layer.params };

				for (const paramDef of gen.params) {
					if (
						paramDef.type === "number" ||
						paramDef.type === "integer"
					) {
						const min = paramDef.min ?? 0;
						const max = paramDef.max ?? 100;
						const range = max - min;
						const jitter = (Math.random() * 0.3 - 0.15) * range;
						let val =
							(variantParams[paramDef.name] ?? paramDef.default) +
							jitter;
						val = Math.max(min, Math.min(max, val));
						if (paramDef.type === "integer") val = Math.round(val);
						variantParams[paramDef.name] = val;
					} else if (paramDef.type === "boolean") {
						if (Math.random() < 0.2)
							variantParams[paramDef.name] =
								!variantParams[paramDef.name];
					}
				}

				return { ...layer, params: variantParams, seed: variantSeed };
			});

			try {
				let innerSvgs = "";
				for (const layer of variantLayers) {
					if (!layer.visible) continue;
					const gen = getGenerator(layer.generatorId);
					if (!gen) continue;

					const svgString = gen.render(layer.params, layer.seed);
					const blendStyle = `mix-blend-mode: ${layer.blendMode}; opacity: ${layer.opacity};`;
					const tr = layer.transforms || {
						x: 0,
						y: 0,
						scaleX: 1,
						scaleY: 1,
						rotation: 0,
					};
					const sx =
						tr.scaleX !== undefined
							? tr.scaleX
							: (tr as any).scale || 1;
					const sy =
						tr.scaleY !== undefined
							? tr.scaleY
							: (tr as any).scale || 1;
					const transformAttr = `transform="translate(${tr.x}, ${tr.y}) scale(${sx}, ${sy}) rotate(${tr.rotation}, 50, 50)"`;

					let clipDef = "";
					let clipAttr = "";
					if (tr.cropW && tr.cropH) {
						clipDef = `<clipPath id="crop-${layer.id}"><rect x="${tr.cropX || 0}" y="${tr.cropY || 0}" width="${tr.cropW}" height="${tr.cropH}" /></clipPath>`;
						clipAttr = `clip-path="url(#crop-${layer.id})"`;
					}
					innerSvgs += `\n${clipDef}<g class="layer-${layer.id}" style="${blendStyle}" ${transformAttr} ${clipAttr}>\n${svgString}\n</g>\n`;
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
		this.updateUrlHash();
	}

	// --- History Control ---

	commit() {
		this.historyManager.commit({
			layers: this.layers,
			viewBox: this.documentViewBox,
		});
		this.saveState();
	}

	undo() {
		const state = this.historyManager.undo();
		if (state) {
			this.layers = state.layers;
			this.documentViewBox = state.viewBox;
			// Restore active layer if possible
			if (
				this.layers.length > 0 &&
				(!this.activeLayerId ||
					!this.layers.find((l) => l.id === this.activeLayerId))
			) {
				this.activeLayerId = this.layers[this.layers.length - 1].id;
			}
			this.saveState();
		}
	}

	redo() {
		const state = this.historyManager.redo();
		if (state) {
			this.layers = state.layers;
			this.documentViewBox = state.viewBox;
			// Restore active layer if possible
			if (
				this.layers.length > 0 &&
				(!this.activeLayerId ||
					!this.layers.find((l) => l.id === this.activeLayerId))
			) {
				this.activeLayerId = this.layers[this.layers.length - 1].id;
			}
			this.saveState();
		}
	}

	savePreset(name: string) {
		const preset: Preset = {
			id: Math.random().toString(36).substr(2, 9),
			name,
			layers: JSON.parse(JSON.stringify(this.layers)), // deep copy
			createdAt: Date.now(),
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
		this.commit();
	}
}

export const appState = new AppState();
