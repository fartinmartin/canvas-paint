import { PaintOptions } from "../Paint";

export function createStyles(
	className: string,
	namespace: string,
	options: PaintOptions
) {
	const sheetId = namespace + "base-styles";

	const exists = document.getElementById(sheetId);
	if (exists) return;

	const styleSheet = document.createElement("style");
	styleSheet.id = sheetId;

	const target = document.styleSheets[0]?.ownerNode;
	document.head.insertBefore(styleSheet, target);

	styleSheet.sheet!.insertRule(`.${className} { display: grid; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { background: ${options.bgColor}; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { overflow: hidden; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { max-width: ${options.width}px; max-height: ${options.height}px; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} { aspect-ratio: ${options.width} / ${options.height}; }`); // prettier-ignore

	styleSheet.sheet!.insertRule(`.${className} > canvas { grid-area: 1 / 1; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="ui"] { z-index: 100 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="temp"] { z-index: 80 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="artboard"] { z-index: 60 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${className} > canvas[class*="grid"] { z-index: 40 }`); // prettier-ignore

	return styleSheet.sheet;
}
