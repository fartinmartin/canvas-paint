import { Path } from "./Path";

export class CommandStack {
	private _stack: string[] = [];
	private _redo: string[] = [];

	constructor(private _state: Path[] = []) {
		this._stack.push(JSON.stringify(this._state));
	}

	get state() {
		const latestPath = this._stack[this._stack.length - 1];
		return JSON.parse(latestPath);
	}

	execute(command: Command) {
		const commandPath = command.execute(this.state);
		const stringPath = JSON.stringify(commandPath);
		this._stack.push(stringPath);
	}

	undo() {
		if (this._stack.length > 1) {
			this._redo.push(this._stack.pop()!);
		}
	}

	redo() {
		if (this._redo.length >= 1) {
			this._stack.push(this._redo.pop()!);
		}
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
