import { Brush } from "../classes/Brush";
import { CanvasDraw } from "./CanvasDraw";
import { CanvasOptions } from "./Canvas";

export class Artboard extends CanvasDraw {
	constructor(public root: HTMLElement, brush: Brush, options: CanvasOptions) {
		super(root, "artboard", brush, options);
	}
}
