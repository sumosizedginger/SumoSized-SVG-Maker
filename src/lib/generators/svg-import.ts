import type { SVGGenerator } from "../core/types";

export const svgImport: SVGGenerator = {
  id: "svg-import",
  name: "SVG Import",
  category: "Custom",
  description: "Import custom SVG markup as a layer.",
  tags: ["custom", "import", "upload", "markup"],
  version: "1.1.0",
  params: [
    {
      name: "svgData",
      type: "text",
      label: "SVG Markup",
      default: '<circle cx="50" cy="50" r="40" fill="#4DFF00" />',
    },
  ],
  defaultParams: {
    svgData: '<circle cx="50" cy="50" r="40" fill="#4DFF00" />',
  },
  render: (params) => {
    const raw = String(params.svgData || "");

    // Remove XML prologs, doctypes, and comments
    let content = raw
      .replace(/<\?xml.*?\?>/gi, "")
      .replace(/<!DOCTYPE.*?>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Strip ALL <svg> and </svg> tags to ensure valid nesting in the composition.
    // We use a global case-insensitive replace.
    content = content.replace(/<svg[^>]*>/gi, "");
    content = content.replace(/<\/svg>/gi, "");

    return `
            <title>Imported SVG</title>
            <desc>Custom vector artwork imported by the user.</desc>
            <g>${content}</g>
        `;
  },
};
