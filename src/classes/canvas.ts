import { namespace, uuid } from "../utils/uuid";

export type CanvasOptions = {
	width: number;
	height: number;
	bgColor?: string;
	debounce?: number;
};

export class Canvas {
	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;
	public id: string;

	constructor(
		public root: HTMLElement,
		protected className: string,
		protected options: CanvasOptions
	) {
		this.canvas = this.createCanvas(className);

		this.context = this.canvas.getContext("2d")!;
		this.canvas.id = this.id = uuid();

		this.canvas.width = options?.width || this.canvas.width;
		this.canvas.height = options?.height || this.canvas.height;

		this.setDPI();
	}

	private createCanvas(className: string) {
		const canvas = document.createElement("canvas");
		canvas.classList.add(namespace + className);
		return this.root.appendChild(canvas);
	}

	protected setDPI(dimensions?: { width: number; height: number }) {
		// get current CSS size of the canvas
		const { width, height } = dimensions
			? dimensions
			: this.canvas.getBoundingClientRect();

		// increase the actual size of our canvas
		this.canvas.width = width * devicePixelRatio;
		this.canvas.height = height * devicePixelRatio;

		// ensure all drawing operations are scaled
		this.context.scale(devicePixelRatio, devicePixelRatio);

		// scale everything down using CSS
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";
	}

	resize(newDimensions: { width: number; height: number }) {
		this.setDPI(newDimensions);
	}

	get scale() {
		return this.root.clientWidth / this.options.width;
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
