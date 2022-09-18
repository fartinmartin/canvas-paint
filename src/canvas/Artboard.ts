import { Brush } from "../classes/Brush";
import { CanvasDraw, CanvasOptions } from "./Canvas";

export class Artboard extends CanvasDraw {
	constructor(
		protected root: HTMLElement,
		brush: Brush,
		options?: CanvasOptions
	) {
		super(root, "artboard", brush, options);
	}
}
