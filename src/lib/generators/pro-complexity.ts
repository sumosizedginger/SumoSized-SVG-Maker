import type { SVGGenerator } from '../core/types';
import { getPalette, getPaletteRole } from '../core/palettes';

// Helper for seeded random numbers
const seededRandom = (seed: number) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const quantumCoreGenerator: SVGGenerator = {
    id: 'quantum-core',
    name: 'Quantum Core',
    description: 'Face-melting mathematical spirographs with true Sacred Geometry, hyper-dimensional symmetry, and intense native SVG neon filters.',
    category: 'Abstract',
    tags: ['pro', 'math', 'glow', 'neon', 'spirograph', 'complex', 'sacred', 'geometry', 'metatron'],
    version: '2.0.0',
    params: [
        { name: 'complexity', label: 'Harmonic Complexity', type: 'integer', min: 1, max: 100, step: 1, default: 12, group: 'Math Settings' },
        { name: 'frequencyRatio', label: 'Frequency Ratio', type: 'number', min: 0.1, max: 20, step: 0.001, default: 1.618, group: 'Math Settings' },
        { name: 'symmetry', label: 'Symmetry Fold', type: 'integer', min: 1, max: 36, step: 1, default: 6, group: 'Math Settings' },
        { name: 'amplitude', label: 'Core Amplitude', type: 'number', min: 5, max: 80, step: 1, default: 35, group: 'Math Settings' },
        { name: 'glowIntensity', label: 'Neon Overdrive', type: 'number', min: 0, max: 20, step: 0.5, default: 8, group: 'Effects' },
        { name: 'lineWidth', label: 'Core Line Thickness', type: 'number', min: 0.05, max: 2, step: 0.05, default: 0.3, group: 'Geometry' },
        { name: 'depthWeaving', label: 'Alpha Interlacing Mask', type: 'boolean', default: false, group: 'Geometry' },
        { name: 'paletteId', label: 'Neon Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
        { name: 'overrideColor', label: 'Override Color', type: 'color', default: '#00f5d4', group: 'Colors' },
        { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
        { name: 'quantumGlitch', label: 'Quantum Glitch', type: 'boolean', default: false, group: 'Effects' },
        { name: 'glitchIntensity', label: 'Glitch Intensity', type: 'number', min: 1, max: 100, step: 1, default: 15, group: 'Effects' },
        { name: 'transparent', label: 'Transparent Background', type: 'boolean', default: false, group: 'Background' }
    ],
    defaultParams: {
        sacredMode: 'Metatron Cube',
        complexity: 12,
        frequencyRatio: 1.618,
        symmetry: 6,
        amplitude: 35,
        glowIntensity: 8,
        lineWidth: 0.3,
        depthWeaving: false,
        paletteId: 'neon-vibe',
        overrideColor: '#00f5d4',
        usePalette: true,
        quantumGlitch: false,
        glitchIntensity: 15,
        transparent: false
    },
    render: (params, seed) => {
        let currentSeed = seed;
        const random = () => seededRandom(currentSeed++);

        const {
            sacredMode,
            complexity,
            frequencyRatio,
            symmetry,
            amplitude,
            glowIntensity,
            lineWidth,
            depthWeaving,
            quantumGlitch,
            glitchIntensity,
            paletteId,
            overrideColor,
            usePalette,
            transparent
        } = params;

        let colors = [overrideColor];
        if (usePalette) {
            const pal = getPalette(paletteId);
            if (pal) colors = pal.colors;
        }

        const bgColors = ['#05050a', '#020205', '#080510', '#0a0005'];
        const bgColor = bgColors[Math.floor(random() * bgColors.length)];

        let svgMarkup = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background-color: ${transparent ? 'transparent' : bgColor};">\n`;

        // Intense Pro Neon Glow Filter
        svgMarkup += `
            <defs>
                <clipPath id="quantum-bounds">
                    <rect x="0" y="0" width="100" height="100" />
                </clipPath>
                
                <!-- Hyper-Glow Filter -->
                <filter id="neon-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <!-- Core high-intensity burn -->
                    <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity * 0.15}" result="core_blur" />
                    <!-- Mid glow -->
                    <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity * 0.5}" result="mid_blur" />
                    <!-- Ambient outer aura -->
                    <feGaussianBlur in="SourceGraphic" stdDeviation="${glowIntensity}" result="outer_blur" />
                    
                    <!-- Color boosting matrix to blow out the highlights like real neon -->
                    <feColorMatrix type="matrix" in="core_blur" result="boosted_core"
                        values="1.5 0 0 0 0  
                                0 1.5 0 0 0  
                                0 0 1.5 0 0  
                                0 0 0 2 0" />

                    <!-- Merge all glow levels + crisp white-hot core -->
                    <feMerge>
                        <feMergeNode in="outer_blur" />
                        <feMergeNode in="mid_blur" />
                        <feMergeNode in="boosted_core" />
                        <feMergeNode in="SourceGraphic" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
        `;

        if (quantumGlitch) {
            svgMarkup += `
            < !--Quantum Glitch Filter(Turbulence + Displacement)-- >
                <filter id="quantum-glitch" x = "-50%" y = "-50%" width = "200%" height = "200%" >
                    <feTurbulence type="fractalNoise" baseFrequency = "0.05" numOctaves = "2" result = "noise" seed = "${seed}" />
                        <feDisplacementMap in="SourceGraphic" in2 = "noise" scale = "${glitchIntensity}" xChannelSelector = "R" yChannelSelector = "G" />
                            </filter>
                                `;
        }

        if (depthWeaving) {
            let maskBandsForward = '';
            // Create concentric rings for the interlacing procedural mask (black = hidden, white = visible)
            for (let i = 0; i < 40; i++) {
                maskBandsForward += `<circle cx="50" cy="50" r="${i * 2 + 1}" fill="none" stroke="black" stroke-width="1" />\n`;
            }

            svgMarkup += `
                <mask id="depth-mask-front">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    ${maskBandsForward}
                </mask>
            `;
        }
        svgMarkup += `</defs>\n`;

        svgMarkup += `<g clip-path="url(#quantum-bounds)">\n`;

        if (quantumGlitch) {
            svgMarkup += `<g filter="url(#quantum-glitch)">\n`;
        }

        // ==========================================
        // 1. THE QUANTUM CORE (Mathematical harmonics)
        // ==========================================
        const numPoints = 600;
        const numLayers = Math.max(3, Math.floor(random() * 5) + 3); // 3 to 7 nested harmonic waves

        // We wrap the central math layers in a group, and then use <use> tags for Symmetry Folding
        svgMarkup += `<defs>\n<g id="harmonic-seed">\n`;

        for (let layer = 0; layer < numLayers; layer++) {
            const pathColor = colors[layer % colors.length];
            // Each layer has a slight phase offset and amplitude variation
            const phaseShift = (layer * Math.PI * 2) / numLayers;
            const layerAmplitude = amplitude * (1 - (layer * 0.12));

            let d = '';
            for (let i = 0; i <= numPoints; i++) {
                // If symmetry > 1, rotating the full Lissajous curve creates incredibly complex moire patterns.
                const t = (i / numPoints) * Math.PI * 2;

                const r = layerAmplitude
                    * Math.cos(complexity * t)
                    + (layerAmplitude * 0.4) * Math.sin(complexity * frequencyRatio * t + phaseShift);

                const x = 50 + r * Math.cos(t);
                const y = 50 + r * Math.sin(t);

                if (i === 0) {
                    d += `M ${x.toFixed(3)} ${y.toFixed(3)} `;
                } else {
                    d += `L ${x.toFixed(3)} ${y.toFixed(3)} `;
                }
            }
            d += 'Z';

            const dashStr = random() > 0.8 ? `stroke-dasharray="${Math.floor(random() * 8) + 1} ${Math.floor(random() * 8) + 1}"` : '';

            svgMarkup += `<path d="${d}" fill="none" stroke="${pathColor}" stroke-width="${lineWidth}" ${dashStr} stroke-opacity="0.8"/>\n`;
        }
        svgMarkup += `</g>\n</defs>\n`;

        // Symmetrical Folding Render (Rotational cloning)
        let harmonicMarkup = `<g filter="url(#neon-glow)">\n`;
        for (let s = 0; s < symmetry; s++) {
            const rotation = (s * 360) / symmetry;
            harmonicMarkup += `<use href="#harmonic-seed" transform="rotate(${rotation} 50 50)" />\n`;
        }
        harmonicMarkup += `</g>\n`;

        // ==========================================
        // 2. RENDER ASSEMBLY (Alpha Interlacing Mask)
        // ==========================================
        if (depthWeaving) {
            svgMarkup += `<g mask="url(#depth-mask-front)">\n${harmonicMarkup}</g>\n`;
        } else {
            svgMarkup += harmonicMarkup;
        }

        // ==========================================
        // 3. CORE ENERGY SINGULARITY (Center Dot)
        // ==========================================
        const coreColor = colors[Math.floor(random() * colors.length)];
        svgMarkup += `<circle cx="50" cy="50" r="${lineWidth * 2.5}" fill="${coreColor}" filter="url(#neon-glow)" />\n`;
        svgMarkup += `<circle cx="50" cy="50" r="${lineWidth}" fill="#ffffff" />\n`;

        if (quantumGlitch) {
            svgMarkup += `</g>\n`; // close quantum-glitch filter group
        }

        svgMarkup += `</g>\n</svg>`;
        return svgMarkup;
    }
};
