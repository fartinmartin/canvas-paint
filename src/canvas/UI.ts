// @ts-ignore
import { Catenary } from "catenary-curve";
import { PaintOptions } from "../paint";
import { Canvas } from "./canvas";
import { Brush } from "../classes/brush";

export type UIOptions = {
	ui?: {
		show: boolean;
		brush?: boolean;
		pointer?: {
			size?: number;
			color?: string;
		};
		center?: {
			size?: number;
			color?: string;
		};
		chain?: {
			dash?: [number, number];
			width?: number;
			color?: string;
		};
	};
};

export class UI extends Canvas {
	private catenary = new Catenary();

	constructor(
		public root: HTMLElement,
		private brush: Brush,
		public options: PaintOptions
	) {
		super(root, "ui", options);
	}

	drawInterface() {
		const { ui } = this.options;

		const noUI =
			ui?.brush === false &&
			ui?.pointer?.size === 0 &&
			ui?.chain?.width === 0 &&
			ui?.center?.size === 0;

		if (ui?.show === false || noUI) return;

		const pointer = this.brush.lazy.getPointerCoordinates();
		const brush = this.brush.lazy.getBrushCoordinates();

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const { x, y } = brush;
		const c = Math.PI * 2;

		// Draw brush point
		if (ui?.brush === true ?? true) {
			this.context.beginPath();
			this.context.fillStyle = this.brush.color;
			const radius = this.brush.size * this.scale;
			this.brush.cap === "round"
				? this.context.arc(x, y, radius / 2, 0, c, true)
				: this.context.rect(x - radius / 2, y - radius / 2, radius, radius);
			this.context.fill();
		}

		// Draw mouse point
		if (!ui?.pointer?.size || (ui?.pointer?.size && ui.pointer.size > 0)) {
			this.context.beginPath();

			this.context.fillStyle = ui?.pointer?.color ?? "#000000";
			const radius = (ui?.pointer?.size ?? 8) / 2;
			this.context.arc(pointer.x, pointer.y, radius, 0, c, true);

			this.context.fill();
		}

		// Draw catenary
		if (this.brush.lazy.isEnabled() && ui?.chain?.width && ui.chain.width > 0) {
			this.context.beginPath();

			this.context.lineWidth = ui?.chain?.width ?? 2;
			this.context.lineCap = "round";

			this.context.setLineDash(ui?.chain?.dash ?? [2, 4]);
			this.context.strokeStyle = ui?.chain?.color ?? "#000000";

			const radius = this.brush.lazy.radius / 2;
			this.catenary.drawToCanvas(this.context, brush, pointer, radius);

			this.context.stroke();
		}

		// Draw brush center point
		if (ui?.center?.size ?? true) {
			this.context.beginPath();

			this.context.fillStyle = ui?.center?.color ?? "#000000";
			const radius = (ui?.center?.size ?? 4) / 2;
			this.context.arc(x, y, radius, 0, c, true);

			this.context.fill();
		}
	}
}
