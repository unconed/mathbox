// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator";

export class Repeat extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "repeat"];
  }

  indexShader(shader) {
    shader.pipe(this.operator);
    return super.indexShader(shader);
  }

  sourceShader(shader) {
    shader.pipe(this.operator);
    return super.sourceShader(shader);
  }

  getDimensions() {
    return this._resample(this.bind.source.getDimensions());
  }
  getActiveDimensions() {
    return this._resample(this.bind.source.getActiveDimensions());
  }
  getFutureDimensions() {
    return this._resample(this.bind.source.getFutureDimensions());
  }
  getIndexDimensions() {
    return this._resample(this.bind.source.getIndexDimensions());
  }

  _resample(dims) {
    const r = this.resample;
    return {
      items: r.items * dims.items,
      width: r.width * dims.width,
      height: r.height * dims.height,
      depth: r.depth * dims.depth,
    };
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Repeat multipliers
    this.resample = {};

    // Modulus on all 4 dimensions
    const uniforms = {
      repeatModulus: this._attributes.make(this._types.vec4()),
    };
    this.repeatModulus = uniforms.repeatModulus;

    // Build shader to repeat along all dimensions
    const transform = this._shaders.shader();
    transform.pipe("repeat.position", uniforms);
    return (this.operator = transform);
  }

  unmake() {
    return super.unmake();
  }

  resize() {
    if (this.bind.source != null) {
      const dims = this.bind.source.getActiveDimensions();
      this.repeatModulus.value.set(
        dims.width,
        dims.height,
        dims.depth,
        dims.items
      );
    }

    return super.resize();
  }

  change(changed, touched, init) {
    if (touched["operator"] || touched["repeat"]) {
      return this.rebuild();
    }

    if (init) {
      return ["items", "width", "height", "depth"].map(
        (key) => (this.resample[key] = this.props[key])
      );
    }
  }
}
Repeat.initClass();
