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
            // set "brush"
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
        Object.defineProperty(Paint.prototype, "mode", {
            get: function () {
                return this._mode;
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
