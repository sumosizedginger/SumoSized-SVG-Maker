import type { SVGGenerator } from '../core/types';
import { getPalette, getPaletteRole } from '../core/palettes';

export const dots: SVGGenerator = {
  id: 'pattern-dots',
  name: 'Polka Dots',
  description: 'A classic polka dot pattern with adjustable spacing and randomness',
  category: 'Patterns',
  tags: ['pattern', 'dots', 'minimal'],
  version: '1.1.0',
  params: [
    { name: 'dotSize', label: 'Dot Size', type: 'number', min: 1, max: 20, step: 0.5, default: 5, group: 'Geometry' },
    { name: 'spacing', label: 'Spacing', type: 'number', min: 10, max: 100, step: 1, default: 20, group: 'Geometry' },
    { name: 'jitter', label: 'Jitter', type: 'number', min: 0, max: 50, step: 1, default: 0, group: 'Geometry', advanced: true },
    { name: 'paletteId', label: 'Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
    { name: 'bgColor', label: 'Background Override', type: 'color', default: '#3a0ca3', group: 'Colors', advanced: true },
    { name: 'dotColor', label: 'Dot Override', type: 'color', default: '#4361ee', group: 'Colors', advanced: true },
    { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
    { name: 'transparent', label: 'Transparent Background', type: 'boolean', default: false, group: 'Background', advanced: true }
  ],
  defaultParams: { dotSize: 5, spacing: 20, jitter: 0, paletteId: 'neon-vibe', bgColor: '#3a0ca3', dotColor: '#4361ee', usePalette: true, transparent: false },
  render: (params, seed) => {
    const { dotSize, spacing, jitter, paletteId, bgColor, dotColor, usePalette, transparent } = params;

    let finalBg = bgColor;
    let finalDot = dotColor;

    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalBg = getPaletteRole(pal, 'bg');
        finalDot = getPaletteRole(pal, 'accent');
      }
    }

    const dotsList: string[] = [];

    // Pseudo-random helper using seed
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    for (let x = 0; x <= 100 + spacing; x += spacing) {
      for (let y = 0; y <= 100 + spacing; y += spacing) {
        const ox = jitter ? (rand() - 0.5) * jitter : 0;
        const oy = jitter ? (rand() - 0.5) * jitter : 0;
        dotsList.push(`<circle cx="${x + ox}" cy="${y + oy}" r="${dotSize}" fill="${finalDot}" />`);
      }
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="dotsClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        ${transparent ? '' : `<rect width="100" height="100" fill="${finalBg}" />`}
        <g clip-path="url(#dotsClip-${seed})">
          ${dotsList.join('\n')}
        </g>
      </svg>
    `.trim();
  }
};

export const grid: SVGGenerator = {
  id: 'pattern-grid',
  name: 'Tech Grid',
  description: 'A futuristic grid layout with glowing intersections',
  category: 'Patterns',
  tags: ['grid', 'tech', 'ui'],
  version: '1.0.0',
  params: [
    { name: 'cells', label: 'Cells', type: 'integer', min: 2, max: 50, step: 1, default: 10, group: 'Geometry' },
    { name: 'thickness', label: 'Line Thickness', type: 'number', min: 0.1, max: 5, step: 0.1, default: 0.5, group: 'Geometry' },
    { name: 'paletteId', label: 'Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
    { name: 'bgColor', label: 'Background Override', type: 'color', default: '#0a0a0d', group: 'Colors', advanced: true },
    { name: 'lineColor', label: 'Line Override', type: 'color', default: '#3a86ff', group: 'Colors', advanced: true },
    { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
    { name: 'showDots', label: 'Show Intersections', type: 'boolean', default: true, group: 'Details', advanced: true },
    { name: 'transparent', label: 'Transparent Background', type: 'boolean', default: false, group: 'Background', advanced: true }
  ],
  defaultParams: { cells: 10, thickness: 0.5, paletteId: 'neon-vibe', bgColor: '#0a0a0d', lineColor: '#3a86ff', usePalette: true, showDots: true, transparent: false },
  render: (params, seed) => {
    const { cells, thickness, paletteId, bgColor, lineColor, usePalette, showDots, transparent } = params;

    let finalBg = bgColor;
    let finalLine = lineColor;

    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalBg = getPaletteRole(pal, 'bg');
        finalLine = getPaletteRole(pal, 'accent');
      }
    }

    const step = 100 / cells;
    const lines: string[] = [];
    const dotsList: string[] = [];

    for (let i = 0; i <= cells; i++) {
      const pos = i * step;
      lines.push(`<line x1="${pos}" y1="0" x2="${pos}" y2="100" stroke="${finalLine}" stroke-width="${thickness}" opacity="0.3" />`);
      lines.push(`<line x1="0" y1="${pos}" x2="100" y2="${pos}" stroke="${finalLine}" stroke-width="${thickness}" opacity="0.3" />`);

      if (showDots) {
        for (let j = 0; j <= cells; j++) {
          dotsList.push(`<circle cx="${pos}" cy="${j * step}" r="${thickness * 1.5}" fill="${finalLine}" />`);
        }
      }
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="gridClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        ${transparent ? '' : `<rect width="100" height="100" fill="${finalBg}" />`}
        <g clip-path="url(#gridClip-${seed})" stroke-linecap="round">
          ${lines.join('\n')}
          ${dotsList.join('\n')}
        </g>
      </svg>
    `.trim();
  }
};
