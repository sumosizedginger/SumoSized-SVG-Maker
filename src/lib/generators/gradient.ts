import type { SVGGenerator } from '../core/types';

export const simpleGradient: SVGGenerator = {
  id: 'simple-gradient',
  name: 'Simple Gradient',
  description: 'A basic linear gradient background',
  category: 'Backgrounds',
  tags: ['gradient', 'simple', 'test'],
  version: '1.0.0',
  params: [
    {
      name: 'color1',
      label: 'Start Color',
      type: 'color',
      default: '#ff0000',
      group: 'Colors'
    },
    {
      name: 'color2',
      label: 'End Color',
      type: 'color',
      default: '#0000ff',
      group: 'Colors'
    },
    {
      name: 'angle',
      label: 'Angle',
      type: 'number',
      min: 0,
      max: 360,
      step: 1,
      default: 45,
      group: 'Layout'
    },
    { name: 'transparent', label: 'Transparent Background', type: 'boolean', default: false, group: 'Background' }
  ],
  defaultParams: {
    color1: '#ff0000',
    color2: '#0000ff',
    angle: 45,
    transparent: false
  },
  render: (params) => {
    const { color1, color2, angle, transparent } = params;
    const id = `grad-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate coordinates based on angle (0deg = bottom to top, 90deg = left to right)
    const angleRad = ((angle - 90) * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(angleRad);
    const y1 = 50 - 50 * Math.sin(angleRad);
    const x2 = 50 + 50 * Math.cos(angleRad);
    const y2 = 50 + 50 * Math.sin(angleRad);

    return `
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
            <stop offset="0%" stop-color="${color1}" />
            <stop offset="100%" stop-color="${color2}" />
          </linearGradient>
        </defs>
        ${transparent ? '' : `<rect width="100" height="100" fill="url(#${id})" />`}
      </svg>
    `.trim();
  }
};
