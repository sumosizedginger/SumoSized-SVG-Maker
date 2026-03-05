import type { SVGGenerator } from '../core/types';
import { getPalette, getPaletteRole } from '../core/palettes';

export const techBadge: SVGGenerator = {
  id: 'ui-badge',
  name: 'Tech Badge',
  description: 'A futuristic tech badge or chip asset',
  category: 'UI Assets',
  tags: ['ui', 'badge', 'chip', 'tech'],
  version: '1.1.0',
  params: [
    { name: 'width', label: 'Width', type: 'number', min: 40, max: 90, step: 1, default: 70, group: 'Size' },
    { name: 'height', label: 'Height', type: 'number', min: 20, max: 60, step: 1, default: 30, group: 'Size' },
    { name: 'cornerRadius', label: 'Corners', type: 'number', min: 0, max: 15, step: 1, default: 4, group: 'Size' },
    { name: 'paletteId', label: 'Palette', type: 'palette', default: 'neon-vibe', group: 'Colors' },
    { name: 'color', label: 'Override Color', type: 'color', default: '#00bbf9', group: 'Colors', advanced: true },
    { name: 'usePalette', label: 'Use Palette', type: 'boolean', default: true, group: 'Colors' },
    { name: 'glow', label: 'Glow Intensity', type: 'number', min: 0, max: 10, step: 1, default: 5, group: 'Details', advanced: true }
  ],
  defaultParams: { width: 70, height: 30, cornerRadius: 4, paletteId: 'neon-vibe', color: '#00bbf9', usePalette: true, glow: 5 },
  render: (params, seed) => {
    const { width, height, cornerRadius, paletteId, color, usePalette, glow } = params;

    let finalColor = color;
    if (usePalette) {
      const pal = getPalette(paletteId);
      if (pal) {
        finalColor = getPaletteRole(pal, 'accent');
      }
    }

    const x = (100 - width) / 2;
    const y = (100 - height) / 2;

    const badgeClipId = `badgeClip-${seed}`;
    const glowId = `glow-${seed}`;

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="${badgeClipId}"><rect width="100" height="100" /></clipPath>
          <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="${glow / 2}" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <g clip-path="url(#${badgeClipId})">
          <rect 
            x="${x}" y="${y}" 
            width="${width}" height="${height}" 
            rx="${cornerRadius}" ry="${cornerRadius}"
            fill="none" 
            stroke="${finalColor}" 
            stroke-width="1"
            filter="url(#${glowId})"
          />
          <rect 
            x="${x + 2}" y="${y + 2}" 
            width="${width - 4}" height="${height - 4}" 
            rx="${Math.max(0, cornerRadius - 2)}" ry="${Math.max(0, cornerRadius - 2)}"
            fill="${finalColor}" 
            fill-opacity="0.15"
          />
          <line x1="${x}" y1="${y + height / 2}" x2="${x + 5}" y2="${y + height / 2}" stroke="${finalColor}" stroke-width="1" />
          <line x1="${x + width - 5}" y1="${y + height / 2}" x2="${x + width}" y2="${y + height / 2}" stroke="${finalColor}" stroke-width="1" />
        </g>
      </svg>
    `.trim();
  }
};
