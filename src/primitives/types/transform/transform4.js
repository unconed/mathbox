// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Transform } from "./transform";

export class Transform4 extends Transform {
  static initClass() {
    this.traits = ["node", "vertex", "transform4"];
  }

  make() {
    this.uniforms = {
      transformMatrix: this._attributes.make(this._types.mat4()),
      transformOffset: this.node.attributes["transform4.position"],
    };

    return (this.transformMatrix = this.uniforms.transformMatrix.value);
  }

  unmake() {
    return delete this.uniforms;
  }

  change(changed, touched, init) {
    if (changed["transform4.pass"]) {
      return this.rebuild();
    }
    if (!touched["transform4"] && !init) {
      return;
    }

    const s = this.props.scale;
    const m = this.props.matrix;

    const t = this.transformMatrix;
    t.copy(m);
    return t.scale(s);
  }

  vertex(shader, pass) {
    if (pass === this.props.pass) {
      shader.pipe("transform4.position", this.uniforms);
    }
    return super.vertex(shader, pass);
  }
}
Transform4.initClass();
