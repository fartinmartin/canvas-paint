import { Canvas, CanvasOptions } from "../classes/canvas";

export type GridOptions = {
	grid?: {
		show?: boolean;
		lines?: {
			show?: boolean;
			size?: number;   // spacing in document units
			color?: string;
		};
		boundary?: {
			show?: boolean;
			dash?: [number, number];
			width?: number;
			color?: string;
		};
	};
};

export class Grid extends Canvas {
	constructor(public root: HTMLElement, public options: CanvasOptions & GridOptions) {
		super(root, "grid", options);
		this.draw();
	}

	override resize(newDimensions: { width: number; height: number }) {
		super.resize(newDimensions);
		this.draw();
	}

	draw() {
		this.clear();

		const { grid } = this.options;
		if (grid?.show === false) return;

		const margin  = this.options.margin ?? 0;
		const scale   = this.root.clientWidth / (this.options.width + margin * 2);
		const marginPx = margin * scale;
		const docW    = this.options.width  * scale;
		const docH    = this.options.height * scale;
		const canvasW = this.root.clientWidth;
		const canvasH = this.root.clientHeight;

		// Grid lines (default OFF — only draw when show === true)
		if (grid?.lines?.show === true) {
			const sizeDoc = grid?.lines?.size ?? 50;
			const sizePx  = sizeDoc * scale;

			if (sizePx > 0) {
				this.context.beginPath();
				this.context.strokeStyle = grid?.lines?.color ?? "rgba(0, 0, 0, 0.15)";
				this.context.lineWidth   = 1;
				this.context.setLineDash([]);

				// Start from the grid intersection nearest to the canvas left/top edge,
				// aligned to the document origin at marginPx
				const firstX = marginPx - Math.ceil(marginPx / sizePx) * sizePx;
				for (let x = firstX; x <= canvasW; x += sizePx) {
					this.context.moveTo(x, 0);
					this.context.lineTo(x, canvasH);
				}

				const firstY = marginPx - Math.ceil(marginPx / sizePx) * sizePx;
				for (let y = firstY; y <= canvasH; y += sizePx) {
					this.context.moveTo(0, y);
					this.context.lineTo(canvasW, y);
				}

				this.context.stroke();
			}
		}

		// Boundary rect (default ON when margin > 0 — skip only when show === false)
		if (grid?.boundary?.show !== false && margin > 0) {
			this.context.beginPath();
			this.context.strokeStyle = grid?.boundary?.color ?? "rgba(0, 0, 0, 0.2)";
			this.context.lineWidth   = grid?.boundary?.width  ?? 1;
			this.context.setLineDash(grid?.boundary?.dash     ?? [4, 4]);
			this.context.strokeRect(marginPx, marginPx, docW, docH);
		}
	}
}
