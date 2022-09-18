import { Coordinates } from "lazy-brush";
import { Brush } from "../classes/Brush";
import { Path } from "../classes/Path";
import { namespace, uuid } from "../utils/uuid";
import { waitFor } from "../utils/waitFor";

export type CanvasOptions = {
	width: number;
	height: number;
};

export class Canvas {
	protected canvas: HTMLCanvasElement;
	protected context: CanvasRenderingContext2D;
	protected id: string;

	constructor(
		protected root: HTMLElement,
		className: string,
		options?: CanvasOptions
	) {
		this.canvas = this.createCanvas(className);

		this.context = this.canvas.getContext("2d")!;
		this.canvas.id = this.id = uuid();

		// set canvas dimensions in case they were passed via options
		this.canvas.width = options?.width || this.canvas.width;
		this.canvas.height = options?.height || this.canvas.height;

		this.setDPI();
	}

	private createCanvas(className: string) {
		const canvas = document.createElement("canvas");
		canvas.classList.add(namespace + className);
		return this.root.appendChild(canvas);
	}

	protected setDPI() {
		// get current CSS size of the canvas
		const { width, height } = this.canvas.getBoundingClientRect();

		// increase the actual size of our canvas
		this.canvas.width = width * devicePixelRatio;
		this.canvas.height = height * devicePixelRatio;

		// ensure all drawing operations are scaled
		this.context.scale(devicePixelRatio, devicePixelRatio);

		// scale everything down using CSS
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";
	}

	protected resize() {
		// TODO: but this is what will be called when container is observed to have changed? I think?
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

export class CanvasDraw extends Canvas {
	constructor(
		root: HTMLElement,
		className: string,
		protected brush: Brush,
		options?: CanvasOptions
	) {
		super(root, className, options);
	}

	draw(path: Path) {
		this.setBrush();
		this.brush.mode !== "fill" ? this.drawPath(path) : this.drawFill(path);
	}

	protected setBrush() {
		const { mode, size, cap, color } = this.brush;

		this.context.globalCompositeOperation =
			mode === "erase" ? "destination-out" : "source-over";

		this.context.lineWidth = size;
		this.context.lineCap = cap;
		this.context.strokeStyle = color;
		this.context.fillStyle = color;

		// set lazy brush settings?? // this.brush.lazy.setRadius(radius) // if enabled=true radius=0?
	}

	protected async drawPath(path: Path, delay?: number) {
		if (path.points.length && path.points.length < 2) this.drawDot(path);
		if (path.points.length < 2) return;

		let p1 = path.points[0]; // cur?
		let p2 = path.points[1]; // old?

		this.context.moveTo(p2.x, p2.y);
		this.context.beginPath();

		for (let i = 1, len = path.points.length; i < len; i++) {
			const midPoint = this.getMidCoords(p1, p2);
			this.context.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);

			p1 = path.points[i];
			p2 = path.points[i + 1];

			if (delay) {
				this.context.stroke();
				await waitFor(delay);
			}
		}

		if (!delay) this.context.stroke();
	}

	protected drawDot(path: Path) {
		console.log("dot!");

		const { size, cap } = this.brush;
		const { x, y } = path.points[0];

		this.context.beginPath();

		const r = size / 2;
		if (cap === "round") this.context.arc(x, y, r, 0, 2 * Math.PI);
		if (cap !== "round") this.context.rect(x - r, y - r, size, size);

		this.context.fill();
	}

	protected drawFill(path: Path) {}

	protected getMidCoords(p1: Coordinates, p2: Coordinates) {
		return {
			x: p1.x + (p2.x - p1.x) / 2,
			y: p1.y + (p2.y - p1.y) / 2,
		};
	}
}
