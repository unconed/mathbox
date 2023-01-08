// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
Virtual RenderTarget that cycles through multiple frames
Provides easy access to past rendered frames
@reads[] and @write contain WebGLRenderTargets whose internal pointers are rotated automatically
*/

import { NearestFilter, RGBAFormat, UnsignedByteType } from "three";
import { Vector2 } from "three";
import { WebGLRenderTarget } from "three";

export class RenderTarget {
  constructor(gl, width, height, frames, options) {
    this.gl = gl;
    if (options == null) {
      options = {};
    }
    if (options.minFilter == null) {
      options.minFilter = NearestFilter;
    }
    if (options.magFilter == null) {
      options.magFilter = NearestFilter;
    }
    if (options.format == null) {
      options.format = RGBAFormat;
    }
    if (options.type == null) {
      options.type = UnsignedByteType;
    }

    this.options = options;

    this.width = width || 1;
    this.height = height || 1;
    this.frames = frames || 1;
    this.buffers = this.frames + 1;

    this.build();
  }

  build() {
    let i;
    const make = () =>
      new WebGLRenderTarget(this.width, this.height, this.options);

    this.targets = (() => {
      let asc, end;
      const result = [];
      for (
        i = 0, end = this.buffers, asc = 0 <= end;
        asc ? i < end : i > end;
        asc ? i++ : i--
      ) {
        result.push(make());
      }
      return result;
    })();

    const acc = [];
    this.targets.forEach((target) => acc.push(target.texture));
    this.reads = acc;

    this.write = this.targets[this.buffers - 1];

    // Texture access uniforms
    this.uniforms = {
      dataResolution: {
        type: "v2",
        value: new Vector2(1 / this.width, 1 / this.height),
      },
      dataTexture: {
        type: "t",
        value: this.reads[0],
      },
      dataTextures: {
        type: "tv",
        value: this.reads,
      },
    };
  }

  cycle() {
    this.targets.unshift(this.targets.pop());
    this.write = this.targets[this.buffers - 1];
    this.reads.unshift(this.reads.pop());
    this.uniforms.dataTexture.value = this.reads[0];
  }

  warmup(callback) {
    return (() => {
      const result = [];
      for (
        let i = 0, end = this.buffers, asc = 0 <= end;
        asc ? i < end : i > end;
        asc ? i++ : i--
      ) {
        callback(this.write);
        result.push(this.cycle());
      }
      return result;
    })();
  }

  dispose() {
    for (const target of Array.from(this.targets)) {
      target.dispose();
    }
    return (this.targets = this.reads = this.write = null);
  }
}
