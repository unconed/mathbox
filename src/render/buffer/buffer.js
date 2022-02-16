// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../util/data.js";
import { Renderable } from "../renderable.js";

/*
 * Base class for sample buffers
 */
export class Buffer extends Renderable {
  constructor(renderer, shaders, options) {
    super(renderer, shaders);

    if (this.items == null) {
      this.items = options.items || 1;
    }
    if (this.samples == null) {
      this.samples = options.samples || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    if (this.callback == null) {
      this.callback = options.callback || function () {};
    }
  }

  dispose() {
    return super.dispose();
  }

  update() {
    const n = this.fill();
    this.write(n);
    return n;
  }

  setActive(_i, _j, _k, _l) {}

  setCallback(callback) {
    this.callback = callback;
  }

  write() {}
  fill() {}
  generate(data) {
    return UData.getStreamer(data, this.samples, this.channels, this.items);
  }
}
