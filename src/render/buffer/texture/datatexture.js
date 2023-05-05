// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as CONST from "three";
import * as UThree from "../../../util/three.js";

import { Texture, Vector2 } from "three";

/*
Manually allocated GL texture for data streaming.

Allows partial updates via subImage.
*/
export class DataTexture {
  constructor(renderer, width, height, channels, options) {
    this.renderer = renderer;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;

    const gl = this.renderer.getContext();
    this.gl = gl;
    const minFilter =
      (options != null ? options.minFilter : undefined) != null
        ? options != null
          ? options.minFilter
          : undefined
        : CONST.NearestFilter;
    const magFilter =
      (options != null ? options.magFilter : undefined) != null
        ? options != null
          ? options.magFilter
          : undefined
        : CONST.NearestFilter;
    const type =
      (options != null ? options.type : undefined) != null
        ? options != null
          ? options.type
          : undefined
        : CONST.FloatType;

    this.minFilter = UThree.paramToGL(gl, minFilter);
    this.magFilter = UThree.paramToGL(gl, magFilter);
    this.type = UThree.paramToGL(gl, type);
    this.ctor = UThree.paramToArrayStorage(type);

    this.build(options);
  }

  build(options) {
    const { gl } = this;
    const state = this.renderer.state;

    // Make GL texture
    this.texture = gl.createTexture();
    this.format = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][
      this.channels
    ];
    this.format3 = [
      null,
      CONST.LuminanceFormat,
      CONST.LuminanceAlphaFormat,
      undefined // CONST.RGBFormat was removed in r137 of ThreeJS
      CONST.RGBAFormat,
    ][this.channels];

    state.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);

    // Attach empty data
    this.data = new this.ctor(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      this.data
    );

    // Make wrapper texture object.
    this.textureObject = new Texture(
      new Image(),
      CONST.UVMapping,
      CONST.ClampToEdgeWrapping,
      CONST.ClampToEdgeWrapping,
      options != null ? options.minFilter : undefined,
      options != null ? options.magFilter : undefined
    );

    // Pre-init texture to trick WebGLRenderer
    this.textureProperties = this.renderer.properties.get(this.textureObject);
    this.textureProperties.__webglInit = true;
    this.textureProperties.__webglTexture = this.texture;

    this.textureObject.format = this.format3;
    this.textureObject.type = CONST.FloatType;
    this.textureObject.unpackAlignment = 1;
    this.textureObject.flipY = false;
    this.textureObject.generateMipmaps = false;

    // Create uniforms
    this.uniforms = {
      dataResolution: {
        type: "v2",
        value: new Vector2(1 / this.width, 1 / this.height),
      },
      dataTexture: {
        type: "t",
        value: this.textureObject,
      },
    };
  }

  write(data, x, y, w, h) {
    const { gl } = this;
    const state = this.renderer.state;

    // Write to rectangle
    state.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      x,
      y,
      w,
      h,
      this.format,
      this.type,
      data
    );
  }

  dispose() {
    this.gl.deleteTexture(this.texture);

    this.textureProperties.__webglInit = false;
    this.textureProperties.__webglTexture = null;
    this.textureProperties = null;
    return (this.textureObject = this.texture = null);
  }
}
