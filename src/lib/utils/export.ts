import { optimizeSvg } from "./../services/svgOptimize";

/**
 * Copies the raw SVG markup to the system clipboard after performing
 * an optimization pass (whitespace stripping).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const optimizedSvg = optimizeSvg(text);
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(optimizedSvg);
    } else {
      // Fallback for non-HTTPS or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = optimizedSvg;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    return true;
  } catch (e) {
    console.error("Failed to copy to clipboard", e);
    return false;
  }
}
