import { Brush } from "../classes/brush";
import { CanvasDraw } from "./draw";
import { CanvasOptions } from "./canvas";

export class Temp extends CanvasDraw {
	constructor(public root: HTMLElement, brush: Brush, options: CanvasOptions) {
		super(root, "temp", brush, options);
	}
}
