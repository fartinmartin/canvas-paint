import { Canvas, CanvasOptions } from "./Canvas";

export class Artboard extends Canvas {
	constructor(protected root: HTMLElement, options?: CanvasOptions) {
		super(root, "artboard", options);
	}
}
