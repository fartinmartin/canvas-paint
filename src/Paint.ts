import { UI, UIOptions } from "./canvas/UI";
import { Temp } from "./canvas/Temp";
import { Artboard } from "./canvas/Artboard";
import { Grid, GridOptions } from "./canvas/Grid";
import { CanvasOptions } from "./canvas/Canvas";

import { Brush, Cap, Mode, Join, BrushPayload, BrushOptions } from "./classes/Brush"; // prettier-ignore
import { AddPath, CommandStack } from "./classes/Command";
import { EventEmitter } from "./classes/Events";
import { Path } from "./classes/Path";
import { Point } from "./classes/Point";

import { namespace } from "./utils/uuid";
import { createStyles } from "./utils/styles";
import { resizeObserver } from "./utils/resize";
import { scalePoint } from "./utils/points";

export type PaintOptions = CanvasOptions & BrushOptions & UIOptions & GridOptions; // prettier-ignore

export class Paint {
	public ui: UI;
	public temp: Temp;
	public artboard: Artboard;
	public grid: Grid;

	public brush: Brush;
	public history = new CommandStack();
	public events = new EventEmitter();

	public points: Point[] = [];

	constructor(public root: HTMLElement, private options: PaintOptions) {
		const className = namespace + "container";
		this.root.classList.add(className);

		createStyles(className, namespace, this.options);
		resizeObserver(this.root, (e) => this.resize(e), this.options.debounce);

		// would it be better to pass `this` to each of these classes instead of cherry picking `this.bush` and `options`?
		this.brush = new Brush(root, options);

		this.ui = new UI(root, this.brush, options);
		this.temp = new Temp(root, this.brush, options);
		this.artboard = new Artboard(root, this.brush, options);
		this.grid = new Grid(root, options);

		this.addListeners();
	}

	private addListeners() {
		// when brush settings change, update UI canvas
		this.brush.events.on("brushUpdate", () => this.ui.drawInterface());
		// when brush moves, update UI canvas
		this.brush.events.on("move", () => this.ui.drawInterface());

		// when brush moves, if brush.isDrawing, update current path/points array then draw current path/points array on temp canvas
		this.brush.events.on("move", (brush: BrushPayload) => {
			if (brush.isDrawing && brush.mode !== "fill") {
				this.points.push(scalePoint(brush.point, this.scale));
				this.temp.draw(this.path);
				this.events.dispatch("draw", () => {});
			}
		});

		// handle edge case of "click" for dots and fills!
		this.brush.events.on("down", (brush: BrushPayload) => {
			if (brush.isDrawing) {
				this.points.push(scalePoint(brush.point, this.scale));
				this.temp.draw(this.path);
				this.events.dispatch("start", () => {});
			}
		});

		// when brush releases, commit path to artboard and histroy
		this.brush.events.on("up", (brush: BrushPayload) => {
			this.temp.clear();
			this.artboard.draw(this.path);
			this.history.execute(new AddPath(this.path));
			this.points = [];
			this.events.dispatch("end", () => {});
		});
	}

	removeListeners() {
		this.brush.events.removeAllListeners();
		this.events.removeAllListeners();
	}

	resize(entry: ResizeObserverEntry) {
		const width = entry.target.clientWidth;
		const newDimensions = { width, height: width / this.aspectRatio }; // TODO: have an option to opt out of aspectRatio resizing

		[this.ui, this.temp, this.artboard, this.grid].forEach((canvas) => {
			canvas.resize(newDimensions);
		});

		this.drawHistory();
	}

	get aspectRatio() {
		return this.options.width / this.options.height;
	}

	get scale() {
		return this.root.clientWidth / this.options.width;
	}

	get path() {
		return new Path(
			this.points,
			this.brush.mode,
			this.scale,
			this.brush.cap,
			this.brush.join,
			this.brush.tolerance
		);
	}

	undo() {
		if (!this.history.canUndo) return;
		this.history.undo();
		this.artboard.clear();
		this.drawHistory();
	}

	redo() {
		if (!this.history.canRedo) return;
		this.history.redo();
		this.artboard.clear();
		this.drawHistory();
	}

	async drawHistory(delay?: number) {
		this.artboard.clear();
		if (delay) {
			for (const path of this.history.state) {
				await this.temp.draw(path, delay); // draw lines point-by-point to temp
				this.artboard.draw(path); // draw lines immediately to artboard
				this.temp.clear(); // clear temp (these 3 steps reduce chunkiness)
			}
			this.drawHistory(); // run this again w/o delay to remove crunchiness
		} else {
			for (const path of this.history.state) await this.artboard.draw(path);
		}
	}
}
