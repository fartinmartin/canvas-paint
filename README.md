# canvas-paint

```
// TODO: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
```

## Install

```
npm i canvas-paint
```

## Usage

```js
import { Paint } from "canvas-paint";

const root = document.getElementById("root");
const paint = new Paint(root, { width: 200, height: 200 });
```

## Options

| option     | default        | description                           |
| ---------- | -------------- | ------------------------------------- |
| `width`    | `200`          | number                                |
| `height`   | `200`          | number                                |
| `bgColor`  | `"whitesmoke"` | CSS style string                      |
| `debounce` | `500`          | `ms` value passed to `ResizeObserver` |
| ---------- | -------------- | ------------------------------------- |
| `showUI`   | `true`         | `TBD`                                 |
| `UIcolor`  | `true`         | `TBD`                                 |
| `UIradius` | `true`         | `TBD`                                 |

## Methods

| method                | parameter                             |
| --------------------- | ------------------------------------- |
| `setSize(size)`       | number                                |
| `setColor(color)`     | CSS style string                      |
| `setMode(mode)`       | `"draw"` \| `"erase"` \| `"fill"`     |
| `setCap(cap)`         | `"butt"` \| `"round"` \| `"square"`   |
| `setJoin(join)`       | `"round"` \| `"bevel"` \| `"miter"`   |
| --------------------- | ------------------------------------- |
| `undo()`              |                                       |
| `redo()`              |                                       |
| --------------------- | ------------------------------------- |
| `clear()`             |                                       |
| `drawHistory(delay?)` | optional `ms` value                   |
| `save()`              |                                       |
| `load(drawing)`       | `Drawing`                             |
| --------------------- | ------------------------------------- |
| `removeListeners`     |                                       |
| --------------------- | ------------------------------------- |
| `setUIColor()`        | `TBD`                                 |
| `setUIRadius()`       | `TBD`                                 |

## Properties

| property      | description |
| ------------- | ----------- |
| `canUndo`     |             |
| `canRedo`     |             |
| `scale`       |             |
| `aspectRatio` |             |
| `path`        |             |
| ------------- | ----------- |
| `size`        | `TBD`       |
| `color`       | `TBD`       |
| `mode`        | `TBD`       |
| `cap`         | `TBD`       |
| `join`        | `TBD`       |

> Do we need to make properties 'reactive' for JS frameworks?

## Events

| event    | description |
| -------- | ----------- |
| `start`  |             |
| `draw`   |             |
| `end`    |             |
| `cancel` |             |
| `path`   |             |
