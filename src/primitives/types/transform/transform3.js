// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UThree from "../../../util/three.js";
import { Transform } from "./transform.js";

export class Transform3 extends Transform {
  static initClass() {
    this.traits = ["node", "vertex", "transform3"];
  }

  make() {
    this.uniforms = {
      transformMatrix: this._attributes.make(this._types.mat4()),
    };

    return (this.composer = UThree.transformComposer());
  }

  unmake() {
    return delete this.uniforms;
  }

  change(changed, touched, init) {
    if (changed["transform3.pass"]) {
      return this.rebuild();
    }
    if (!touched["transform3"] && !init) {
      return;
    }

    const p = this.props.position;
    const q = this.props.quaternion;
    const r = this.props.rotation;
    const s = this.props.scale;
    const m = this.props.matrix;
    const e = this.props.eulerOrder;

    return (this.uniforms.transformMatrix.value = this.composer(
      p,
      r,
      q,
      s,
      m,
      e
    ));
  }

  vertex(shader, pass) {
    if (pass === this.props.pass) {
      shader.pipe("transform3.position", this.uniforms);
    }
    return super.vertex(shader, pass);
  }
}
Transform3.initClass();
