// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Matrix } from "./matrix";

export class Area extends Matrix {
  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "source",
      "index",
      "matrix",
      "texture",
      "raw",
      "span:x",
      "span:y",
      "area",
      "sampler:x",
      "sampler:y",
    ];
  }

  updateSpan() {
    let inverseX, inverseY;
    const dimensions = this.props.axes;
    let { width } = this.props;
    let { height } = this.props;

    const { centeredX } = this.props;
    const { centeredY } = this.props;

    const padX = this.props.paddingX;
    const padY = this.props.paddingY;

    const rangeX = this._helpers.span.get("x.", dimensions[0]);
    const rangeY = this._helpers.span.get("y.", dimensions[1]);

    this.aX = rangeX.x;
    this.aY = rangeY.x;

    const spanX = rangeX.y - rangeX.x;
    const spanY = rangeY.y - rangeY.x;

    width += padX * 2;
    height += padY * 2;

    if (centeredX) {
      inverseX = 1 / Math.max(1, width);
      this.aX += (spanX * inverseX) / 2;
    } else {
      inverseX = 1 / Math.max(1, width - 1);
    }

    if (centeredY) {
      inverseY = 1 / Math.max(1, height);
      this.aY += (spanY * inverseY) / 2;
    } else {
      inverseY = 1 / Math.max(1, height - 1);
    }

    this.bX = spanX * inverseX;
    this.bY = spanY * inverseY;

    this.aX += padX * this.bX;
    return (this.aY += padY * this.bY);
  }

  callback(callback) {
    this.updateSpan();

    if (this.last === callback) {
      return this._callback;
    }
    this.last = callback;

    if (callback.length <= 5) {
      return (this._callback = (emit, i, j) => {
        const x = this.aX + this.bX * i;
        const y = this.aY + this.bY * j;
        return callback(emit, x, y, i, j);
      });
    } else {
      return (this._callback = (emit, i, j) => {
        const x = this.aX + this.bX * i;
        const y = this.aY + this.bY * j;
        return callback(emit, x, y, i, j, this.bufferClock, this.bufferStep);
      });
    }
  }

  make() {
    super.make();
    this._helpers.span.make();
    return this._listen(this, "span.range", this.updateSpan);
  }

  unmake() {
    super.unmake();
    return this._helpers.span.unmake();
  }
}
Area.initClass();
