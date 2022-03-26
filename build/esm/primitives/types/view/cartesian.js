// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UThree from "../../../util/three.js";
import { View } from "./view.js";
export class Cartesian extends View {
    static initClass() {
        this.traits = ["node", "object", "visible", "view", "view3", "vertex"];
    }
    make() {
        super.make();
        this.uniforms = { viewMatrix: this._attributes.make(this._types.mat4()) };
        this.viewMatrix = this.uniforms.viewMatrix.value;
        this.composer = UThree.transformComposer();
    }
    unmake() {
        super.unmake();
        delete this.viewMatrix;
        delete this.objectMatrix;
        delete this.uniforms;
    }
    change(changed, touched, init) {
        if (!touched["view"] && !touched["view3"] && !init) {
            return;
        }
        const p = this.props.position;
        const s = this.props.scale;
        const q = this.props.quaternion;
        const r = this.props.rotation;
        const g = this.props.range;
        const e = this.props.eulerOrder;
        const { x } = g[0];
        const y = g[1].x;
        const z = g[2].x;
        const dx = g[0].y - x || 1;
        const dy = g[1].y - y || 1;
        const dz = g[2].y - z || 1;
        // Forward transform
        this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1);
        const transformMatrix = this.composer(p, r, q, s, null, e);
        this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
        if (changed["view.range"]) {
            this.trigger({
                type: "view.range",
            });
        }
    }
    vertex(shader, pass) {
        if (pass === 1) {
            shader.pipe("cartesian.position", this.uniforms);
        }
        return super.vertex(shader, pass);
    }
}
Cartesian.initClass();
