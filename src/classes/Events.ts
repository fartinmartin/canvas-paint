type Listener = { event: string; callback: Function };

export class EventEmitter {
	private _listeners: Listener[] = [];

	on(event: string, callback: Function) {
		this._listeners.push({ event, callback });
	}

	off(event: string, callback: Function) {
		this._listeners = this._listeners.filter((listener) => {
			return !(listener.event === event && listener.callback === callback);
		});
	}

	trigger(event: string, data: unknown) {
		this._listeners
			.filter((listener) => listener.event === event)
			.forEach(({ callback }) => callback(data));
	}

	removeAllListeners() {
		this._listeners = [];
	}
}
