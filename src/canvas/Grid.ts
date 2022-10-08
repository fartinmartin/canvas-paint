import { Canvas, CanvasOptions } from "./Canvas";

export type GridOptions = {};

export class Grid extends Canvas {
	constructor(public root: HTMLElement, options: CanvasOptions) {
		super(root, "grid", options);
		// TODO: draw grid
	}
}
