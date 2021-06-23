// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl";
import { Operator } from "./operator";

/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  length:      Types.int(1)
  overlap:     Types.int(0)
*/

export class Split extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "split"];
  }

  indexShader(shader) {
    shader.pipe(this.operator);
    return super.indexShader(shader);
  }

  sourceShader(shader) {
    shader.pipe(this.operator);
    return super.sourceShader(shader);
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

  _resample(dims) {
    let dim;
    const { order } = this;
    const { axis } = this;
    const { overlap } = this;
    const { length } = this;
    const { stride } = this;

    const labels = ["width", "height", "depth", "items"];
    const mapped = order.map((x) => labels[x - 1]);
    const index = order.indexOf(axis);
    let set = (() => {
      const result = [];
      for (dim of Array.from(mapped)) {
        result.push(dims[dim]);
      }
      return result;
    })();
    const remain = Math.floor((set[index] - overlap) / stride);

    set.splice(index, 1, length, remain);
    set = set.slice(0, 4);

    const out = {};
    for (let i = 0; i < mapped.length; i++) {
      dim = mapped[i];
      out[dim] = set[i];
    }

    //console.log 'split', order, axis, length, stride
    //console.log dims, out

    return out;
  }

  make() {
    let left;
    super.make();
    if (this.bind.source == null) {
      return;
    }

    const { order } = this.props;
    let { axis } = this.props;
    let { overlap } = this.props;
    const { length } = this.props;

    /*
    Calculate index transform

    order: wxyz
    length: 3
    overlap: 1

    axis: w
    index: 0
    split: wx
    rest:  0yz0
           s

    axis: x
    index: 1
    split: xy
    rest:  w0z0
            s

    axis: y
    index: 2
    split: yz
    rest:  wx00
             s

    axis: z
    index: 3
    split: z0
    rest: wxy0
             s

    */

    const permute = order.join("");
    if (axis == null) {
      axis = order[0];
    }

    const index = permute.indexOf(axis);
    const split =
      permute[index] + ((left = permute[index + 1]) != null ? left : 0);
    const rest = permute.replace(split[1], "").replace(split[0], "0") + "0";

    // Prepare uniforms
    overlap = Math.min(length - 1, overlap);
    const stride = length - overlap;

    const uniforms = {
      splitStride: this._attributes.make(this._types.number(stride)),
    };

    // Build shader to split a dimension into two
    const transform = this._shaders.shader();
    transform.require(UGLSL.swizzleVec4(split, 2));
    transform.require(UGLSL.swizzleVec4(rest, 4));
    transform.require(UGLSL.injectVec4(index));
    transform.pipe("split.position", uniforms);
    transform.pipe(UGLSL.invertSwizzleVec4(order));

    this.operator = transform;

    this.order = order;
    this.axis = axis;
    this.overlap = overlap;
    this.length = length;
    return (this.stride = stride);
  }

  unmake() {
    return super.unmake();
  }

  change(changed, touched, _init) {
    if (
      changed["split.axis"] ||
      changed["split.order"] ||
      touched["operator"]
    ) {
      return this.rebuild();
    }
  }
}
Split.initClass();
