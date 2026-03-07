/**
 * Utility to capture frames from an SVG element.
 */
export async function* captureFrames(
	svgElement: SVGSVGElement,
	duration: number,
	fps: number,
	width: number,
	height: number,
): AsyncGenerator<{
	data: HTMLCanvasElement;
	index: number;
	timestamp: number;
}> {
	const totalFrames = Math.ceil(duration * fps);
	const frameInterval = 1 / fps;

	// Use a single canvas and image element for all frames to reduce GC pressure
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d")!;
	const img = new Image();

	for (let i = 0; i < totalFrames; i++) {
		const currentTime = i * frameInterval;

		// 1. Advance SVG time (if using SMIL or manual triggers)
		// @ts-ignore
		if (svgElement.setCurrentTime) svgElement.setCurrentTime(currentTime);

		// 2. Serialize and prepare SVG
		const svgData = new XMLSerializer().serializeToString(svgElement);
		const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
		const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

		// 3. Rasterize to canvas
		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				img.onload = null;
				img.onerror = null;
				reject(new Error("Frame capture timeout"));
			}, 5000);

			img.onload = () => {
				clearTimeout(timeout);
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(img, 0, 0, width, height);
				resolve(null);
			};
			img.onerror = (e) => {
				clearTimeout(timeout);
				reject(e);
			};
			img.src = dataUrl;
		});

		yield {
			data: canvas, // Note: The caller should process/transfer this immediately before the next yield
			index: i,
			timestamp: Math.round(currentTime * 1000000), // Microseconds
		};
	}
}
