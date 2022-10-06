import { PaintOptions } from "../Paint";

export function createStyles(
	className: string,
	namespace: string,
	options: PaintOptions
) {
	const sheetId = namespace + "base-styles";

	const exists = document.getElementById(sheetId);
	if (exists && exists instanceof HTMLStyleElement) return exists.sheet;

	const styleSheet = document.createElement("style");
	styleSheet.id = sheetId;

	const target = document.styleSheets[0]?.ownerNode;
	document.head.insertBefore(styleSheet, target);

	styleSheet.sheet!.insertRule(`.${className} { display: grid; }`, 0); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { overflow: hidden; }`, 1); // prettier-ignore

	// ⚠️ TODO: these three rules should only apply to the Paint *instance*! that way you can have multiple Paints on a page
	styleSheet.sheet!.insertRule(`.${className} { background: ${options.bgColor}; }`, 2); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { max-width: ${options.width}px; max-height: ${options.height}px; }`, 3); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { aspect-ratio: ${options.width} / ${options.height}; }`, 4); // prettier-ignore

	styleSheet.sheet!.insertRule(`.${className} > canvas { grid-area: 1 / 1; }`, 5); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="ui"] { z-index: 80 }`, 6); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="temp"] { z-index: 60 }`, 7); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="artboard"] { z-index: 40 }`, 8); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="grid"] { z-index: 20 }`, 9); // prettier-ignore

	return styleSheet.sheet;
}

export function replaceRule(
	sheet: CSSStyleSheet,
	newRule: string,
	index: number
) {
	sheet.deleteRule(index);
	sheet.insertRule(newRule, index);
}
