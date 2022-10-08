import { PaintOptions } from "../Paint";
import { namespace } from "./uuid";

export function createBaseStyles(className: string, namespace: string) {
	const sheetId = namespace + "base-styles";
	const styleSheet = createStyleElement(sheetId);

	const next = () => styleSheet.sheet!.cssRules.length;

	replaceRule(styleSheet.sheet!, `.${className} { display: grid; }`, 0);
	replaceRule(styleSheet.sheet!, `.${className} { overflow: hidden; }`, next());

	replaceRule(styleSheet.sheet!, `.${className} > canvas { grid-area: 1 / 1; }`, next()); // prettier-ignore
	replaceRule(styleSheet.sheet!, `.${className} > canvas[class*="ui"] { z-index: 80 }`, next()); // prettier-ignore
	replaceRule(styleSheet.sheet!, `.${className} > canvas[class*="temp"] { z-index: 60 }`, next()); // prettier-ignore
	replaceRule(styleSheet.sheet!, `.${className} > canvas[class*="artboard"] { z-index: 40 }`, next()); // prettier-ignore
	replaceRule(styleSheet.sheet!, `.${className} > canvas[class*="grid"] { z-index: 20 }`, next()); // prettier-ignore

	return styleSheet.sheet;
}

export function createInstanceStyles(
	id: string,
	options: PaintOptions | { bgColor: string; width: number; height: number }
) {
	const styleSheet = createStyleElement(id);

	replaceRule(styleSheet.sheet!, `[data-${namespace}id=${id}] { background: ${options.bgColor}; }`, 0); // prettier-ignore
	replaceRule(styleSheet.sheet!, `[data-${namespace}id=${id}] { max-width: ${options.width}px; max-height: ${options.height}px; }`, 1); // prettier-ignore
	replaceRule(styleSheet.sheet!, `[data-${namespace}id=${id}] { aspect-ratio: ${options.width} / ${options.height}; }`, 2); // prettier-ignore

	return styleSheet.sheet;
}

export function createStyleElement(id: string) {
	const exists = document.getElementById(id);
	if (exists && exists instanceof HTMLStyleElement) return exists;

	const styleSheet = document.createElement("style");
	styleSheet.id = id;

	const target = document.styleSheets[0]?.ownerNode;
	document.head.insertBefore(styleSheet, target);

	return styleSheet;
}

export function replaceRule(
	sheet: CSSStyleSheet,
	newRule: string,
	index: number
) {
	if (sheet.cssRules.item(index)) sheet.deleteRule(index);
	sheet.insertRule(newRule, index);
}
