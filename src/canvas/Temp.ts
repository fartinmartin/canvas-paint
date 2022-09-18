import { Canvas, CanvasOptions } from "./Canvas";

export class Temp extends Canvas {
  constructor(protected root: HTMLElement,options?: CanvasOptions) {
		super(root, "temp", options);
	}
}
