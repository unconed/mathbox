// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Array_ } from "./array";

export class Interval extends Array_ {
  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "source",
      "index",
      "texture",
      "array",
      "span",
      "interval",
      "sampler",
      "raw",
    ];
  }

  updateSpan() {
    let inverse;
    const dimension = this.props.axis;
    let { width } = this.props;
    const { centered } = this.props;
    const pad = this.props.padding;

    const range = this._helpers.span.get("", dimension);

    width += pad * 2;

    this.a = range.x;
    const span = range.y - range.x;

    if (centered) {
      inverse = 1 / Math.max(1, width);
      this.a += (span * inverse) / 2;
    } else {
      inverse = 1 / Math.max(1, width - 1);
    }

    this.b = span * inverse;

    return (this.a += pad * this.b);
  }

  callback(callback) {
    this.updateSpan();

    if (this.last === callback) {
      return this._callback;
    }
    this.last = callback;

    if (callback.length <= 3) {
      return (this._callback = (emit, i) => {
        const x = this.a + this.b * i;
        return callback(emit, x, i);
      });
    } else {
      return (this._callback = (emit, i) => {
        const x = this.a + this.b * i;
        return callback(emit, x, i, this.bufferClock, this.bufferStep);
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
Interval.initClass();
