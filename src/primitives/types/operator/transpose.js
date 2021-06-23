// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl";
import { Operator } from "./operator";

const labels = {
  1: "width",
  2: "height",
  3: "depth",
  4: "items",
};

export class Transpose extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "transpose"];
  }

  indexShader(shader) {
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return super.indexShader(shader);
  }

  sourceShader(shader) {
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return super.sourceShader(shader);
  }

  getDimensions() {
    return this._remap(this.transpose, this.bind.source.getDimensions());
  }
  getActiveDimensions() {
    return this._remap(this.transpose, this.bind.source.getActiveDimensions());
  }
  getFutureDimensions() {
    return this._remap(this.transpose, this.bind.source.getFutureDimensions());
  }
  getIndexDimensions() {
    return this._remap(this.transpose, this.bind.source.getIndexDimensions());
  }

  _remap(transpose, dims) {
    // Map dimensions onto their new axis
    const out = {};

    for (let i = 0; i <= 3; i++) {
      const dst = labels[i + 1];
      const src = labels[transpose[i]];
      out[dst] = dims[src] != null ? dims[src] : 1;
    }

    return out;
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Transposition order
    const { order } = this.props;
    if (order.join() !== "1234") {
      this.swizzler = UGLSL.invertSwizzleVec4(order);
    }
    this.transpose = order;

    // Notify of reallocation
    return this.trigger({
      type: "source.rebuild",
    });
  }

  unmake() {
    super.unmake();
    return (this.swizzler = null);
  }

  change(changed, touched, _init) {
    if (touched["transpose"] || touched["operator"]) {
      return this.rebuild();
    }
  }
}
Transpose.initClass();
