// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl.js";
import { Parent } from "../base/parent.js";

export class Mask extends Parent {
  static initClass() {
    this.traits = ["node", "include", "mask", "bind"];
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

  mask(shader) {
    let left, s;
    if (this.bind.shader != null) {
      if (shader) {
        s = this._shaders.shader();
        s.pipe(UGLSL.identity("vec4"));
        s.fan();
        s.pipe(shader);
        s.next();
        s.pipe(this.bind.shader.shaderBind());
        s.end();
        s.pipe("float combine(float a, float b) { return min(a, b); }");
      } else {
        s = this._shaders.shader();
        s.pipe(this.bind.shader.shaderBind());
      }
    } else {
      s = shader;
    }

    return (left = __guard__(this._inherit("mask"), (x) => x.mask(s))) != null
      ? left
      : s;
  }
}
Mask.initClass();

function __guard__(value, transform) {
  return typeof value !== "undefined" && value !== null
    ? transform(value)
    : undefined;
}
