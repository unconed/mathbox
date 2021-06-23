// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import * as UThree from "../../../util/three";

/*
Manually allocated GL texture for data streaming.

Allows partial updates via subImage.
*/
export class DataTexture {
  constructor(gl1, width, height, channels, options) {
    this.gl = gl1;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;

    const { gl } = this;
    const minFilter =
      (options != null ? options.minFilter : undefined) != null
        ? options != null
          ? options.minFilter
          : undefined
        : THREE.NearestFilter;
    const magFilter =
      (options != null ? options.magFilter : undefined) != null
        ? options != null
          ? options.magFilter
          : undefined
        : THREE.NearestFilter;
    const type =
      (options != null ? options.type : undefined) != null
        ? options != null
          ? options.type
          : undefined
        : THREE.FloatType;

    this.minFilter = UThree.paramToGL(gl, minFilter);
    this.magFilter = UThree.paramToGL(gl, magFilter);
    this.type = UThree.paramToGL(gl, type);
    this.ctor = UThree.paramToArrayStorage(type);

    this.build(options);
  }

  build(options) {
    const { gl } = this;

    // Make GL texture
    this.texture = gl.createTexture();
    this.format = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][
      this.channels
    ];
    this.format3 = [
      null,
      THREE.LuminanceFormat,
      THREE.LuminanceAlphaFormat,
      THREE.RGBFormat,
      THREE.RGBAFormat,
    ][this.channels];

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
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
    this.textureObject = new THREE.Texture(
      new Image(),
      THREE.UVMapping,
      THREE.ClampToEdgeWrapping,
      THREE.ClampToEdgeWrapping,
      options != null ? options.minFilter : undefined,
      options != null ? options.magFilter : undefined
    );

    // Pre-init texture to trick WebGLRenderer
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = this.texture;
    this.textureObject.format = this.format3;
    this.textureObject.type = THREE.FloatType;
    this.textureObject.unpackAlignment = 1;
    this.textureObject.flipY = false;
    this.textureObject.generateMipmaps = false;

    // Create uniforms
    return (this.uniforms = {
      dataResolution: {
        type: "v2",
        value: new THREE.Vector2(1 / this.width, 1 / this.height),
      },
      dataTexture: {
        type: "t",
        value: this.textureObject,
      },
    });
  }

  write(data, x, y, w, h) {
    const { gl } = this;

    // Write to rectangle
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
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

    this.textureObject.__webglInit = false;
    this.textureObject.__webglTexture = null;
    return (this.textureObject = this.texture = null);
  }
}
