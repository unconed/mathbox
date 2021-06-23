// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator";

export class Spread extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "spread"];
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
      spreadMatrix: this._attributes.make(this._types.mat4()),
      spreadOffset: this._attributes.make(this._types.vec4()),
    };

    this.spreadMatrix = uniforms.spreadMatrix;
    this.spreadOffset = uniforms.spreadOffset;

    // Build shader to spread data on one dimension
    const transform = this._shaders.shader();
    transform.require(this.bind.source.sourceShader(this._shaders.shader()));
    transform.pipe("spread.position", uniforms);

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
    let key, i, k, v;
    const dims = this.bind.source.getFutureDimensions();

    const matrix = this.spreadMatrix.value;
    const els = matrix.elements;

    const order = ["width", "height", "depth", "items"];
    const align = ["alignWidth", "alignHeight", "alignDepth", "alignItems"];

    const { unit } = this.props;
    const unitEnum = this.node.attributes["spread.unit"].enum;

    const map = (() => {
      switch (unit) {
        case unitEnum.relative:
          return (key, i, k, v) =>
            (els[i * 4 + k] = v / Math.max(1, dims[key] - 1));
        case unitEnum.absolute:
          return (key, i, k, v) => (els[i * 4 + k] = v);
      }
    })();

    return (() => {
      const result = [];
      for (i = 0; i < order.length; i++) {
        var offset;
        key = order[i];
        var spread = this.props[key];
        const anchor = this.props[align[i]];

        if (spread != null) {
          const d = dims[key] != null ? dims[key] : 1;
          offset = -(d - 1) * (0.5 - anchor * 0.5);
        } else {
          offset = 0;
        }
        this.spreadOffset.value.setComponent(i, offset);

        result.push(
          (() => {
            const result1 = [];
            for (k = 0; k <= 3; k++) {
              var left;
              v =
                (left = spread != null ? spread.getComponent(k) : undefined) !=
                null
                  ? left
                  : 0;
              result1.push((els[i * 4 + k] = map(key, i, k, v)));
            }
            return result1;
          })()
        );
      }
      return result;
    })();
  }

  change(changed, touched, _init) {
    if (touched["operator"]) {
      return this.rebuild();
    }

    if (touched["spread"]) {
      return this.update();
    }
  }
}
Spread.initClass();
