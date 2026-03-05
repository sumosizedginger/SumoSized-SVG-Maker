import { describe, it, expect } from 'vitest';
import { generators } from '../core/registry';

describe('Generators', () => {
    it('Quantum Core generates deterministic SVG', () => {
        const gen = generators.find(g => g.id === 'quantum-core');
        if (!gen) throw new Error('Quantum Core not found');

        const params = {
            ...gen.defaultParams,
            complexity: 8,
            quantumGlitch: true,
            depthWeaving: true,
        };
        const svg = gen.render(params, 424242);
        expect(svg).toMatchSnapshot();
    });

    it('Sacred Geometry generates deterministic SVG', () => {
        const gen = generators.find(g => g.id === 'sacred-geometry');
        if (!gen) throw new Error('Sacred Geometry not found');

        const params = {
            ...gen.defaultParams,
            baseMatrix: 'Metatron Cube',
        };
        const svg = gen.render(params, 1337);
        expect(svg).toMatchSnapshot();
    });

    it('Simple Gradient generates deterministic SVG', () => {
        const gen = generators.find(g => g.id === 'simple-gradient');
        if (!gen) throw new Error('Simple Gradient not found');

        const svg = gen.render(gen.defaultParams, 999);
        expect(svg).toMatchSnapshot();
    });
});
