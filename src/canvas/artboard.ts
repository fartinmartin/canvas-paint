import { Brush } from "../classes/brush";
import { CanvasDraw } from "../classes/canvas-draw";
import { CanvasOptions } from "../classes/canvas";

export class Artboard extends CanvasDraw {
	constructor(public root: HTMLElement, brush: Brush, options: CanvasOptions) {
		super(root, "artboard", brush, options);
	}
}
