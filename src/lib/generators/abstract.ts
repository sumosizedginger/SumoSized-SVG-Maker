import type { SVGGenerator } from '../core/types';
import { getPalette, getPaletteRole } from '../core/palettes';

export const flowField: SVGGenerator = {
  id: 'abstract-flow',
  name: 'Flow Field',
  description: 'Organic flowing ribbons generated via a noise field',
  category: 'Abstract',
  tags: ['abstract', 'organic', 'flow'],
  version: '1.1.0',
  params: [
    { name: 'count', label: 'Line Count', type: 'integer', min: 10, max: 200, step: 1, default: 50, group: 'Geometry' },
    { name: 'steps', label: 'Step Length', type: 'integer', min: 5, max: 100, step: 1, default: 30, group: 'Geometry' },
    { name: 'complexity', label: 'Complexity', type: 'number', min: 0.01, max: 0.5, step: 0.01, default: 0.1, group: 'Geometry', advanced: true },
    { name: 'paletteId', label: 'Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
    { name: 'bgColor', label: 'Background Override', type: 'color', default: '#000000', group: 'Colors', advanced: true },
    { name: 'lineColor', label: 'Line Override', type: 'color', default: '#ff006e', group: 'Colors', advanced: true },
    { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
    { name: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.1, default: 0.6, group: 'Colors', advanced: true },
    { name: 'transparent', label: 'Transparent Background', type: 'boolean', default: false, group: 'Background', advanced: true }
  ],
  defaultParams: { count: 50, steps: 30, complexity: 0.1, paletteId: 'neon-vibe', bgColor: '#000000', lineColor: '#ff006e', usePalette: true, opacity: 0.6, transparent: false },
  render: (params, seed) => {
    const { count, steps, complexity, paletteId, bgColor, lineColor, usePalette, opacity, transparent } = params;

    let finalBg = bgColor;
    let finalLine = lineColor;

    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalBg = getPaletteRole(pal, 'bg');
        finalLine = getPaletteRole(pal, 'accent');
      }
    }

    const paths: string[] = [];

    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    // Simple pseudo-noise based on sine waves and seed
    const getAngle = (x: number, y: number) => {
      return (Math.sin(x * complexity + seed) + Math.cos(y * complexity + seed)) * Math.PI * 2;
    };

    for (let i = 0; i < count; i++) {
      let x = rand() * 100;
      let y = rand() * 100;
      let d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;

      for (let j = 0; j < steps; j++) {
        const angle = getAngle(x, y);
        x += Math.cos(angle) * 2;
        y += Math.sin(angle) * 2;
        d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;

        // Stop if hitting the exact boundary
        if (x < 0 || x > 100 || y < 0 || y > 100) break;
      }
      paths.push(`<path d="${d}" fill="none" stroke="${finalLine}" stroke-width="0.5" stroke-opacity="${opacity}" />`);
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="flowClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        ${transparent ? '' : `<rect width="100" height="100" fill="${finalBg}" />`}
        <g clip-path="url(#flowClip-${seed})">
          ${paths.join('\n')}
        </g>
      </svg>
    `.trim();
  }
};
