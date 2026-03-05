import type { Layer } from "../engine/core/types";

export interface HistoryState {
	layers: Layer[];
	viewBox: { x: number; y: number; w: number; h: number };
}

export class HistoryManager {
	private history = $state<HistoryState[]>([]);
	private historyIndex = $state(-1);
	private isUndoingOrRedoing = false;

	get canUndo() {
		return this.historyIndex > 0;
	}

	get canRedo() {
		return this.historyIndex < this.history.length - 1;
	}

	commit(state: HistoryState) {
		if (this.isUndoingOrRedoing) return;

		// Wipe any future history if we're branching
		if (this.historyIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.historyIndex + 1);
		}

		// Limit history to 50 steps for 2026 performance standards
		if (this.history.length >= 50) {
			this.history = this.history.slice(1);
		}

		// Deep copy state to ensure isolation
		this.history = [...this.history, JSON.parse(JSON.stringify(state))];
		this.historyIndex = this.history.length - 1;
	}

	undo(): HistoryState | null {
		if (!this.canUndo) return null;
		this.isUndoingOrRedoing = true;
		this.historyIndex--;
		const state = JSON.parse(
			JSON.stringify(this.history[this.historyIndex]),
		);
		this.isUndoingOrRedoing = false;
		return state;
	}

	redo(): HistoryState | null {
		if (!this.canRedo) return null;
		this.isUndoingOrRedoing = true;
		this.historyIndex++;
		const state = JSON.parse(
			JSON.stringify(this.history[this.historyIndex]),
		);
		this.isUndoingOrRedoing = false;
		return state;
	}

	clear() {
		this.history = [];
		this.historyIndex = -1;
	}
}
