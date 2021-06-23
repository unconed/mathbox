// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../../util/data";
import { Data } from "./data";

export class Resolve extends Data {
  static initClass() {
    this.traits = ["node", "data", "active", "source", "index", "voxel"];
  }

  init() {
    this.buffer = this.spec = null;

    this.space = {
      width: 0,
      height: 0,
      depth: 0,
    };

    this.used = {
      width: 0,
      height: 0,
      depth: 0,
    };

    return super.init();
  }

  sourceShader(shader) {
    return this.buffer.shader(shader);
  }

  getDimensions() {
    const { space } = this;

    return {
      items: this.items,
      width: space.width,
      height: space.height,
      depth: space.depth,
    };
  }

  getActiveDimensions() {
    const { used } = this;

    return {
      items: this.items,
      width: used.width,
      height: used.height,
      depth: used.depth * this.buffer.getFilled(),
    };
  }

  make() {
    super.make();

    // Read given dimensions
    const { width } = this.props;
    const { height } = this.props;
    const { depth } = this.props;
    const reserveX = this.props.bufferWidth;
    const reserveY = this.props.bufferHeight;
    const reserveZ = this.props.bufferDepth;

    let dims = (this.spec = { channels: 1, items: 1, width, height, depth });

    // Init to right size if data supplied
    const { data } = this.props;
    dims = UData.getDimensions(data, dims);

    const { space } = this;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.depth = Math.max(reserveZ, dims.depth || 1);

    if (this.spec.width == null) {
      this.spec.width = 1;
    }
    if (this.spec.height == null) {
      this.spec.height = 1;
    }
    if (this.spec.depth == null) {
      this.spec.depth = 1;
    }

    // Create voxel buffer to hold item state
    // (enter, exit)
    return (this.buffer = this._renderables.make("voxelBuffer", {
      width: space.width,
      height: space.height,
      depth: space.depth,
      channels: 2,
      items: 1,
    }));
  }

  // Decorate emit callback for a bound source
  callback() {}

  //
  emitter() {
    return super.emitter(1, 1);
  }

  change(changed, touched, init) {
    super.change();
    if (!this.buffer) {
      return;
    }

    if (changed["voxel.width"]) {
      const { width } = this.props;
      if (width > this.space.width) {
        return this.rebuild();
      }
    }

    if (changed["voxel.height"]) {
      const { height } = this.props;
      if (height > this.space.height) {
        return this.rebuild();
      }
    }

    if (changed["voxel.depth"]) {
      const { depth } = this.props;
      if (depth > this.space.depth) {
        return this.rebuild();
      }
    }

    if (
      changed["data.map"] ||
      changed["data.data"] ||
      changed["data.resolve"] ||
      init
    ) {
      return this.buffer.setCallback(this.emitter());
    }
  }

  update() {
    let length;
    if (!this.buffer) {
      return;
    }

    const filled = this.buffer.getFilled();
    if (!!filled && !this.props.live) {
      return;
    }

    const { data } = this.props;

    const { space } = this;
    const { used } = this;

    const l = used.length;

    if (data != null) {
      const dims = UData.getDimensions(data, this.spec);

      // Grow length if needed
      if (dims.width > space.length) {
        this.rebuild();
      }

      used.length = dims.width;

      this.buffer.setActive(used.length);
      this.buffer.callback.rebind(data);
      this.buffer.update();
    } else {
      this.buffer.setActive(this.spec.width);

      length = this.buffer.update();
      used.length = length;
    }

    this.filled = true;

    if (used.length !== l || filled !== this.buffer.getFilled()) {
      return this.trigger({
        type: "source.resize",
      });
    }
  }
}
Resolve.initClass();
