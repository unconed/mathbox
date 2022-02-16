// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Transform } from "./transform.js";

export class Vertex extends Transform {
  static initClass() {
    this.traits = ["node", "include", "vertex", "bind"];
  }

  make() {
    // Bind to attached shader
    return this._helpers.bind.make([
      { to: "include.shader", trait: "shader", optional: true },
    ]);
  }

  unmake() {
    return this._helpers.bind.unmake();
  }

  change(changed, touched, _init) {
    if (touched["include"]) {
      return this.rebuild();
    }
  }

  vertex(shader, pass) {
    if (this.bind.shader != null) {
      if (pass === this.props.pass) {
        shader.pipe(this.bind.shader.shaderBind());
      }
    }
    return super.vertex(shader, pass);
  }
}
Vertex.initClass();
