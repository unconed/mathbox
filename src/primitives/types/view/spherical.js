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

import { Vector2 } from "three/src/math/Vector2.js";
import { View } from "./view.js";

export class Spherical extends View {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "view",
      "view3",
      "spherical",
      "vertex",
    ];
  }

  make() {
    super.make();

    this.uniforms = {
      sphericalBend: this.node.attributes["spherical.bend"],
      sphericalFocus: this._attributes.make(this._types.number()),
      sphericalAspectX: this._attributes.make(this._types.number()),
      sphericalAspectY: this._attributes.make(this._types.number()),
      sphericalScaleY: this._attributes.make(this._types.number()),
      viewMatrix: this._attributes.make(this._types.mat4()),
    };

    this.viewMatrix = this.uniforms.viewMatrix.value;
    this.composer = UThree.transformComposer();

    this.aspectX = 1;
    return (this.aspectY = 1);
  }

  unmake() {
    super.unmake();

    delete this.viewMatrix;
    delete this.objectMatrix;
    delete this.aspectX;
    delete this.aspectY;
    return delete this.uniforms;
  }

  change(changed, touched, init) {
    let aspectX, aspectY, bend, focus, scaleY;
    if (
      !touched["view"] &&
      !touched["view3"] &&
      !touched["spherical"] &&
      !init
    ) {
      return;
    }

    this.bend = bend = this.props.bend;
    this.focus = focus = bend > 0 ? 1 / bend - 1 : 0;

    const p = this.props.position;
    const s = this.props.scale;
    const q = this.props.quaternion;
    const r = this.props.rotation;
    const g = this.props.range;
    const e = this.props.eulerOrder;

    const { x } = g[0];
    let y = g[1].x;
    let z = g[2].x;
    const dx = g[0].y - x || 1;
    let dy = g[1].y - y || 1;
    let dz = g[2].y - z || 1;
    const sx = s.x;
    const sy = s.y;
    const sz = s.z;

    // Recenter viewport on origin the more it's bent
    [y, dy] = Array.from(UAxis.recenterAxis(y, dy, bend));
    [z, dz] = Array.from(UAxis.recenterAxis(z, dz, bend));

    // Watch for negative scales.
    const idx = dx > 0 ? 1 : -1;
    const idy = dy > 0 ? 1 : -1;

    // Adjust viewport range for spherical transform.
    // As the viewport goes spherical, the X/Y-ranges are interpolated to the Z-range,
    // creating a perfectly spherical viewport.
    const adz = Math.abs(dz);
    const fdx = dx + (adz * idx - dx) * bend;
    const fdy = dy + (adz * idy - dy) * bend;
    const sdx = fdx / sx;
    const sdy = fdy / sy;
    const sdz = dz / sz;
    this.aspectX = aspectX = Math.abs(sdx / sdz);
    this.aspectY = aspectY = Math.abs(sdy / sdz / aspectX);

    // Scale Y coordinates before transforming, but cap at aspectY/alpha to prevent from poking through the poles mid-transform.
    // See shaders/glsl/spherical.position.glsl
    const aspectZ = (((dy / dx) * sx) / sy) * 2; // Factor of 2 due to the fact that in the Y direction we only go 180º from pole to pole.
    this.scaleY = scaleY = Math.min(aspectY / bend, 1 + (aspectZ - 1) * bend);

    this.uniforms.sphericalBend.value = bend;
    this.uniforms.sphericalFocus.value = focus;
    this.uniforms.sphericalAspectX.value = aspectX;
    this.uniforms.sphericalAspectY.value = aspectY;
    this.uniforms.sphericalScaleY.value = scaleY;

    // Forward transform
    this.viewMatrix.set(
      2 / fdx,
      0,
      0,
      -(2 * x + dx) / dx,
      0,
      2 / fdy,
      0,
      -(2 * y + dy) / dy,
      0,
      0,
      2 / dz,
      -(2 * z + dz) / dz,
      0,
      0,
      0,
      1 //,
    );

    const transformMatrix = this.composer(p, r, q, s, null, e);
    this.viewMatrix.multiplyMatrices(transformMatrix, this.viewMatrix);

    if (changed["view.range"] || touched["spherical"]) {
      return this.trigger({
        type: "view.range",
      });
    }
  }

  vertex(shader, pass) {
    if (pass === 1) {
      shader.pipe("spherical.position", this.uniforms);
    }
    return super.vertex(shader, pass);
  }

  axis(dimension) {
    const range = this.props.range[dimension - 1];
    let min = range.x;
    let max = range.y;

    // Correct Z extents during polar warp.
    if (dimension === 3 && this.bend > 0) {
      max = Math.max(Math.abs(max), Math.abs(min));
      min = Math.max(-this.focus / this.aspectX + 0.001, min);
    }

    return new Vector2(min, max);
  }
}
Spherical.initClass();
