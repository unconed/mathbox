// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator.js";

export class Clamp extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "clamp"];
  }

  indexShader(shader) {
    shader.pipe(this.operator);
    return super.indexShader(shader);
  }

  sourceShader(shader) {
    shader.pipe(this.operator);
    return super.sourceShader(shader);
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Max index on all 4 dimensions
    const uniforms = { clampLimit: this._attributes.make(this._types.vec4()) };
    this.clampLimit = uniforms.clampLimit;

    // Build shader to clamp along all dimensions
    const transform = this._shaders.shader();
    transform.pipe("clamp.position", uniforms);
    return (this.operator = transform);
  }

  unmake() {
    return super.unmake();
  }

  resize() {
    if (this.bind.source != null) {
      const dims = this.bind.source.getActiveDimensions();
      this.clampLimit.value.set(
        dims.width - 1,
        dims.height - 1,
        dims.depth - 1,
        dims.items - 1
      );
    }

    return super.resize();
  }

  change(changed, touched, _init) {
    if (touched["operator"] || touched["clamp"]) {
      return this.rebuild();
    }
  }
}
Clamp.initClass();
