// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class RenderFactory {
  constructor(classes, renderer, shaders) {
    this.classes = classes;
    this.renderer = renderer;
    this.shaders = shaders;
  }

  getTypes() {
    return Object.keys(this.classes);
  }

  make(type, options) {
    return new this.classes[type](this.renderer, this.shaders, options);
  }
}
