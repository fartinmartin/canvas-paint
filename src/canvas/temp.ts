import { Brush } from "../classes/brush";
import { CanvasDraw } from "../classes/canvas-draw";
import { CanvasOptions } from "../classes/canvas";

export class Temp extends CanvasDraw {
	constructor(public root: HTMLElement, brush: Brush, options: CanvasOptions) {
		super(root, "temp", brush, options);
	}
}
