import type { SVGGenerator } from '../core/types';
import { getPalette, getPaletteRole } from '../core/palettes';

export const orbit: SVGGenerator = {
  id: 'anim-orbit',
  name: 'Orbital Loop',
  description: 'A looping orbital animation with controllable speed and paths',
  category: 'Animations',
  tags: ['animation', 'loop', 'circular'],
  version: '1.1.0',
  params: [
    { name: 'orbits', label: 'Orbit Count', type: 'integer', min: 1, max: 5, step: 1, default: 3, group: 'Geometry' },
    { name: 'duration', label: 'Speed (sec)', type: 'number', min: 0.5, max: 10, step: 0.1, default: 3, group: 'Animation' },
    { name: 'paletteId', label: 'Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
    { name: 'color', label: 'Override Color', type: 'color', default: '#9b5de5', group: 'Colors' },
    { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
    { name: 'thickness', label: 'Thickness', type: 'number', min: 0.1, max: 5, step: 0.1, default: 1, group: 'Geometry' }
  ],
  defaultParams: { orbits: 3, duration: 3, paletteId: 'neon-vibe', color: '#9b5de5', usePalette: true, thickness: 1 },
  render: (params, seed) => {
    const { orbits, duration, paletteId, color, usePalette, thickness } = params;

    let finalColor = color;
    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalColor = getPaletteRole(pal, 'accent');
      }
    }

    const elements: string[] = [];

    for (let i = 1; i <= orbits; i++) {
      const r = i * (44 / orbits);
      const d = (duration * (0.5 + (i - 1) * 0.4)).toFixed(2);
      const orbitOpacity = (1 - (i - 1) / orbits * 0.6).toFixed(2);

      // Dashed orbit ring
      elements.push(
        `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${finalColor}" stroke-width="${(thickness * 0.5).toFixed(2)}" stroke-dasharray="2 4" opacity="${orbitOpacity}" />`
      );

      // Rotating group: the dot sits at (50, 50-r) and the group rotates around center
      elements.push(`<g>
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="${d}s" repeatCount="indefinite" />
          <circle cx="50" cy="${(50 - r).toFixed(2)}" r="${(thickness * 2).toFixed(2)}" fill="${finalColor}" />
        </g>`);
    }

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="orbitClip-${seed}"><rect width="100" height="100" /></clipPath>
        </defs>
        <g clip-path="url(#orbitClip-${seed})">
          ${elements.join('\n        ')}
        </g>
      </svg>
    `.trim();
  }
};
