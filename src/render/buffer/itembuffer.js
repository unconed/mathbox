// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { DataBuffer } from "./databuffer.js";

/*
 * 4D array
 */
export class ItemBuffer extends DataBuffer {
  build(_options) {
    super.build();
    this.pad = { x: 0, y: 0, z: 0, w: 0 };
    return (this.streamer = this.generate(this.data));
  }

  getFilled() {
    return this.filled;
  }

  setActive(i, j, k, l) {
    let ref;
    return (
      ([this.pad.x, this.pad.y, this.pad.z, this.pad.w] = Array.from(
        (ref = [
          this.width - i,
          this.height - j,
          this.depth - k,
          this.items - l,
        ])
      )),
      ref
    );
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
    let m = this.height;
    const p = this.items;
    const padX = this.pad.x;
    const padY = this.pad.y;
    const padW = this.pad.w;
    const limit = (this.samples - this.pad.z * n * m) * p;

    let i = (j = k = l = m = 0);
    if (padX > 0 || padY > 0 || padW > 0) {
      while (!done() && m < limit) {
        m++;
        repeat = callback(emit, i, j, k, l);
        if (++l === p - padW) {
          skip(padW);
          l = 0;
          if (++i === n - padX) {
            skip(p * padX);
            i = 0;
            if (++j === m - padY) {
              skip(p * n * padY);
              j = 0;
              k++;
            }
          }
        }
        if (repeat === false) {
          break;
        }
      }
    } else {
      while (!done() && m < limit) {
        m++;
        repeat = callback(emit, i, j, k, l);
        if (++l === p) {
          l = 0;
          if (++i === n) {
            i = 0;
            if (++j === m) {
              j = 0;
              k++;
            }
          }
        }
        if (repeat === false) {
          break;
        }
      }
    }

    return Math.floor(count() / this.items);
  }
}
