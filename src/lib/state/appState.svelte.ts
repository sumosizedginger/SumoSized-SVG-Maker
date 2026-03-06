import { generators, getGenerator } from "$lib/engine/core/registry";
import * as storage from "$lib/services/storage";
import { replaceState } from "$app/navigation";
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
import {
	STARTER_TEMPLATES,
	type StarterTemplate,
} from "$lib/engine/core/starters";
import { filterDefinitions } from "$lib/engine/generators/filters";

class AppState {
	layers = $state<Layer[]>([]);
	activeLayerId = $state<string | null>(null);
	userPresets = $state<Preset[]>([]);
	simpleMode = $state(false); // Default to showing all parameters for discovery
	isGalleryOpen = $state(false); // Controls global modal visibility
	isExportDrawerOpen = $state(false); // Controls side-drawer visibility
	activeTool: PaintTool = $state("pointer");
	documentViewBox = $state({ x: 0, y: 0, w: 100, h: 100 }); // Global canvas viewport
	documentAspectRatio = $state("1:1"); // NanoBanana Standard
	currentTime = $state(0); // Current playhead position in seconds
	playbackDuration = $state(3); // Default animation length
	readonly MAX_DURATION = 10; // Production safety limit (seconds)
	renderingStatus = $state(""); // Status message for long renders

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

				let svgString = gen.render(
					layer.params,
					layer.seed,
					this.documentViewBox,
				);

				// Strip the outer <svg> wrapper from generator output.
				// Generators return full SVG documents with their own viewBox,
				// but we compose them inside a single outer SVG. Nested SVGs
				// with percentage widths break when the outer viewBox changes (crop/zoom).
				svgString = svgString
					.replace(/^<svg[^>]*>/, "")
					.replace(/<\/svg>\s*$/, "");

				const blendStyle = `mix - blend - mode: ${layer.blendMode}; opacity: ${layer.opacity}; `;

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
					maskAttr = `mask = "url(#mask-${layer.id})"`;
				}

				innerSvgs += `\n<!-- Layer: ${layer.name} -->\n<g class="layer-${layer.id}" role="graphics-object" aria-label="${layer.name}" style="${blendStyle}" ${transformAttr} ${filterAttr} ${maskAttr}>\n${svgString}\n</g>\n`;
			}

			// Generate Global Defs (Filters & Masks)
			let defContent = "";
			for (const layer of this.layers) {
				if (layer.filter && filterDefinitions[layer.filter.type]) {
					const filterDef = filterDefinitions[layer.filter.type];
					defContent += filterDef.render(
						layer.filter.params,
						`filter-${layer.id}`,
					);
				}
				if (layer.maskLayerId) {
					const maskSourceLayer = this.layers.find(
						(l) => l.id === layer.maskLayerId,
					);
					if (maskSourceLayer) {
						const gen = getGenerator(maskSourceLayer.generatorId);
						if (gen) {
							let maskSvg = gen.render(
								maskSourceLayer.params,
								maskSourceLayer.seed,
								this.documentViewBox,
							);
							maskSvg = maskSvg
								.replace(/^<svg[^>]*>/, "")
								.replace(/<\/svg>\s*$/, "");
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

			// 2026 Headless API: Elite Interface for Agents & Browser Subagents
			(window as any).SumoSvgApp = {
				ready: async () => true,
				listGenerators: () =>
					generators.map((g) => ({
						id: g.id,
						name: g.name,
						category: g.category,
					})),
				setGenerator: (id: string) => this.setGenerator(id),
				updateParam: (key: string, value: any) =>
					this.updateParam(key, value),
				renderNow: () => this.renderedSvg,
				exportPng: (options?: any) =>
					this.renderComposition("png", options),
				exportMov: (options?: any) =>
					this.renderComposition("mov", options),
				exportMp4: (options?: any) =>
					this.renderComposition("mp4", options),
				exportSvg: (options?: any) =>
					this.renderComposition("svg", options),
				getState: () => this.serializeState(),
				loadState: (hash: string) => {
					window.location.hash = hash;
					this.loadFromHash();
				},
			};

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
			const DEFAULT_TRANSFORMS = {
				x: 0,
				y: 0,
				scaleX: 1,
				scaleY: 1,
				rotation: 0,
			};
			this.layers = savedState.map((l: any) => ({
				...l,
				transforms: l.transforms
					? { ...DEFAULT_TRANSFORMS, ...l.transforms }
					: DEFAULT_TRANSFORMS,
			}));
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

	private async saveBlobToDisk(blob: Blob, suggestedName: string) {
		const mimeType = blob.type.split(";")[0].trim();

		// 1. Native File System Access API (Elite / 100/100)
		// This is the ONLY way to guarantee human-readable names in 2026 Chromium on localhost.
		if ("showSaveFilePicker" in window) {
			try {
				const extension = suggestedName.split(".").pop() || "";
				const handle = await (window as any).showSaveFilePicker({
					suggestedName,
					types: [
						{
							description: `${extension.toUpperCase()} File`,
							accept: { [mimeType]: [`.${extension}`] },
						},
					],
				});
				const writable = await handle.createWritable();
				await writable.write(blob);
				await writable.close();
				console.log(`[Save] Native Save Successful: ${suggestedName}`);
				return;
			} catch (err: any) {
				if (err.name === "AbortError") return;
				console.warn(
					"[Save] Native picker failed or cancelled, falling back to legacy link.",
					err,
				);
			}
		}

		// 2. Legacy Fallback (Subject to GUID renaming on localhost/2026)
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = suggestedName;
		document.body.appendChild(link);
		link.click();
		setTimeout(() => {
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, 100);

		console.log(
			`[Save] Legacy Link Triggered: ${suggestedName} (Potential browser rename on localhost)`,
		);
	}

	toggleExportDrawer() {
		this.isExportDrawerOpen = !this.isExportDrawerOpen;
	}

	setCurrentTime(time: number) {
		this.currentTime = Math.max(0, Math.min(time, this.playbackDuration));
	}

	setDocumentAspectRatio(ratio: string) {
		this.documentAspectRatio = ratio;
		const [w, h] = ratio.split(":").map(Number);
		if (!isNaN(w) && !isNaN(h)) {
			// TOP-LEFT ANCHOR logic (Elite/100/100)
			// We ensure the 100x100 art space is ALWAYS visible.
			// Instead of cropping the 100 area, we expand the viewBox to fit the ratio
			// while keeping the 100-base dimension.
			if (w >= h) {
				// Landscape: Height is 100, Width expands
				this.documentViewBox.h = 100;
				this.documentViewBox.w = 100 * (w / h);
				this.documentViewBox.x = (100 - this.documentViewBox.w) / 2; // Center horizontally
				this.documentViewBox.y = 0;
			} else {
				// Portrait: Width is 100, Height expands
				this.documentViewBox.w = 100;
				this.documentViewBox.h = 100 * (h / w);
				this.documentViewBox.y = (100 - this.documentViewBox.h) / 2; // Center vertically
				this.documentViewBox.x = 0;
			}
		}
		this.commit();
	}

	toggleLayerSelection(id: string) {
		const layer = this.layers.find((l) => l.id === id);
		if (layer) {
			layer.selected = !layer.selected;
		}
	}

	toggleSelectAll(selected: boolean) {
		for (const layer of this.layers) {
			layer.selected = selected;
		}
	}

	async exportOriginalAssets() {
		// Filter layers that are selected. If none are selected, use all import layers as a fallback convenience.
		const selectedLayers = this.layers.filter((l) => l.selected);
		const targetLayers =
			selectedLayers.length > 0 ? selectedLayers : this.layers;

		const assets = targetLayers
			.filter((l) => l.generatorId === "unified-import" && l.params.url)
			.map((l) => ({
				id: l.id,
				name: l.params.name || l.name || `asset-${l.id}`,
				url: l.params.url,
				type: l.params.sourceType,
			}));

		if (assets.length === 0) {
			alert(
				"No imported assets found to export. Use the 'Import' button first!",
			);
			return;
		}

		console.log(
			`[Export] Professional Bundle initialized for ${assets.length} assets...`,
		);

		try {
			const JSZip = (await import("jszip")).default;
			const zip = new JSZip();
			const folder = zip.folder("sumosized-assets");

			for (const asset of assets) {
				let fileContent: any;
				let fileName = asset.name;

				if (!fileName.includes(".")) {
					const ext =
						asset.type === "svg"
							? ".svg"
							: asset.type === "video"
								? ".mp4"
								: ".png";
					fileName += ext;
				}

				if (
					asset.type === "svg" &&
					asset.url.trim().startsWith("<svg")
				) {
					fileContent = asset.url.trim();
				} else if (asset.url.startsWith("data:")) {
					const base64Data = asset.url.split(",")[1];
					fileContent = base64Data;
					folder?.file(fileName, fileContent, { base64: true });
					continue;
				} else {
					const response = await fetch(asset.url);
					fileContent = await response.blob();
				}

				folder?.file(fileName, fileContent);
			}

			const content = await zip.generateAsync({ type: "blob" });
			const zipName = `SumoSized_Assets_${new Date().toISOString().split("T")[0]}.zip`;

			await this.saveBlobToDisk(content, zipName);
			alert(
				`Elite Export Success: ${zipName} saved via Native File System. 🦾⚡🇺🇸`,
			);
		} catch (err) {
			console.error("[Export] ZIP process failed:", err);
			alert("Hybrid export failed. Opening assets in individual tabs...");
			for (const asset of assets) {
				window.open(asset.url, "_blank");
			}
		}
	}

	async exportLayerAsset(layerId: string) {
		const layer = this.layers.find((l) => l.id === layerId);
		if (
			!layer ||
			layer.generatorId !== "unified-import" ||
			!layer.params.url
		) {
			alert("This layer has no recoverable original asset.");
			return;
		}

		const asset = {
			name: layer.params.name || layer.name || `asset-${layer.id}`,
			url: layer.params.url,
			type: layer.params.sourceType,
		};

		console.log(`[Export] Recovering individual asset: ${asset.name}...`);

		try {
			let content: Blob;
			let suggestedName = asset.name;

			// Force correct extension if missing
			if (!suggestedName.includes(".")) {
				const ext =
					asset.type === "svg"
						? ".svg"
						: asset.type === "video"
							? ".mp4"
							: ".png";
				suggestedName += ext;
			}

			if (asset.type === "svg" && asset.url.trim().startsWith("<svg")) {
				content = new Blob([asset.url.trim()], {
					type: "image/svg+xml",
				});
			} else {
				const response = await fetch(asset.url);
				content = await response.blob();
			}

			const mimeType =
				content.type ||
				(asset.type === "video" ? "video/mp4" : "image/png");
			const extension = suggestedName.slice(
				suggestedName.lastIndexOf("."),
			);

			// INDUSTRY STANDARD: Use File System Access API for 100/100 naming reliability
			if ("showSaveFilePicker" in window) {
				try {
					const handle = await (window as any).showSaveFilePicker({
						suggestedName,
						types: [
							{
								description: "Original Asset",
								accept: { [mimeType]: [extension] },
							},
						],
					});
					const writable = await handle.createWritable();
					await writable.write(content);
					await writable.close();
					console.log(
						`[Export] Individual Recovery Complete: ${suggestedName}`,
					);
					return;
				} catch (err: any) {
					if (err.name === "AbortError") return;
					console.warn(
						"[Export] Native pick failed for individual asset, falling back to anchor:",
						err,
					);
				}
			}

			// Fallback: Classic Anchor Trigger
			const link = document.createElement("a");
			link.href = URL.createObjectURL(content);
			link.download = suggestedName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			console.error("[Export] Individual recovery failed:", err);
			alert("Failed to recover original asset.");
		}
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

	private updateUrlHash() {
		if (typeof window === "undefined") return;
		const hash = this.serializeState();

		try {
			// SvelteKit's replaceState requires the router to be initialized.
			// We use a try-catch to fallback to native history if the router isn't ready yet.
			replaceState(`#${hash}`, {});
			console.log("[State] URL updated via SvelteKit replaceState");
		} catch (e) {
			// Fallback for early initialization
			window.history.replaceState(null, "", `#${hash}`);
			console.log(
				"[State] URL updated via native history (Router not ready)",
			);
		}
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
						} catch (e) {}
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
						} catch (e) {}
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

					const svgString = gen.render(
						layer.params,
						layer.seed,
						this.documentViewBox,
					);
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

	async renderComposition(
		format:
			| "png"
			| "mov"
			| "gif"
			| "svg"
			| "jpeg"
			| "webp"
			| "webm"
			| "mp4",
		options: {
			width?: number;
			height?: number;
			fps?: number;
			duration?: number;
		} = {},
	) {
		// ELITE TARGETING: Find the main preview SVG, not UI icons!
		const svgElement = document.querySelector(
			".svg-wrapper > svg",
		) as SVGSVGElement | null;
		if (!svgElement) {
			console.error(
				"Export failed: Preview SVG element not found in .svg-wrapper",
			);
			return;
		}

		const { width = 2000, height = 2000, fps = 24, duration = 3 } = options;

		try {
			let blob: Blob;

			if (format === "svg") {
				blob = new Blob([this.renderedSvg], {
					type: "image/svg+xml;charset=utf-8",
				});
			} else if (
				format === "png" ||
				format === "jpeg" ||
				format === "webp"
			) {
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d")!;
				const svgBlob = new Blob([this.renderedSvg], {
					type: "image/svg+xml;charset=utf-8",
				});
				const url = URL.createObjectURL(svgBlob);
				const img = new Image();

				blob = await new Promise((resolve) => {
					img.onload = () => {
						// JPEGs don't support transparency, so we always fill black
						ctx.fillStyle = "black";
						ctx.fillRect(0, 0, width, height);
						ctx.drawImage(img, 0, 0, width, height);
						URL.revokeObjectURL(url);

						const mimeType =
							format === "jpeg"
								? "image/jpeg"
								: format === "webp"
									? "image/webp"
									: "image/png";
						canvas.toBlob((b) => resolve(b!), mimeType, 0.95);
					};
					img.src = url;
				});
			} else {
				// Animated formats (MOV, GIF)
				const { mediaService } =
					await import("$lib/services/mediaService");
				blob = await mediaService.exportAnimation(
					format as "mov" | "gif" | "webm" | "mp4",
					duration,
					fps,
					width,
					height,
				);
			}

			// Download the final asset using the Smart Save utility
			const fileName = `sumosized-render.${format}`;
			await this.saveBlobToDisk(blob, fileName);
		} catch (error) {
			console.error("Composition Render Failed", error);
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
