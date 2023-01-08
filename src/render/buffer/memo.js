// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { RGBAFormat } from "three";
import { RenderToTexture } from "./rendertotexture.js";

/*
 * Wrapped RTT for memoizing 4D arrays back to a 2D texture
 */
export class Memo extends RenderToTexture {
  constructor(renderer, shaders, options) {
    let _height, _width;
    const items = options.items || 1;
    const channels = options.channels || 4;
    const width = options.width || 1;
    const height = options.height || 1;
    const depth = options.depth || 1;

    //options.format = [null, THREE.LuminanceFormat, THREE.LuminanceAlphaFormat, THREE.RGBFormat, THREE.RGBAFormat][@channels]
    options.format = RGBAFormat;
    options.width = _width = items * width;
    options.height = _height = height * depth;
    options.frames = 1;

    delete options.items;
    delete options.depth;
    delete options.channels;

    super(renderer, shaders, options);

    if (this.items == null) {
      this.items = items;
    }
    if (this.channels == null) {
      this.channels = channels;
    }
    if (this.width == null) {
      this.width = width;
    }
    this._width = _width;
    if (this.height == null) {
      this.height = height;
    }
    this._height = _height;
    if (this.depth == null) {
      this.depth = depth;
    }

    this._adopt({
      textureItems: { type: "f", value: this.items },
      textureHeight: { type: "f", value: this.height },
    });
  }

  shaderAbsolute(shader) {
    if (shader == null) {
      shader = this.shaders.shader();
    }
    shader.pipe("map.xyzw.texture", this.uniforms);
    return super.shaderAbsolute(shader, 1, 2);
  }
}
//shader.pipe Util.GLSL.swizzleVec4 ['0000', 'x000', 'xw00', 'xyz0'][@channels] if @channels < 4
