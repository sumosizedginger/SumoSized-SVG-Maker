export type ParamType =
  | "number"
  | "integer"
  | "boolean"
  | "select"
  | "color"
  | "seed"
  | "palette"
  | "text";

export interface ParamDefinition {
  name: string; // stable key
  label: string;
  type: ParamType;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  default: any;
  group?: string; // section in UI (e.g., "Layout", "Colors")
  description?: string;
  advanced?: boolean; // If true, hidden by default in "Simple" mode
}

export interface GeneratorMetadata {
  id: string; // unique, stable
  name: string;
  description: string;
  category: string; // e.g., "Patterns", "Abstract", "Layouts", "UI", "Icons", "Animations"
  tags: string[];
  version: string; // semantic, e.g., "1.0.0"
}

export interface SVGGenerator extends GeneratorMetadata {
  params: ParamDefinition[];
  defaultParams: Record<string, any>;
  render: (params: Record<string, any>, seed: number) => string; // full <svg>...</svg>
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export interface LayerTransforms {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
}

export interface Layer {
  id: string;
  name: string;
  generatorId: string;
  params: Record<string, any>;
  seed: number;
  visible: boolean;
  blendMode: BlendMode;
  opacity: number; // 0.0 to 1.0
  transforms: LayerTransforms;
}

export type PaintTool =
  | "pointer"
  | "move"
  | "transform"
  | "crop"
  | "pencil"
  | "brush"
  | "eraser"
  | "line"
  | "rect"
  | "ellipse"
  | "text";

export interface AppState {
  layers: Layer[];
  activeLayerId: string | null;
  activeTool: PaintTool;
}
