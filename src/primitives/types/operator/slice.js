// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator.js";

export class Slice extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "slice"];
  }

  getDimensions() {
    return this._resample(this.bind.source.getDimensions());
  }
  getActiveDimensions() {
    return this._resample(this.bind.source.getActiveDimensions());
  }
  getFutureDimensions() {
    return this._resample(this.bind.source.getFutureDimensions());
  }
  getIndexDimensions() {
    return this._resample(this.bind.source.getIndexDimensions());
  }

  sourceShader(shader) {
    shader.pipe("slice.position", this.uniforms);
    return this.bind.source.sourceShader(shader);
  }

  _resolve(key, dims) {
    const range = this.props[key];
    const dim = dims[key];
    if (range == null) {
      return [0, dim];
    }

    const index = function (i, dim) {
      if (i < 0) {
        return dim + i;
      } else {
        return i;
      }
    };

    const start = index(Math.round(range.x), dim);
    let end = index(Math.round(range.y), dim);

    end = Math.max(start, end);
    return [start, end - start];
  }

  _resample(dims) {
    dims.width = this._resolve("width", dims)[1];
    dims.height = this._resolve("height", dims)[1];
    dims.depth = this._resolve("depth", dims)[1];
    dims.items = this._resolve("items", dims)[1];
    return dims;
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    return (this.uniforms = {
      sliceOffset: this._attributes.make(this._types.vec4()),
    });
  }

  unmake() {
    return super.unmake();
  }

  resize() {
    if (this.bind.source == null) {
      return;
    }

    const dims = this.bind.source.getActiveDimensions();

    this.uniforms.sliceOffset.value.set(
      this._resolve("width", dims)[0],
      this._resolve("height", dims)[0],
      this._resolve("depth", dims)[0],
      this._resolve("items", dims)[0]
    );

    return super.resize();
  }

  change(changed, touched, _init) {
    if (touched["operator"]) {
      return this.rebuild();
    }

    if (touched["slice"]) {
      return this.resize();
    }
  }
}
Slice.initClass();
