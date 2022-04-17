// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../util/data.js";
import { DataBuffer } from "./databuffer.js";

/*
 * 2D + history array
 */
export class MatrixBuffer extends DataBuffer {
  constructor(renderer, shaders, options) {
    const width = options.width || 1;
    const height = options.height || 1;
    const history = options.history || 1;

    options.depth = history;

    super(renderer, shaders, options, false);

    this.width = width;
    this.height = height;
    this.history = history;
    this.samples = width * height;
    this.wrap = history > 1;

    this.build(options);
  }

  build(_options) {
    super.build();

    this.index = 0;
    this.pad = { x: 0, y: 0 };
    return (this.streamer = this.generate(this.data));
  }

  getFilled() {
    return this.filled;
  }

  setActive(i, j) {
    let ref;
    return (
      ([this.pad.x, this.pad.y] = Array.from(
        (ref = [Math.max(0, this.width - i), Math.max(0, this.height - j)])
      )),
      ref
    );
  }

  fill() {
    let j, k, repeat;
    const { callback } = this;
    if (typeof callback.reset === "function") {
      callback.reset();
    }

    const { emit, skip, count, done, reset } = this.streamer;
    reset();

    const n = this.width;
    const pad = this.pad.x;
    const limit = this.samples - this.pad.y * n;

    let i = (j = k = 0);
    if (pad) {
      while (!done() && k < limit) {
        k++;
        repeat = callback(emit, i, j);
        if (++i === n - pad) {
          skip(pad);
          k += pad;
          i = 0;
          j++;
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && k < limit) {
        k++;
        repeat = callback(emit, i, j);
        if (++i === n) {
          i = 0;
          j++;
        }
        if (repeat === false) {
          break;
        }
      }
    }

    return Math.floor(count() / this.items);
  }

  write(n) {
    if (n == null) {
      n = this.samples;
    }
    n *= this.items;
    const width = this.width * this.items;
    const height = Math.ceil(n / width);

    this.texture.write(this.data, 0, this.index * this.height, width, height);
    this.dataPointer.set(0.5, this.index * this.height + 0.5);
    this.index = (this.index + this.history - 1) % this.history;
    return (this.filled = Math.min(this.history, this.filled + 1));
  }

  through(callback, target) {
    let dst, j, src;
    const { consume, skip, done } = (src = this.streamer);
    const { emit } = (dst = target.streamer);

    let i = (j = 0);

    let pipe = () => consume((x, y, z, w) => callback(emit, x, y, z, w, i, j));
    pipe = UData.repeatCall(pipe, this.items);

    return () => {
      let k;
      src.reset();
      dst.reset();

      const n = this.width;
      const pad = this.pad.x;
      const limit = this.samples - this.pad.y * n;

      i = j = k = 0;
      if (pad) {
        while (!done() && k < limit) {
          k++;
          pipe();
          if (++i === n - pad) {
            skip(pad);
            i = 0;
            j++;
          }
        }
      } else {
        while (!done() && k < limit) {
          k++;
          pipe();
          if (++i === n) {
            i = 0;
            j++;
          }
        }
      }

      return src.count();
    };
  }
}
