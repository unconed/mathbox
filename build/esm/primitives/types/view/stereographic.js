// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as UAxis from "../../../util/axis.js";
import * as UThree from "../../../util/three.js";
import { View } from "./view.js";
export class Stereographic extends View {
    static initClass() {
        this.traits = [
            "node",
            "object",
            "visible",
            "view",
            "view3",
            "stereographic",
            "vertex",
        ];
    }
    make() {
        super.make();
        this.uniforms = {
            stereoBend: this.node.attributes["stereographic.bend"],
            viewMatrix: this._attributes.make(this._types.mat4()),
        };
        this.viewMatrix = this.uniforms.viewMatrix.value;
        return (this.composer = UThree.transformComposer());
    }
    unmake() {
        super.unmake();
        delete this.viewMatrix;
        delete this.rotationMatrix;
        return delete this.uniforms;
    }
    change(changed, touched, init) {
        let bend;
        if (!touched["view"] &&
            !touched["view3"] &&
            !touched["stereographic"] &&
            !init) {
            return;
        }
        this.bend = bend = this.props.bend;
        const p = this.props.position;
        const s = this.props.scale;
        const q = this.props.quaternion;
        const r = this.props.rotation;
        const g = this.props.range;
        const e = this.props.eulerOrder;
        const { x } = g[0];
        const y = g[1].x;
        let z = g[2].x;
        const dx = g[0].y - x || 1;
        const dy = g[1].y - y || 1;
        let dz = g[2].y - z || 1;
        // Recenter viewport on projection point the more it's bent
        [z, dz] = Array.from(UAxis.recenterAxis(z, dz, bend, 1));
        this.uniforms.stereoBend.value = bend;
        // Forward transform
        this.viewMatrix.set(2 / dx, 0, 0, -(2 * x + dx) / dx, 0, 2 / dy, 0, -(2 * y + dy) / dy, 0, 0, 2 / dz, -(2 * z + dz) / dz, 0, 0, 0, 1 //,
        );
        const transformMatrix = this.composer(p, r, q, s, null, e);
        this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);
        if (changed["view.range"] || touched["stereographic"]) {
            return this.trigger({
                type: "view.range",
            });
        }
    }
    vertex(shader, pass) {
        if (pass === 1) {
            shader.pipe("stereographic.position", this.uniforms);
        }
        return super.vertex(shader, pass);
    }
}
Stereographic.initClass();
