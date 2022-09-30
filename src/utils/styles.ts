import { PaintOptions } from "../Paint";

export function createStyles(
	id: string,
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

	styleSheet.sheet!.insertRule(`.${id} { display: grid; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} { background: ${options.bgColor}; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} { width: ${options.width}px; height: ${options.height}px; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} > canvas { grid-area: 1 / 1; }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} > canvas[class*="ui"] { z-index: 100 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} > canvas[class*="temp"] { z-index: 80 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} > canvas[class*="artboard"] { z-index: 60 }`); // prettier-ignore
	styleSheet.sheet!.insertRule(`.${id} > canvas[class*="grid"] { z-index: 40 }`); // prettier-ignore

	return styleSheet.sheet;
}
