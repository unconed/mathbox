// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../util/data";
import { DataBuffer } from "./databuffer";

/*
 * 1D + history array
 */
export class ArrayBuffer_ extends DataBuffer {
  constructor(renderer, shaders, options) {
    const width = options.width || 1;
    const history = options.history || 1;

    options.width = width;
    options.height = history;
    options.depth = 1;

    super(renderer, shaders, options, false);

    this.width = width;
    this.history = history;
    this.samples = width;
    this.wrap = history > 1;

    this.build(options);
  }

  build(_options) {
    super.build();

    this.index = 0;
    this.pad = 0;
    return (this.streamer = this.generate(this.data));
  }

  setActive(i) {
    return (this.pad = Math.max(0, this.width - i));
  }

  fill() {
    const { callback } = this;
    if (typeof callback.reset === "function") {
      callback.reset();
    }

    const { emit, count, done, reset } = this.streamer;
    reset();

    const limit = this.samples - this.pad;

    let i = 0;
    while (!done() && i < limit && callback(emit, i++) !== false) {
      true;
    }

    return Math.floor(count() / this.items);
  }

  write(n) {
    if (n == null) {
      n = this.samples;
    }
    n *= this.items;
    this.texture.write(this.data, 0, this.index, n, 1);
    this.dataPointer.set(0.5, this.index + 0.5);
    this.index = (this.index + this.history - 1) % this.history;
    return (this.filled = Math.min(this.history, this.filled + 1));
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
      const limit = this.samples - this.pad;
      i = 0;
      while (!done() && i < limit) {
        pipe();
        i++;
      }

      return src.count();
    };
  }
}
