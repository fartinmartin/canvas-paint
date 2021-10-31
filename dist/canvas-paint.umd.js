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

    var Paint = /** @class */ (function () {
        function Paint(element, options) {
            // merges options with defaults
            this._options = __assign({ width: 100, height: 100, dpr: true, displayScale: 1, background: "white", brush: {
                    size: 1,
                    color: "#000000",
                    mode: "draw",
                } }, options);
            // set locals
            this._canvas = element;
            this._context = this._canvas.getContext("2d");
            this._dpr = options.dpr ? window.devicePixelRatio : 1;
            this._scale = options.displayScale ? this._options.displayScale : 1;
            // set scale
            this._canvas.style.width = this._options.width * this._scale + "px";
            this._canvas.style.height = this._options.height * this._scale + "px";
            this._canvas.width = Math.floor(this._options.width * this._dpr);
            this._canvas.height = Math.floor(this._options.height * this._dpr);
            this._context.scale(this._dpr, this._dpr);
            // set bg
            this._context.fillStyle = this._options.background;
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            // set "brush" (should this be left to the user of the lib?)
            this._context.lineCap = this._context.lineJoin = "round";
            this.setColor(this._options.brush.color);
            this.setSize(this._options.brush.size);
            this.setMode("draw");
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
        Paint.prototype.setMode = function (mode) {
            this._mode = mode;
        };
        Paint.prototype.setSize = function (size) {
            this._context.lineWidth = (size | 0 || 1) * this._dpr;
        };
        Paint.prototype.setColor = function (color) {
            this._context.strokeStyle = color;
            this._context.fillStyle = color;
        };
        // use this to load artwork (can/should this be alias'd with "load()"?)
        Paint.prototype.setHistory = function (history) {
            this._history = history;
        };
        Paint.prototype.handleEvent = function (event) {
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
            var events = isTouch()
                ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
                : ["mousedown", "mousemove", "mouseup", "mouseout"];
            for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                var ev = events_1[_i];
                this._canvas.addEventListener(ev, this, false);
            }
        };
        Paint.prototype._unbindEvents = function () {
            var events = isTouch()
                ? ["touchstart", "touchmove", "touchend", "touchcancel", "gesturestart"]
                : ["mousedown", "mousemove", "mouseup", "mouseout"];
            for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                var ev = events_2[_i];
                this._canvas.removeEventListener(ev, this, false);
            }
        };
        Paint.prototype._drawFrame = function () {
            // this._timer = requestAnimationFrame(() => this._drawFrame());
            // if (!this._isDrawing) return;
            // const isSameCoords =
            //   this._coords.old.x === this._coords.current.x &&
            //   this._coords.old.y === this._coords.current.y;
            // const currentMid = getMidInputCoords(
            //   this._coords.old,
            //   this._coords.current
            // );
            // const ctx = this._ctx;
            // ctx.beginPath();
            // ctx.moveTo(currentMid.x, currentMid.y);
            // ctx.quadraticCurveTo(
            //   this._coords.old.x,
            //   this._coords.old.y,
            //   this._coords.oldMid.x,
            //   this._coords.oldMid.y
            // );
            // ctx.stroke();
            // this._coords.old = this._coords.current;
            // this._coords.oldMid = currentMid;
            // if (!isSameCoords) this._ev.trigger("draw", this._coords.current);
        };
        Paint.prototype._onInputDown = function (event) {
            this._isDrawing = true;
            // const coords = getInputCoords(event, this._$el);
            // this._coords.current = this._coords.old = coords;
            // this._coords.oldMid = getMidInputCoords(this._coords.old, coords);
            // this._ev.trigger("drawBegin", this._coords.current);
        };
        Paint.prototype._onInputMove = function (event) {
            // this._coords.current = getInputCoords(ev, this._$el);
        };
        Paint.prototype._onInputUp = function () {
            // this._ev.trigger("drawEnd", this._coords.current);
            // this._saveHistory();
            this._isDrawing = false;
        };
        Paint.prototype._onInputCancel = function () {
            if (this._isDrawing) ;
            this._isDrawing = false;
        };
        Paint.prototype._saveHistory = function () {
            // this._history.save(this.toDataURL());
            // this._ev.trigger("save", this._history.value);
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
