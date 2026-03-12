import { Path } from "./path";
import { Point } from "./point";

export class CommandStack {
	private _paths: Path[] = [];
	private _cursor: number = 0;

	constructor(initialState: Path[] = []) {
		this._paths = [...initialState];
		this._cursor = this._paths.length;
	}

	get state() {
		return this._paths.slice(0, this._cursor);
	}

	reset() {
		this._paths = [];
		this._cursor = 0;
	}

	execute(command: Command) {
		const newState = command.execute(this._paths.slice(0, this._cursor));
		this._paths = newState;
		this._cursor = newState.length;
	}

	undo() {
		if (this.canUndo) this._cursor--;
	}

	redo() {
		if (this.canRedo) this._cursor++;
	}

	get canUndo() {
		return this._cursor > 0;
	}

	get canRedo() {
		return this._cursor < this._paths.length;
	}
}

export abstract class Command {
	abstract execute(state: Path[]): Path[];
}

export class AddPath extends Command {
	constructor(private _value: Path) {
		super();
	}

	execute(state: Path[]) {
		state.push(this._value);
		return state;
	}
}

export class AddClear extends Command {
	constructor() {
		super();
	}

	execute(state: Path[]) {
		const points = [new Point(0, 0, "transparent", 0)];
		const path = new Path(points, "clear", 1, "round", "round", 0);
		state.push(path);
		return state;
	}
}
