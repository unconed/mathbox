// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Voxel } from "../data/voxel";

export class HTML extends Voxel {
  static initClass() {
    this.traits = ["node", "buffer", "active", "data", "voxel", "html"];
    this.finals = { channels: 1 };
  }

  init() {
    super.init();
    return (this.storage = "pushBuffer");
  }

  make() {
    super.make();

    // Get our own size
    const { items, width, height, depth } = this.getDimensions();

    // Prepare DOM element factory
    this.dom = this._overlays.make("dom");
    return this.dom.hint(items * width * height * depth);
  }

  unmake() {
    super.unmake();
    if (this.dom != null) {
      this.dom.dispose();
      return (this.dom = null);
    }
  }

  update() {
    return super.update();
  }

  change(changed, touched, init) {
    if (touched["html"]) {
      return this.rebuild();
    }
    return super.change(changed, touched, init);
  }

  nodes() {
    return this.buffer.read();
  }

  callback(callback) {
    const { el } = this.dom;

    if (callback.length <= 6) {
      return (emit, i, j, k, l) => callback(emit, el, i, j, k, l);
    } else {
      return (emit, i, j, k, l) => {
        return callback(
          emit,
          el,
          i,
          j,
          k,
          l,
          this.bufferClock,
          this.bufferStep
        );
      };
    }
  }
}
HTML.initClass();
