import { LazyBrush } from "lazy-brush";

import { UI, UIOptions } from "./canvas/UI";
import { Temp } from "./canvas/Temp";
import { Artboard } from "./canvas/Artboard";
import { Grid, GridOptions } from "./canvas/Grid";
import { CanvasOptions } from "./canvas/Canvas";
import { namespace } from "./utils/uuid";
import { Brush } from "./classes/Brush";

export type PaintOptions = CanvasOptions &
	UIOptions &
	GridOptions & {
		width: number;
		height: number;
	};

export class Paint {
	id: string;
	styles: CSSStyleSheet;

	ui: UI;
	temp: Temp;
	artboard: Artboard;
	grid: Grid;

	lazy = new LazyBrush();
	brush: Brush;

	subscriptions: (() => void)[];

	constructor(public root: HTMLElement, public options: PaintOptions) {
		this.id = namespace + "container";
		this.root.classList.add(this.id);
		this.styles = this.createStyles()!;

		this.brush = new Brush(root, this.lazy, options);

		this.ui = new UI(root, this.lazy, this.brush, options);
		this.temp = new Temp(root, options);
		this.artboard = new Artboard(root, options);
		this.grid = new Grid(root, options);

		this.subscriptions = this.setSubscriptions();
	}

	setSubscriptions() {
		// 1. when mouse/brush moves, update UI
		const ui = this.brush.subscribe(() => {
			const pointer = this.lazy.getPointerCoordinates();
			const coords = this.lazy.getBrushCoordinates();
			this.ui.drawInterface(pointer, coords);
		});

		// 2. when mouse/brush moves, if brush.isPressing, update temp
		const temp = this.brush.subscribe((brush) => {
			if (brush.isPressing) {
				// console.log(brush);
			}
		});

		return [ui, temp];
	}

	removeSubscriptions() {
		this.subscriptions.forEach((unsub) => unsub());
	}

	createStyles() {
		// ⚠️ TODO: check if stylesheet with this ID exists!
		const styleSheet = document.createElement("style");
		styleSheet.id = namespace + "base-styles";

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
