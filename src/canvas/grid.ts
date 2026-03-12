import { Canvas, CanvasOptions } from "../classes/canvas";

export type GridOptions = {};

export class Grid extends Canvas {
	constructor(public root: HTMLElement, options: CanvasOptions) {
		super(root, "grid", options);
		this.draw();
	}

	override resize(newDimensions: { width: number; height: number }) {
		super.resize(newDimensions);
		this.draw();
	}

	draw() {
		this.clear();
		const margin = this.options.margin ?? 0;
		if (margin === 0) return;

		const scale = this.root.clientWidth / (this.options.width + margin * 2);
		const x = margin * scale;
		const y = margin * scale;
		const w = this.options.width * scale;
		const h = this.options.height * scale;

		this.context.strokeStyle = "rgba(0, 0, 0, 0.2)";
		this.context.lineWidth = 1;
		this.context.setLineDash([4, 4]);
		this.context.strokeRect(x, y, w, h);
	}
}
