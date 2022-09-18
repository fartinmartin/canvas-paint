import { namespace, uuid } from "../utils/uuid";

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
}
