// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export class Renderable {
  constructor(renderer, shaders) {
    this.renderer = renderer;
    this.shaders = shaders;
    this.gl = this.renderer.getContext();
    if (this.uniforms == null) {
      this.uniforms = {};
    }
  }

  dispose() {
    this.uniforms = null;
  }

  _adopt(uniforms) {
    for (const key in uniforms) {
      const value = uniforms[key];
      this.uniforms[key] = value;
    }
  }

  _set(uniforms) {
    for (const key in uniforms) {
      const value = uniforms[key];
      if (this.uniforms[key] != null) {
        this.uniforms[key].value = value;
      }
    }
  }
}
