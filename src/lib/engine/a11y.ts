export function checkA11y(svgString: string) {
	const errors: string[] = [];

	// Title validation
	if (!/<title>.*<\/title>/.test(svgString)) {
		errors.push("Missing <title> tag for semantic identification.");
	}

	// Desc validation
	if (!/<desc>.*<\/desc>/.test(svgString)) {
		errors.push("Missing <desc> tag for assistive technologies.");
	}

	// ViewBox presence
	if (!/viewBox=["'][\d\s\.]+["']/.test(svgString)) {
		errors.push("Missing viewBox attribute for scalable presentation.");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
