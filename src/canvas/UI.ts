import { Coordinates } from "lazy-brush"; // @ts-ignore
import { Catenary } from "catenary-curve";

import { Canvas, CanvasOptions } from "./Canvas";
import { Brush } from "../classes/Brush";

export type UIOptions = {};

export class UI extends Canvas {
	private catenary = new Catenary();

	constructor(
		public root: HTMLElement,
		private brush: Brush,
		options: CanvasOptions
	) {
		super(root, "ui", options);
	}

	drawInterface() {
		const pointer = this.brush.lazy.getPointerCoordinates();
		const brush = this.brush.lazy.getBrushCoordinates();

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const { x, y } = brush;
		const c = Math.PI * 2;

		// Draw brush point
		this.context.beginPath();
		this.context.fillStyle = this.brush.color;
		const r = this.brush.size * this.scale;
		this.brush.cap === "round"
			? this.context.arc(x, y, r / 2, 0, c, true)
			: this.context.rect(x - r / 2, y - r / 2, r, r);
		this.context.fill();

		// Draw mouse point
		this.context.beginPath();
		this.context.fillStyle = "black"; // could be passed by user's option object (in the constructor)
		this.context.arc(
			pointer.x,
			pointer.y,
			4, // could be passed by user's option object (in the constructor) remember, this is a radius value not width value!
			0,
			c,
			true
		);
		this.context.fill();

		// Draw catenary
		if (this.brush.lazy.isEnabled()) {
			this.context.beginPath();
			this.context.lineWidth = 2; // could be passed by user's option object (in the constructor)
			this.context.lineCap = "round";
			this.context.setLineDash([2, 4]); // could be passed by user's option object (in the constructor)
			this.context.strokeStyle = "black"; // could be passed by user's option object (in the constructor)

			this.catenary.drawToCanvas(
				this.context,
				brush,
				pointer,
				this.brush.lazy.radius / 2
			);
			this.context.stroke();
		}

		// Draw mouse point
		this.context.beginPath();
		this.context.fillStyle = "#222222"; // could be passed by user's option object (in the constructor)
		this.context.arc(
			x,
			y,
			2, // could be passed by user's option object (in the constructor) remember, this is a radius value not width value!
			0,
			c,
			true
		);
		this.context.fill();
	}
}
