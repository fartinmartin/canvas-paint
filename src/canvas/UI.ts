import { Coordinates, LazyBrush } from "lazy-brush"; // @ts-ignore
import { Catenary } from "catenary-curve";

import { Canvas, CanvasOptions } from "./Canvas";
import { Brush } from "../classes/Brush";

export type UIOptions = {};

export class UI extends Canvas {
	catenary = new Catenary();

	constructor(
		protected root: HTMLElement,
		private lazy: LazyBrush,
		private brush: Brush,
		options?: CanvasOptions
	) {
		super(root, "ui", options);
	}

	drawInterface(pointer: Coordinates, brush: Coordinates) {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw brush point
		this.context.beginPath();
		this.context.fillStyle = this.brush.color;
		this.context.arc(brush.x, brush.y, this.brush.size, 0, Math.PI * 2, true);
		this.context.fill();

		// Draw mouse point
		this.context.beginPath();
		this.context.fillStyle = "black"; // could be passed by user's option object (in the constructor)
		this.context.arc(
			pointer.x,
			pointer.y,
			4, // could be passed by user's option object (in the constructor)
			0,
			Math.PI * 2,
			true
		);
		this.context.fill();

		//Draw catenary
		if (this.lazy.isEnabled()) {
			this.context.beginPath();
			this.context.lineWidth = 2; // could be passed by user's option object (in the constructor)
			this.context.lineCap = "round";
			this.context.setLineDash([2, 4]); // could be passed by user's option object (in the constructor)
			this.context.strokeStyle = "black"; // could be passed by user's option object (in the constructor)
			this.catenary.drawToCanvas(
				this.context,
				brush,
				pointer,
				this.lazy.radius
			);
			this.context.stroke();
		}

		// Draw mouse point
		this.context.beginPath();
		this.context.fillStyle = "#222222"; // could be passed by user's option object (in the constructor)
		this.context.arc(
			brush.x,
			brush.y,
			2, // could be passed by user's option object (in the constructor)
			0,
			Math.PI * 2,
			true
		);
		this.context.fill();
	}
}
