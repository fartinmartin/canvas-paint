import { LazyBrush } from "lazy-brush";

import { UI, UIOptions } from "./canvas/UI";
import { Temp } from "./canvas/Temp";
import { Artboard } from "./canvas/Artboard";
import { Grid, GridOptions } from "./canvas/Grid";
import { CanvasOptions } from "./canvas/Canvas";
import { namespace } from "./utils/uuid";
import { Brush } from "./classes/Brush";

import { AddPath, CommandStack } from "./classes/Command";
import { EventEmitter } from "./classes/Events";
import { Path } from "./classes/Path";

export type PaintOptions = CanvasOptions &
	UIOptions &
	GridOptions & {
		width: number;
		height: number;
	};

export class Paint {
	id: string;
	private listeners: (() => void)[];

	ui: UI;
	temp: Temp;
	artboard: Artboard;
	grid: Grid;

	brush: Brush;
	history = new CommandStack();
	events = new EventEmitter();

	path = new Path([], "draw", 1);

	constructor(public root: HTMLElement, private options: PaintOptions) {
		this.id = namespace + "container";
		this.root.classList.add(this.id);
		this.createStyles();

		this.brush = new Brush(root, options);

		this.ui = new UI(root, this.brush, options);
		this.temp = new Temp(root, this.brush, options);
		this.artboard = new Artboard(root, this.brush, options);
		this.grid = new Grid(root, options);

		this.listeners = this.addListeners();
	}

	private addListeners() {
		// when mouse/brush moves, update UI canvas
		const ui = this.brush.events.on("move", () => {
			const pointer = this.brush.lazy.getPointerCoordinates();
			const coords = this.brush.lazy.getBrushCoordinates();
			this.ui.drawInterface(pointer, coords);
		});

		// when mouse/brush moves, if brush.isDrawinging, update current path
		const temp = this.brush.events.on("move", (brush: any) => {
			if (brush.isDrawing) this.temp.draw(this.path);
		});

		// when mouse/brush moves, if brush.isDrawinging, update current path
		const path = this.brush.events.on("move", (brush: any) => {
			if (brush.isDrawing) this.path.points.push(brush.coords);
		});

		// handle edge case of "click" for dots
		const dot = this.brush.events.on("down", (brush: any) => {
			this.temp.draw(this.path);
			this.path.points.push(brush.coords);
		});

		// when mouse/brush releases, if brush.isDrawinging, commit path to artboard and histroy
		const commit = this.brush.events.on("up", (brush: any) => {
			this.temp.clear();
			this.artboard.draw(this.path);
			this.history.execute(new AddPath(this.path));
			this.path = new Path([], "draw", 1);
		});

		return [ui, temp, path, dot, commit];
	}

	removeListeners() {
		this.listeners.forEach((remove) => remove());
	}

	private createStyles() {
		const id = namespace + "base-styles";

		const exists = document.getElementById(id);
		if (exists) return;

		const styleSheet = document.createElement("style");
		styleSheet.id = id;

		const target = document.styleSheets[0]?.ownerNode;
		document.head.insertBefore(styleSheet, target);

		styleSheet.sheet!.insertRule(`.${this.id} { display: grid; }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} { width: ${this.options.width}px; height: ${this.options.height}px; }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} > canvas { grid-area: 1 / 1; }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} > canvas[class*="ui"] { z-index: 100 }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} > canvas[class*="temp"] { z-index: 80 }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} > canvas[class*="artboard"] { z-index: 60 }`); // prettier-ignore
		styleSheet.sheet!.insertRule(`.${this.id} > canvas[class*="grid"] { z-index: 40 }`); // prettier-ignore

		return styleSheet.sheet;
	}
}
