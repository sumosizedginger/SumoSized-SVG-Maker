import type { SVGGenerator } from "../core/types";

// 2026 High-Performance Precision Cap
const fix = (n: number) => Number(n.toFixed(2));

export const textEffects: SVGGenerator = {
  id: "text-effects",
  name: "Advanced Text",
  category: "Typography",
  description: "Text effects including Arch, Circle, and Wave paths.",
  tags: ["text", "typography", "rainbow", "circle", "wave"],
  version: "1.0.0",
  params: [
    {
      name: "content",
      type: "text",
      label: "Text Content",
      default: "SUMOSIZED",
    },
    {
      name: "effect",
      type: "select",
      label: "Effect Type",
      options: [
        { value: "straight", label: "Straight" },
        { value: "arch", label: "Arch (Rainbow)" },
        { value: "circle", label: "Circle" },
        { value: "wave", label: "Wave" },
        { value: "spiral", label: "Spiral" },
      ],
      default: "arch",
    },
    {
      name: "fontSize",
      type: "number",
      label: "Font Size",
      min: 2,
      max: 200,
      step: 1,
      default: 12,
    },
    {
      name: "color",
      type: "color",
      label: "Text Color",
      default: "#4DFF00",
    },
    {
      name: "radius",
      type: "number",
      label: "Curve Radius / Amp",
      min: 1,
      max: 500,
      step: 1,
      default: 40,
    },
    {
      name: "spacing",
      type: "number",
      label: "Letter Spacing",
      min: -20,
      max: 50,
      step: 0.5,
      default: 0,
    },
    {
      name: "startOffset",
      type: "number",
      label: "Start Offset (%)",
      min: -100,
      max: 200,
      step: 1,
      default: 50,
    },
  ],
  defaultParams: {
    content: "We're just two lost souls living in a fish bowl",
    effect: "spiral",
    fontSize: 12,
    color: "#4DFF00",
    radius: 40,
    spacing: 0,
    startOffset: 0,
  },
  render: (params) => {
    const text = String(params.content || "SUMOSIZED");
    const effect = String(params.effect || "straight");
    const fontSize = Number(params.fontSize || 12);
    const color = String(params.color || "#4DFF00");
    const r = Number(params.radius || 40);
    const spacing = Number(params.spacing || 0);
    const offset = Number(params.startOffset || 50);

    const id = `path-${Math.random().toString(36).substr(2, 9)}`;

    let pathData = "";
    let textAnchor = "middle";

    if (effect === "straight") {
      return `<text x="50" y="50" font-size="${fontSize}" fill="${color}" font-family="Montserrat, Inter, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="middle" style="letter-spacing: ${spacing}px">${text}</text>`;
    }

    if (effect === "arch") {
      // Semi-circle path
      pathData = `M ${50 - r},55 A ${r},${r} 0 0 1 ${50 + r},55`;
    } else if (effect === "circle") {
      // Full circle path
      pathData = `M 50,${50 - r} A ${r},${r} 0 1 1 50,${50 + r} A ${r},${r} 0 1 1 50,${50 - r}`;
    } else if (effect === "wave") {
      // Long repeating sine wave path (11 cycles, width=80 each, total length ~880px)
      // Centered around x=50 to allow very long strings to continue natively
      const cycleWidth = 80;
      const startX = 50 - cycleWidth * 5; // Start off-screen to the left
      pathData = `M ${startX},50 `;
      for (let i = 0; i < 11; i++) {
        const x0 = startX + i * cycleWidth;
        pathData += `Q ${x0 + 20},${50 - r} ${x0 + 40},50 T ${x0 + 80},50 `;
      }
    } else if (effect === "spiral") {
      // Archimedean spiral - ideal for fitting maximum paragraph length strings
      // Radius parameter drives the spacing gap between rings
      const centerX = 50;
      const centerY = 50;
      const loops = 8;
      const points = [];
      // Start from center and spiral outward
      for (let theta = 0; theta < loops * 2 * Math.PI; theta += 0.1) {
        const currentRadius = 2 + (r / 20) * theta;
        const x = centerX + currentRadius * Math.cos(theta);
        const y = centerY + currentRadius * Math.sin(theta);
        points.push(`${fix(x)},${fix(y)}`);
      }
      const first = points.shift();
      pathData = `M ${first} L ${points.join(" ")}`;
      // A spiral usually looks better starting near 0 offset and anchored at the start
      textAnchor = "start";
    }

    const circumference = 2 * Math.PI * r;

    return `
            <title>Advanced Text: ${text}</title>
            <desc>Text rendered using the ${effect} effect with ${fontSize}px font size.</desc>
            <defs>
                <path id="${id}" d="${pathData}" fill="none" />
            </defs>
            <text font-size="${fontSize}" fill="${color}" font-family="Montserrat, Inter, sans-serif" font-weight="800" style="letter-spacing: ${spacing}px">
                <textPath 
                    href="#${id}" 
                    startOffset="${offset}%" 
                    text-anchor="${textAnchor}"
                    ${effect === "circle" ? `textLength="${circumference}" lengthAdjust="spacingAndGlyphs"` : ""}
                >
                    ${text}
                </textPath>
            </text>
        `.trim();
  },
};
