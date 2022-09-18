type Listener = { event: string; callback: Function };

export class EventEmitter {
	private _listeners: Listener[] = [];

	on<T>(event: string, callback: (data: T) => void) {
		this._listeners.push({ event, callback });
		return () =>
			(this._listeners = this._listeners.filter((listener) => {
				return !(listener.event === event && listener.callback === callback);
			}));
	}

	dispatch<T>(event: string, data: T) {
		this._listeners
			.filter((listener) => listener.event === event)
			.forEach(({ callback }) => callback(data));
	}

	removeAllListeners() {
		this._listeners = [];
	}
}
