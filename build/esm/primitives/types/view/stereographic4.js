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
import { View } from "./view.js";
export class Stereographic4 extends View {
    static initClass() {
        this.traits = [
            "node",
            "object",
            "visible",
            "view",
            "view4",
            "stereographic",
            "vertex",
        ];
    }
    make() {
        super.make();
        this.uniforms = {
            basisOffset: this._attributes.make(this._types.vec4()),
            basisScale: this._attributes.make(this._types.vec4()),
            stereoBend: this.node.attributes["stereographic.bend"],
        };
        this.basisScale = this.uniforms.basisScale.value;
        this.basisOffset = this.uniforms.basisOffset.value;
    }
    unmake() {
        super.unmake();
        delete this.basisScale;
        delete this.basisOffset;
        delete this.uniforms;
    }
    change(changed, touched, init) {
        let bend;
        if (!touched["view"] &&
            !touched["view4"] &&
            !touched["stereographic"] &&
            !init) {
            return;
        }
        this.bend = bend = this.props.bend;
        const p = this.props.position;
        const s = this.props.scale;
        const g = this.props.range;
        const { x } = g[0];
        const y = g[1].x;
        const z = g[2].x;
        let w = g[3].x;
        const dx = g[0].y - x || 1;
        const dy = g[1].y - y || 1;
        const dz = g[2].y - z || 1;
        let dw = g[3].y - w || 1;
        const mult = function (a, b) {
            a.x *= b.x;
            a.y *= b.y;
            a.z *= b.z;
            a.w *= b.w;
        };
        // Recenter viewport on projection point the more it's bent
        [w, dw] = Array.from(UAxis.recenterAxis(w, dw, bend, 1));
        // 4D axis adjustment
        this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
        this.basisOffset.set(-(2 * x + dx) / dx, -(2 * y + dy) / dy, -(2 * z + dz) / dz, -(2 * w + dw) / dw);
        // 4D scale
        mult(this.basisScale, s);
        mult(this.basisOffset, s);
        // 4D position
        this.basisOffset.add(p);
        if (changed["view.range"] || touched["stereographic"]) {
            this.trigger({
                type: "view.range",
            });
        }
    }
    vertex(shader, pass) {
        if (pass === 1) {
            shader.pipe("stereographic4.position", this.uniforms);
        }
        return super.vertex(shader, pass);
    }
}
Stereographic4.initClass();
