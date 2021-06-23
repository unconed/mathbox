// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl";
import { Operator } from "./operator";

export class Swizzle extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "swizzle"];
  }

  sourceShader(shader) {
    shader = super.sourceShader(shader);
    if (this.swizzler) {
      shader.pipe(this.swizzler);
    }
    return shader;
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Swizzling order
    const { order } = this.props;
    if (order.join() !== "1234") {
      return (this.swizzler = UGLSL.swizzleVec4(order, 4));
    }
  }

  unmake() {
    super.unmake();
    return (this.swizzler = null);
  }

  change(changed, touched, _init) {
    if (touched["swizzle"] || touched["operator"]) {
      return this.rebuild();
    }
  }
}
Swizzle.initClass();
