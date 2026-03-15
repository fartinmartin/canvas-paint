import { getCatenaryCurve, drawResult } from "catenary-curve";
import { PaintOptions } from "..";
import { Canvas } from "../classes/canvas";
import { Brush } from "../classes/brush";

export type UIOptions = {
	ui?: {
		show?: boolean;
		brush?: boolean;
		pointer?: {
			show?: boolean;
			size?: number;
			color?: string;
		};
		center?: {
			show?: boolean;
			size?: number;
			color?: string;
		};
		chain?: {
			show?: boolean;
			dash?: [number, number];
			width?: number;
			color?: string;
		};
	};
};

export class UI extends Canvas {
	constructor(
		public root: HTMLElement,
		private brush: Brush,
		public options: PaintOptions
	) {
		super(root, "ui", options);
	}

	drawInterface() {
		const { ui } = this.options;

		this.clear();

		if (ui?.show === false) return;

		const pointer = this.brush.lazy.getPointerCoordinates();
		const brush = this.brush.lazy.getBrushCoordinates();

		const { x, y } = brush;
		const c = Math.PI * 2;

		// Draw brush point
		if (ui?.brush !== false) {
			this.context.beginPath();
			this.context.fillStyle = this.brush.color;
			const radius = this.brush.size * this.scale;
			this.brush.cap === "round"
				? this.context.arc(x, y, radius / 2, 0, c, true)
				: this.context.rect(x - radius / 2, y - radius / 2, radius, radius);
			this.context.fill();
		}

		// Draw pointer dot
		if (ui?.pointer?.show !== false) {
			this.context.beginPath();
			this.context.fillStyle = ui?.pointer?.color ?? "#000000";
			const radius = (ui?.pointer?.size ?? 8) / 2;
			this.context.arc(pointer.x, pointer.y, radius, 0, c, true);
			this.context.fill();
		}

		// Draw catenary chain
		if (ui?.chain?.show === true && this.brush.lazy.isEnabled()) {
			this.context.beginPath();
			this.context.lineWidth = ui?.chain?.width ?? 2;
			this.context.lineCap = "round";
			this.context.setLineDash(ui?.chain?.dash ?? [2, 4]);
			this.context.strokeStyle = ui?.chain?.color ?? "#000000";
			const radius = this.brush.lazy.radius;
			const cantenary = getCatenaryCurve(pointer, brush, radius);
			drawResult(cantenary, this.context);
			this.context.stroke();
		}

		// Draw brush center point
		if (ui?.center?.show !== false) {
			this.context.beginPath();
			this.context.fillStyle = ui?.center?.color ?? "#000000";
			const radius = (ui?.center?.size ?? 4) / 2;
			this.context.arc(x, y, radius, 0, c, true);
			this.context.fill();
		}
	}
}
