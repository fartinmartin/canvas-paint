import { Brush } from "../classes/Brush";
import { CanvasDraw, CanvasOptions } from "./Canvas";

export class Temp extends CanvasDraw {
	constructor(
		protected root: HTMLElement,
		brush: Brush,
		options?: CanvasOptions
	) {
		super(root, "temp", brush, options);
	}
}
