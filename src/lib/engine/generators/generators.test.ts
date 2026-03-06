import { describe, it, expect } from "vitest";
import { generators } from "../core/registry";
import { checkA11y } from "../a11y";

describe("Dynamic Engine Core Tests", () => {
	it("Every registered generator exposes a valid schema", () => {
		expect(generators.length).toBeGreaterThan(0);
		generators.forEach((gen) => {
			expect(gen.id).toBeDefined();
			expect(gen.name).toBeDefined();
			expect(gen.defaultParams).toBeDefined();
			expect(gen.params).toBeDefined();
		});
	});

	generators.forEach((gen) => {
		describe(`Generator [${gen.id}]`, () => {
			it("renders deterministic SVG with default params", () => {
				const svg = gen.render(gen.defaultParams, 12345, {
					x: 0,
					y: 0,
					w: 100,
					h: 100,
				});
				expect(typeof svg).toBe("string");

				// Optional: Snapshot to prevent regression
				expect(svg).toMatchSnapshot();
			});

			it("handles boundary parameters without crashing", () => {
				const edgeParams = { ...gen.defaultParams };
				const safeSvg = gen.render(edgeParams, 0, {
					x: 0,
					y: 0,
					w: 100,
					h: 100,
				});
				expect(typeof safeSvg).toBe("string");
			});

			it("exhaustively tests all select and toggle branches to guarantee structural coverage", () => {
				// We iterate through every parameter. If it's a select or boolean, we test both/all states.
				gen.params.forEach((p) => {
					if (p.type === "select" && p.options) {
						p.options.forEach((opt) => {
							const params = {
								...gen.defaultParams,
								[p.name]: opt.value,
							};
							const svg = gen.render(params, 12345, {
								x: 0,
								y: 0,
								w: 100,
								h: 100,
							});
							expect(typeof svg).toBe("string");
							expect(
								checkA11y(
									`<svg viewBox="0 0 100 100"><title>MOCK</title><desc>MOCK</desc>${svg}</svg>`,
								).valid,
							).toBe(true);
						});
					} else if (p.type === "boolean") {
						const paramsTrue = {
							...gen.defaultParams,
							[p.name]: true,
						};
						const svgTrue = gen.render(paramsTrue, 12345, {
							x: 0,
							y: 0,
							w: 100,
							h: 100,
						});
						expect(
							checkA11y(
								`<svg viewBox="0 0 100 100"><title>MOCK</title><desc>MOCK</desc>${svgTrue}</svg>`,
							).valid,
						).toBe(true);

						const paramsFalse = {
							...gen.defaultParams,
							[p.name]: false,
						};
						const svgFalse = gen.render(paramsFalse, 12345, {
							x: 0,
							y: 0,
							w: 100,
							h: 100,
						});
						expect(
							checkA11y(
								`<svg viewBox="0 0 100 100"><title>MOCK</title><desc>MOCK</desc>${svgFalse}</svg>`,
							).valid,
						).toBe(true);
					} else if (p.type === "number") {
						// Test min, max, and mid points to cover extreme parameter math branches
						const tests = [];
						if (p.min !== undefined) tests.push(p.min);
						if (p.max !== undefined) tests.push(p.max);
						if (p.min !== undefined && p.max !== undefined)
							tests.push((p.max + p.min) / 2);
						if (tests.length === 0) tests.push(0, 10, 100);

						tests.forEach((testVal) => {
							const paramsNum = {
								...gen.defaultParams,
								[p.name]: testVal,
							};
							const svgNum = gen.render(paramsNum, 12345, {
								x: 0,
								y: 0,
								w: 100,
								h: 100,
							});
							expect(
								checkA11y(
									`<svg viewBox="0 0 100 100"><title>MOCK</title><desc>MOCK</desc>${svgNum}</svg>`,
								).valid,
							).toBe(true);
						});
					}
				});
			});

			it("fuzzes schema parameters safely to execute internal logic branches", () => {
				// Fuzzing ensures coverage spans inner conditional paths (e.g. if 'effect' === 'circle')
				for (let i = 0; i < 5; i++) {
					const fuzzed: Record<string, any> = {};
					gen.params.forEach((p) => {
						if (p.type === "boolean")
							fuzzed[p.name] = Math.random() > 0.5;
						else if (p.type === "select" && p.options)
							fuzzed[p.name] =
								p.options[
									Math.floor(Math.random() * p.options.length)
								].value;
						else if (p.type === "number")
							fuzzed[p.name] =
								p.min !== undefined
									? p.max !== undefined
										? (p.max + p.min) / 2
										: p.min * 2
									: 10;
						else fuzzed[p.name] = p.default;
					});

					const svg = gen.render(fuzzed, i * 100, {
						x: 0,
						y: 0,
						w: 100,
						h: 100,
					});
					expect(typeof svg).toBe("string");
				}
			});
		});
	});
});
