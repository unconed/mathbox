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

import { Vector2 } from "three";
import { View } from "./view.js";

export class Polar extends View {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "view",
      "view3",
      "polar",
      "vertex",
    ];
  }

  make() {
    super.make();

    const { types } = this._attributes;
    this.uniforms = {
      polarBend: this.node.attributes["polar.bend"],
      polarHelix: this.node.attributes["polar.helix"],
      polarFocus: this._attributes.make(types.number()),
      polarAspect: this._attributes.make(types.number()),
      viewMatrix: this._attributes.make(types.mat4()),
    };

    this.viewMatrix = this.uniforms.viewMatrix.value;
    this.composer = UThree.transformComposer();

    return (this.aspect = 1);
  }

  unmake() {
    super.unmake();

    delete this.viewMatrix;
    delete this.objectMatrix;
    delete this.aspect;
    return delete this.uniforms;
  }

  change(changed, touched, init) {
    let aspect, bend, focus;
    if (!touched["view"] && !touched["view3"] && !touched["polar"] && !init) {
      return;
    }

    this.helix = this.props.helix;
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
    const z = g[2].x;
    const dx = g[0].y - x || 1;
    let dy = g[1].y - y || 1;
    const dz = g[2].y - z || 1;
    const sx = s.x;
    const sy = s.y;

    // Watch for negative scales.
    const idx = dx > 0 ? 1 : -1;

    // Recenter viewport on origin the more it's bent
    [y, dy] = Array.from(UAxis.recenterAxis(y, dy, bend));

    // Adjust viewport range for polar transform.
    // As the viewport goes polar, the X-range is interpolated to the Y-range instead,
    // creating a square/circular viewport.
    const ady = Math.abs(dy);
    const fdx = dx + (ady * idx - dx) * bend;
    const sdx = fdx / sx;
    const sdy = dy / sy;
    this.aspect = aspect = Math.abs(sdx / sdy);

    this.uniforms.polarFocus.value = focus;
    this.uniforms.polarAspect.value = aspect;

    // Forward transform
    this.viewMatrix.set(
      2 / fdx,
      0,
      0,
      -(2 * x + dx) / dx,
      0,
      2 / dy,
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

    if (changed["view.range"] || touched["polar"]) {
      this.trigger({
        type: "view.range",
      });
    }
  }

  vertex(shader, pass) {
    if (pass === 1) {
      shader.pipe("polar.position", this.uniforms);
    }
    return super.vertex(shader, pass);
  }

  axis(dimension) {
    const range = this.props.range[dimension - 1];
    let min = range.x;
    let max = range.y;

    // Correct Y extents during polar warp.
    if (dimension === 2 && this.bend > 0) {
      max = Math.max(Math.abs(max), Math.abs(min));
      min = Math.max(-this.focus / this.aspect, min);
    }

    return new Vector2(min, max);
  }
}
Polar.initClass();
