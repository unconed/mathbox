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
import * as UGLSL from "../../../util/glsl.js";
import { Operator } from "./operator.js";
/*
split:
  order:       Types.transpose('wxyz')
  axis:        Types.axis()
  overlap:     Types.int(0)
*/
export class Join extends Operator {
    static initClass() {
        this.traits = ["node", "bind", "operator", "source", "index", "join"];
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
        let left;
        let dim;
        const { order, axis, stride } = this;
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
        const product = ((left = set[index + 1]) != null ? left : 1) * stride;
        set.splice(index, 2, product);
        set = set.slice(0, 3);
        set.push(1);
        const out = {};
        for (let i = 0; i < mapped.length; i++) {
            dim = mapped[i];
            out[dim] = set[i];
        }
        //console.log 'join', order, axis, length, stride
        //console.log dims, out
        return out;
    }
    make() {
        super.make();
        if (this.bind.source == null) {
            return;
        }
        const { order } = this.props;
        let { axis } = this.props;
        let { overlap } = this.props;
        /*
        Calculate index transform
    
        order: wxyz
        length: 3
        overlap: 1
    
        axis: w
        index: 0
        rest: 00xy
    
        axis: x
        index: 1
        rest: w00y
    
        axis: y
        index: 2
        rest: wx00
    
        axis: z
        index: 3
        rest: wxy0
    
        */
        const permute = order.join("");
        if (axis == null) {
            axis = order[0];
        }
        const index = permute.indexOf(axis);
        const rest = permute.replace(axis, "00").substring(0, 4);
        const labels = [null, "width", "height", "depth", "items"];
        const major = labels[axis];
        // Prepare uniforms
        const dims = this.bind.source.getDimensions();
        const length = dims[major];
        overlap = Math.min(length - 1, overlap);
        const stride = length - overlap;
        const uniforms = {
            joinStride: this._attributes.make(this._types.number(stride)),
            joinStrideInv: this._attributes.make(this._types.number(1 / stride)),
        };
        // Build shader to split a dimension into two
        const transform = this._shaders.shader();
        transform.require(UGLSL.swizzleVec4(axis, 1));
        transform.require(UGLSL.swizzleVec4(rest, 4));
        transform.require(UGLSL.injectVec4([index, index + 1]));
        transform.pipe("join.position", uniforms);
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
        if (touched["join"] || touched["operator"]) {
            return this.rebuild();
        }
    }
}
Join.initClass();
