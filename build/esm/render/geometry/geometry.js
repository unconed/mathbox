// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
export class Geometry extends BufferGeometry {
    constructor() {
        super();
        new BufferGeometry(this);
        if (this.uniforms == null) {
            this.uniforms = {};
        }
        if (this.groups == null) {
            this.groups = [];
        }
    }
    _reduce(dims, maxs) {
        let multiple = false;
        for (let i = 0; i < dims.length; i++) {
            const dim = dims[i];
            const max = maxs[i];
            if (multiple) {
                dims[i] = max;
            }
            if (dim > 1) {
                multiple = true;
            }
        }
        return dims.reduce((a, b) => a * b);
    }
    _emitter(name) {
        const attribute = name == "index" ? this.getIndex() : this.getAttribute(name);
        const dimensions = attribute.itemSize;
        const { array } = attribute;
        let offset = 0;
        const one = function (a) {
            array[offset++] = a;
        };
        const two = function (a, b) {
            array[offset++] = a;
            array[offset++] = b;
        };
        const three = function (a, b, c) {
            array[offset++] = a;
            array[offset++] = b;
            array[offset++] = c;
        };
        const four = function (a, b, c, d) {
            array[offset++] = a;
            array[offset++] = b;
            array[offset++] = c;
            array[offset++] = d;
        };
        return [null, one, two, three, four][dimensions];
    }
    _finalize() {
        return;
    }
    _offsets(offsets) {
        this.groups = offsets;
    }
}
