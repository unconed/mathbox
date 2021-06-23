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
import * as THREE from "three";

export class RenderTarget {
  constructor(gl, width, height, frames, options) {
    this.gl = gl;
    if (options == null) {
      options = {};
    }
    if (options.minFilter == null) {
      options.minFilter = THREE.NearestFilter;
    }
    if (options.magFilter == null) {
      options.magFilter = THREE.NearestFilter;
    }
    if (options.format == null) {
      options.format = THREE.RGBAFormat;
    }
    if (options.type == null) {
      options.type = THREE.UnsignedByteType;
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
      new THREE.WebGLRenderTarget(this.width, this.height, this.options);

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
    this.reads = (() => {
      let asc1, end1;
      const result1 = [];
      for (
        i = 0, end1 = this.buffers, asc1 = 0 <= end1;
        asc1 ? i < end1 : i > end1;
        asc1 ? i++ : i--
      ) {
        result1.push(make());
      }
      return result1;
    })();
    this.write = make();

    this.index = 0;

    // Texture access uniforms
    return (this.uniforms = {
      dataResolution: {
        type: "v2",
        value: new THREE.Vector2(1 / this.width, 1 / this.height),
      },
      dataTexture: {
        type: "t",
        value: this.reads[0],
      },
      dataTextures: {
        type: "tv",
        value: this.reads,
      },
    });
  }

  cycle() {
    const keys = [
      "__webglTexture",
      "__webglFramebuffer",
      "__webglRenderbuffer",
    ];
    const { buffers } = this;

    const copy = function (a, b) {
      for (let key of Array.from(keys)) {
        b[key] = a[key];
      }
      return null;
    };
    const add = (i, j) => (i + j + buffers * 2) % buffers;

    copy(this.write, this.targets[this.index]);
    for (let i = 0; i < this.reads.length; i++) {
      const read = this.reads[i];
      copy(this.targets[add(this.index, -i)], read);
    }
    this.index = add(this.index, 1);
    return copy(this.targets[this.index], this.write);
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
    for (let target of Array.from(this.targets)) {
      target.dispose();
    }
    return (this.targets = this.reads = this.write = null);
  }
}
