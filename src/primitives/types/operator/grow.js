// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator";

export class Grow extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "grow"];
  }

  sourceShader(shader) {
    return shader.pipe(this.operator);
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Uniforms
    const uniforms = {
      growScale: this.node.attributes["grow.scale"],
      growMask: this._attributes.make(this._types.vec4()),
      growAnchor: this._attributes.make(this._types.vec4()),
    };

    this.growMask = uniforms.growMask.value;
    this.growAnchor = uniforms.growAnchor.value;

    // Build shader to spread data on one dimension
    const transform = this._shaders.shader();
    transform.require(this.bind.source.sourceShader(this._shaders.shader()));
    transform.pipe("grow.position", uniforms);

    return (this.operator = transform);
  }

  unmake() {
    return super.unmake();
  }

  resize() {
    this.update();
    return super.resize();
  }

  update() {
    // Size to fit to include future history
    const dims = this.bind.source.getFutureDimensions();

    const order = ["width", "height", "depth", "items"];

    const m = (d, anchor) => ((d || 1) - 1) * (0.5 - anchor * 0.5);

    return (() => {
      const result = [];
      for (let i = 0; i < order.length; i++) {
        const key = order[i];
        const anchor = this.props[key];

        this.growMask.setComponent(i, +(anchor == null));
        result.push(
          this.growAnchor.setComponent(
            i,
            anchor != null ? m(dims[key], anchor) : 0
          )
        );
      }
      return result;
    })();
  }

  change(changed, touched, _init) {
    if (touched["operator"]) {
      return this.rebuild();
    }

    if (touched["grow"]) {
      return this.update();
    }
  }
}
Grow.initClass();
