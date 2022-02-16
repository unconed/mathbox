// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../util/data.js";
import * as UGLSL from "../../util/glsl.js";

import { Buffer } from "./buffer.js";
import { DataTexture } from "./texture/datatexture.js";
import { Vector2 } from "three/src/math/Vector2.js";

/*
 * Data buffer on the GPU
 * - Stores samples (1-n) x items (1-n) x channels (1-4)
 * - Provides generic sampler shader
 * - Provides generic copy/write handler
 * => specialized into Array/Matrix/VoxelBuffer
 */
export class DataBuffer extends Buffer {
  constructor(renderer, shaders, options, build) {
    if (build == null) {
      build = true;
    }
    const width = options.width || 1;
    const height = options.height || 1;
    const depth = options.depth || 1;
    const samples = width * height * depth;

    if (!options.samples) {
      options.samples = samples;
    }

    super(renderer, shaders, options);

    this.width = width;
    this.height = height;
    this.depth = depth;
    if (this.samples == null) {
      this.samples = samples;
    }

    if (build) {
      this.build(options);
    }
  }

  shader(shader, indices) {
    if (indices == null) {
      indices = 4;
    }
    if (this.items > 1 || this.depth > 1) {
      if (indices !== 4) {
        shader.pipe(UGLSL.extendVec(indices, 4));
      }
      shader.pipe("map.xyzw.texture", this.uniforms);
    } else {
      if (indices !== 2) {
        shader.pipe(UGLSL.truncateVec(indices, 2));
      }
    }

    const wrap = this.wrap ? ".wrap" : "";
    shader.pipe(`map.2d.data${wrap}`, this.uniforms);
    shader.pipe("sample.2d", this.uniforms);
    if (this.channels < 4) {
      shader.pipe(
        UGLSL.swizzleVec4(["0000", "x000", "xw00", "xyz0"][this.channels])
      );
    }
    return shader;
  }

  build(options) {
    this.data = new Float32Array(this.samples * this.channels * this.items);
    this.texture = new DataTexture(
      this.renderer,
      this.items * this.width,
      this.height * this.depth,
      this.channels,
      options
    );
    this.filled = 0;
    this.used = 0;

    this._adopt(this.texture.uniforms);
    this._adopt({
      dataPointer: { type: "v2", value: new Vector2() },
      textureItems: { type: "f", value: this.items },
      textureHeight: { type: "f", value: this.height },
    });

    this.dataPointer = this.uniforms.dataPointer.value;
    this.streamer = this.generate(this.data);
  }

  dispose() {
    this.data = null;
    this.texture.dispose();
    return super.dispose();
  }

  getFilled() {
    return this.filled;
  }
  setCallback(callback) {
    this.callback = callback;
    return (this.filled = 0);
  }

  copy(data) {
    const n = Math.min(data.length, this.samples * this.channels * this.items);
    const d = this.data;
    for (
      let i = 0, end = n, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      d[i] = data[i];
    }
    this.write(Math.ceil(n / this.channels / this.items));
  }

  write(n) {
    if (n == null) {
      n = this.samples;
    }
    let height = n / this.width;
    n *= this.items;
    const width = height < 1 ? n : this.items * this.width;
    height = Math.ceil(height);

    this.texture.write(this.data, 0, 0, width, height);
    this.dataPointer.set(0.5, 0.5);

    this.filled = 1;
    this.used = n;
  }

  through(callback, target) {
    let dst, src;
    const { consume, done } = (src = this.streamer);
    const { emit } = (dst = target.streamer);

    let i = 0;

    let pipe = () => consume((x, y, z, w) => callback(emit, x, y, z, w, i));
    pipe = UData.repeatCall(pipe, this.items);

    return () => {
      src.reset();
      dst.reset();
      const limit = this.used;
      i = 0;
      while (!done() && i < limit) {
        pipe();
        i++;
      }

      return src.count();
    };
  }
}
