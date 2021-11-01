(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["canvas-paint"] = {}));
})(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var isTouch = function () { return "ontouchstart" in window.document; };
    var getInputCoords = function (event, canvas) {
        var x, y;
        if (isTouch()) {
            x = event.touches[0].pageX;
            y = event.touches[0].pageY;
        }
        else {
            x = event.pageX;
            y = event.pageY;
        }
        // check this every time for real-time resizing
        var elBCRect = canvas.getBoundingClientRect();
        // need to consider scrolled positions
        var elRect = {
            left: elBCRect.left + window.pageXOffset,
            top: elBCRect.top + window.pageYOffset,
        };
        // if canvas has styled
        var elScale = {
            x: canvas.width / elBCRect.width,
            y: canvas.height / elBCRect.height,
        };
        return {
            x: (x - elRect.left) * elScale.x,
            y: (y - elRect.top) * elScale.y,
        };
    };

    /**
     *
     * Minimal EventEmitter implementation
     * See `https://gist.github.com/leader22/3ab8416ce41883ae1ccd`
     *
     */
    var Eve = /** @class */ (function () {
        function Eve() {
            this._events = {};
            this._events = {};
        }
        Eve.prototype.on = function (evName, handler) {
            var events = this._events;
            if (!(evName in events))
                events[evName] = [];
            events[evName].push(handler);
        };
        Eve.prototype.off = function (evName, handler) {
            var events = this._events;
            if (!(evName in events))
                return;
            if (!handler)
                events[evName] = [];
            var handlerIdx = events[evName].indexOf(handler);
            if (handlerIdx >= 0)
                events[evName].splice(handlerIdx, 1);
        };
        Eve.prototype.trigger = function (evName, evData) {
            var events = this._events;
            if (!(evName in events))
                return;
            for (var i = 0; i < events[evName].length; i++) {
                var handler = events[evName][i];
                handler.handleEvent
                    ? handler.handleEvent.call(this, evData)
                    : handler.call(this, evData);
            }
        };
        Eve.prototype.removeAllListeners = function () {
            this._events = {};
        };
        return Eve;
    }());

    var Paint = /** @class */ (function () {
        function Paint(element, options) {
            // merges options with defaults
            this._options = __assign({ width: 100, height: 100, dpr: true, displayScale: 1, background: "white", brush: {
                    size: 3,
                    color: "#000000",
                    mode: "draw",
                } }, options);
            // set locals
            this._canvas = element;
            this._context = this._canvas.getContext("2d");
            this._timer = null;
            this._dpr = options.dpr ? window.devicePixelRatio : 1;
            this._scale = options.displayScale ? this._options.displayScale : 1;
            this._eve = new Eve();
            this._isDrawing = false;
            this._coords = {
                past: { x: 0, y: 0 },
                current: { x: 0, y: 0 },
            };
            // set scale
            this._canvas.style.width = this._options.width * this._scale + "px";
            this._canvas.style.height = this._options.height * this._scale + "px";
            this._canvas.width = Math.floor(this._options.width * this._dpr);
            this._canvas.height = Math.floor(this._options.height * this._dpr);
            this._context.scale(this._dpr, this._dpr);
            // set bg
            this.clear();
            this._canvas.style.background = this._options.background;
            // set "brush" (should this be left to the user of the lib?)
            this._context.lineCap = this._context.lineJoin = "round";
            this.setColor(this._options.brush.color);
            this.setSize(this._options.brush.size);
            this.setMode("draw");
            this._bindEvents();
            this._drawFrame();
        }
        Object.defineProperty(Paint.prototype, "canvas", {
            get: function () {
                return this._canvas;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "history", {
            get: function () {
                return this._history;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Paint.prototype, "observer", {
            get: function () {
                return this._eve; // this is really cool
            },
            enumerable: false,
            configurable: true
        });
        Paint.prototype.setMode = function (mode) {
            this._mode = mode;
            this._context.globalCompositeOperation =
                this._mode === "erase" ? "destination-out" : "source-over";
        };
        Paint.prototype.setSize = function (size) {
            this._context.lineWidth = ((size | 0 || 1) * this._dpr) / this._scale;
        };
        Paint.prototype.setColor = function (color) {
            this._context.strokeStyle = color;
            this._context.fillStyle = color;
        };
        // use this to load artwork (can/should this be alias'd with "load()"?)
        Paint.prototype.setHistory = function (history) {
            this._history = history;
        };
        Paint.prototype._handleEvents = function (event) {
            event.preventDefault();
            event.stopPropagation();
            switch (event.type) {
                case "mousedown":
                case "touchstart":
                    this._onInputDown(event);
                    break;
                case "mousemove":
                case "touchmove":
                    this._onInputMove(event);
                    break;
                case "mouseup":
                case "touchend":
                    this._onInputUp();
                    break;
                case "mouseout":
                case "touchcancel":
                case "gesturestart":
                    this._onInputCancel();
                    break;
            }
        };
        Paint.prototype._bindEvents = function () {
            var _this = this;
            var events = isTouch()
                ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
                : ["mousedown", "mousemove", "mouseup", "mouseout"];
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var ev = events_1[_i];
                this._canvas.addEventListener(ev, function (e) { return _this._handleEvents(e); }, false);
            }
        };
        Paint.prototype._unbindEvents = function () {
            var _this = this;
            var events = isTouch()
                ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
                : ["mousedown", "mousemove", "mouseup", "mouseout"];
            for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                var ev = events_2[_i];
                this._canvas.removeEventListener(ev, function (e) { return _this._handleEvents(e); }, false);
            }
        };
        Paint.prototype._drawFrame = function () {
            var _this = this;
            this._timer = requestAnimationFrame(function () { return _this._drawFrame(); });
            if (!this._isDrawing)
                return;
            this._coords.past.x === this._coords.current.x &&
                this._coords.past.y === this._coords.current.y;
            var ctx = this._context;
            var coords = this._coords;
            if (this._mode !== "fill") {
                ctx.beginPath();
                ctx.moveTo(coords.past.x, coords.past.y);
                ctx.lineTo(coords.current.x, coords.current.y);
                ctx.stroke();
            }
            else {
                this._fill();
            }
            this._coords.past = this._coords.current;
        };
        Paint.prototype._onInputDown = function (event) {
            this._isDrawing = true;
            this._drawBegin(event);
        };
        Paint.prototype._onInputMove = function (event) {
            if (this._isDrawing)
                this._drawing(event);
        };
        Paint.prototype._onInputUp = function () {
            this._drawEnd();
            this._isDrawing = false;
        };
        Paint.prototype._onInputCancel = function () {
            if (this._isDrawing)
                this._drawEnd();
            this._isDrawing = false;
        };
        Paint.prototype._drawBegin = function (event) {
            var coords = getInputCoords(event, this._canvas);
            this._coords.current = this._coords.past = coords;
            this._eve.trigger("drawBegin", this._coords.current);
        };
        Paint.prototype._drawing = function (event) {
            this._coords.current = getInputCoords(event, this._canvas);
            if (this._mode !== "fill") {
                this._eve.trigger("drawing", this._coords.current);
                // TODO: should push a Point to [???] on every event (using history.ts ?)
            }
        };
        Paint.prototype._drawEnd = function () {
            this._eve.trigger("drawEnd", this._coords.current);
            this._saveHistory();
            // TODO: should push an Point[] + brush mode to [???] on every event (using history.ts ?)
        };
        Paint.prototype._fill = function () {
            this._isDrawing = false;
            console.log("fill");
            // TODO: implement flood fill
        };
        Paint.prototype._saveHistory = function () {
            // this._history.save(this.toDataURL());
            // this._ev.trigger("save", this._history.value);
        };
        Paint.prototype.clear = function () {
            this._context.fillStyle = this._options.background;
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            this._saveHistory(); // TODO: should push a [???] to [???] on event (using history.ts ?)
        };
        return Paint;
    }());

    var canvasPaint = function (element, options) {
        if (!(element instanceof HTMLCanvasElement))
            throw new TypeError("HTMLCanvasElement must be passed as first argument!");
        var p = new Paint(element, options);
        return p;
    };
    // get <canvas> element
    //
    // state
    // ├─ canvasOptions
    // ├─ drawing
    // ├─ mode
    // ├─ size
    // ├─ color
    //
    // handle()
    // ├─ draw()
    // ├─ erase()
    // ├─ fill()
    //
    // history()
    // ├─ undo()
    // ├─ redo()
    // ├─ clear()
    //
    // return (?) context so that I can manipulate it as I wish

    exports.canvasPaint = canvasPaint;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=canvas-paint.umd.js.map
