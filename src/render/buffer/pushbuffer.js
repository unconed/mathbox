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
import { Buffer } from "./buffer.js";

/*
 * Buffer for CPU-side use
 */
export class PushBuffer extends Buffer {
  constructor(renderer, shaders, options) {
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

    this.build(options);
  }

  build(_options) {
    this.data = [];
    this.data.length = this.samples;

    this.filled = 0;
    this.pad = { x: 0, y: 0, z: 0 };
    return (this.streamer = this.generate(this.data));
  }

  dispose() {
    this.data = null;
    return super.dispose();
  }

  getFilled() {
    return this.filled;
  }

  setActive(i, j, k) {
    let ref;
    return (
      ([this.pad.x, this.pad.y, this.pad.z] = Array.from(
        (ref = [this.width - i, this.height - j, this.depth - k])
      )),
      ref
    );
  }

  read() {
    return this.data;
  }

  copy(data) {
    const n = Math.min(data.length, this.samples);
    const d = this.data;
    return __range__(0, n, false).map((i) => (d[i] = data[i]));
  }

  fill() {
    let j, k, l, repeat;
    const { callback } = this;
    if (typeof callback.reset === "function") {
      callback.reset();
    }

    const { emit, skip, count, done, reset } = this.streamer;
    reset();

    const n = this.width;
    const m = this.height;
    const padX = this.pad.x;
    const padY = this.pad.y;
    const limit = this.samples - this.pad.z * n * m;

    let i = (j = k = l = 0);
    if (padX > 0 || padY > 0) {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n - padX) {
          skip(padX);
          i = 0;
          if (++j === m - padY) {
            skip(n * padY);
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && l < limit) {
        l++;
        repeat = callback(emit, i, j, k);
        if (++i === n) {
          i = 0;
          if (++j === m) {
            j = 0;
            k++;
          }
        }
        if (repeat === false) {
          break;
        }
      }
    }

    this.filled = 1;
    return count();
  }
}

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
