// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { View } from "./view.js";

export class Cartesian4 extends View {
  static initClass() {
    this.traits = ["node", "object", "visible", "view", "view4", "vertex"];
  }

  make() {
    super.make();

    this.uniforms = {
      basisOffset: this._attributes.make(this._types.vec4()),
      basisScale: this._attributes.make(this._types.vec4()),
    };

    this.basisScale = this.uniforms.basisScale.value;
    return (this.basisOffset = this.uniforms.basisOffset.value);
  }

  unmake() {
    super.unmake();
    delete this.basisScale;
    delete this.basisOffset;
    return delete this.uniforms;
  }

  change(changed, touched, init) {
    if (!touched["view"] && !touched["view4"] && !init) {
      return;
    }

    const p = this.props.position;
    const s = this.props.scale;
    const g = this.props.range;

    const { x } = g[0];
    const y = g[1].x;
    const z = g[2].x;
    const w = g[3].x;
    const dx = g[0].y - x || 1;
    const dy = g[1].y - y || 1;
    const dz = g[2].y - z || 1;
    const dw = g[3].y - w || 1;

    const mult = function (a, b) {
      a.x *= b.x;
      a.y *= b.y;
      a.z *= b.z;
      return (a.w *= b.w);
    };

    // 4D axis adjustment
    this.basisScale.set(2 / dx, 2 / dy, 2 / dz, 2 / dw);
    this.basisOffset.set(
      -(2 * x + dx) / dx,
      -(2 * y + dy) / dy,
      -(2 * z + dz) / dz,
      -(2 * w + dw) / dw
    );

    // 4D scale
    mult(this.basisScale, s);
    mult(this.basisOffset, s);

    // 4D position
    this.basisOffset.add(p);

    if (changed["view.range"]) {
      return this.trigger({
        type: "view.range",
      });
    }
  }

  vertex(shader, pass) {
    if (pass === 1) {
      shader.pipe("cartesian4.position", this.uniforms);
    }
    return super.vertex(shader, pass);
  }
}
Cartesian4.initClass();
