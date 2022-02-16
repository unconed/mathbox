// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { DataTexture } from "./datatexture.js";

/*
Manually allocated GL texture for data streaming, locally backed.

Allows partial updates via subImage.
Contains local copy of its data to allow quick resizing without gl.copyTexImage2d
(which requires render-to-framebuffer)
*/
export class BackedTexture extends DataTexture {
  constructor(renderer, width, height, channels, options) {
    super(renderer, width, height, channels, options);
    this.data = new this.ctor(this.n);
  }

  resize(width, height) {
    const old = this.data;
    const oldWidth = this.width;
    const oldHeight = this.height;

    this.width = width;
    this.height = height;
    this.n = width * height * this.channels;
    this.data = new this.ctor(this.n);

    const { gl } = this;
    const state = this.renderer.state;
    state.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      width,
      height,
      0,
      this.format,
      this.type,
      this.data
    );

    this.uniforms.dataResolution.value.set(1 / width, 1 / height);

    return this.write(old, 0, 0, oldWidth, oldHeight);
  }

  write(src, x, y, w, h) {
    let j;
    const { width } = this;
    const dst = this.data;
    const { channels } = this;

    let i = 0;
    if (width === w && x === 0) {
      j = y * w * channels;
      const n = w * h * channels;
      while (i < n) {
        dst[j++] = src[i++];
      }
    } else {
      const stride = width * channels;
      const ww = w * channels;
      const xx = x * channels;
      let yy = y;
      const yh = y + h;
      while (yy < yh) {
        let k = 0;
        j = xx + yy * stride;
        while (k++ < ww) {
          dst[j++] = src[i++];
        }
        yy++;
      }
    }

    return super.write(src, x, y, w, h);
  }

  dispose() {
    this.data = null;
    return super.dispose();
  }
}
