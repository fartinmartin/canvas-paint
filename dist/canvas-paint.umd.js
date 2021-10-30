(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["canvas-paint"] = {}));
})(this, (function (exports) { 'use strict';

	var index = (function () { return "hello"; });

	exports.hello = index;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
