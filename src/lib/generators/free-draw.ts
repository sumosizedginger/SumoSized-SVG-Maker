import type { SVGGenerator } from "../core/types";

export const freeDraw: SVGGenerator = {
  id: "free-draw",
  name: "Manual Drawing",
  category: "Drawing",
  description:
    "A canvas layer that renders hand-drawn SVG paths, shapes, and strokes.",
  tags: ["drawing", "manual", "paths", "paint", "pencil", "brush"],
  version: "2.0.0",
  params: [
    {
      name: "strokeColor",
      type: "color",
      label: "Stroke Color",
      default: "#ffffff",
    },
    {
      name: "strokeWidth",
      type: "number",
      label: "Stroke Width",
      min: 0.1,
      max: 10,
      step: 0.1,
      default: 1.0,
    },
    {
      name: "linecap",
      type: "select",
      label: "Line Cap",
      options: [
        { value: "round", label: "Round" },
        { value: "square", label: "Square" },
        { value: "butt", label: "Butt" },
      ],
      default: "round",
    },
    {
      name: "pathData",
      type: "select",
      label: "Path Data (Hidden)",
      default: "",
      advanced: true,
      options: [{ value: "", label: "Hidden" }],
    },
  ],
  defaultParams: {
    strokeColor: "#ffffff",
    strokeWidth: 1.0,
    linecap: "round",
    pathData: "",
  },
  render: (params) => {
    const fallbackColor = String(params.strokeColor || "#ffffff");
    const fallbackWidth = Number(params.strokeWidth || 1.0);
    const fallbackCap = String(params.linecap || "round");
    const rawData = String(params.pathData || "");

    if (!rawData.trim()) {
      return `<!-- Empty Drawing Layer -->`;
    }

    // Strokes separated by |
    // Each stroke can be:
    //   - Legacy: raw SVG path data (M ... L ...)
    //   - New:    color;width;cap;pathData
    const strokes = rawData.split("|").filter((s) => s.trim().length > 0);

    let svg = `
            <title>Manual Drawing Layer</title>
            <desc>Hand-drawn strokes and text content.</desc>
        `;
    for (const stroke of strokes) {
      // Text entries: TEXT;x;y;fontSize;color;content
      if (stroke.startsWith("TEXT;")) {
        const parts = stroke.split(";");
        const tx = parts[1] || "50";
        const ty = parts[2] || "50";
        const fs = parts[3] || "5";
        const tc = parts[4] || fallbackColor;
        const content = parts.slice(5).join(";"); // In case content has semicolons
        svg += `<text x="${tx}" y="${ty}" font-size="${fs}" fill="${tc}" font-family="sans-serif">${content}</text>\n`;
        continue;
      }

      const parts = stroke.split(";");
      let color: string, sw: number, cap: string, d: string;

      if (parts.length >= 4) {
        // New format: color;width;cap;d
        color = parts[0];
        sw = Number(parts[1]) || fallbackWidth;
        cap = parts[2] || fallbackCap;
        d = parts.slice(3).join(";");
      } else {
        // Legacy format: just path data
        color = fallbackColor;
        sw = fallbackWidth;
        cap = fallbackCap;
        d = stroke;
      }

      svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="${cap}" stroke-linejoin="round" />\n`;
    }

    return svg;
  },
};
