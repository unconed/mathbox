import { Operator } from "./operator.js";

export class Reverse extends Operator {
  static initClass() {
    this.traits = ["node", "bind", "operator", "source", "index", "reverse"];
  }

  getDimensions() {
    return this.bind.source.getDimensions();
  }
  getActiveDimensions() {
    return this.bind.source.getActiveDimensions();
  }
  getFutureDimensions() {
    return this.bind.source.getFutureDimensions();
  }
  getIndexDimensions() {
    return this.bind.source.getIndexDimensions();
  }

  sourceShader(shader) {
    shader.pipe("reverse.position", this.uniforms);
    return this.bind.source.sourceShader(shader);
  }

  _resolveScale(key, _dims) {
    const range = this.props[key];
    return range ? -1 : 1;
  }

  _resolveOffset(key, dims) {
    const range = this.props[key];
    const dim = dims[key];
    if (range) {
      return dim - 1;
    } else {
      return 0;
    }
  }

  make() {
    super.make(...arguments);
    if (this.bind.source == null) {
      return;
    }

    return (this.uniforms = {
      reverseScale: this._attributes.make(this._types.vec4()),
      reverseOffset: this._attributes.make(this._types.vec4()),
    });
  }

  unmake() {
    return super.unmake(...arguments);
  }

  resize() {
    if (this.bind.source == null) {
      return;
    }

    const dims = this.bind.source.getActiveDimensions();

    this.uniforms.reverseScale.value.set(
      this._resolveScale("width", dims),
      this._resolveScale("height", dims),
      this._resolveScale("depth", dims),
      this._resolveScale("items", dims)
    );

    this.uniforms.reverseOffset.value.set(
      this._resolveOffset("width", dims),
      this._resolveOffset("height", dims),
      this._resolveOffset("depth", dims),
      this._resolveOffset("items", dims)
    );

    return super.resize(...arguments);
  }

  change(_changed, touched, _init) {
    if (touched["operator"]) {
      return this.rebuild();
    }

    if (touched["reverse"]) {
      return this.resize();
    }
  }
}
Reverse.initClass();
