// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../../util/data";
import { Buffer } from "./buffer";

export class Voxel extends Buffer {
  constructor(...args) {
    super(...args);
    this.update = this.update.bind(this);
  }

  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "source",
      "index",
      "texture",
      "voxel",
      "raw",
    ];
  }

  init() {
    super.init();

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

    this.storage = "voxelBuffer";
    return (this.passthrough = (emit, x, y, z) => emit(x, y, z, 0));
  }

  sourceShader(shader) {
    const dims = this.getDimensions();
    this.alignShader(dims, shader);
    return this.buffer.shader(shader);
  }

  getDimensions() {
    return {
      items: this.items,
      width: this.space.width,
      height: this.space.height,
      depth: this.space.depth,
    };
  }

  getActiveDimensions() {
    return {
      items: this.items,
      width: this.used.width,
      height: this.used.height,
      depth: this.used.depth * this.buffer.getFilled(),
    };
  }

  getRawDimensions() {
    return this.getDimensions();
  }

  make() {
    super.make();

    // Read sampling parameters
    const minFilter =
      this.minFilter != null ? this.minFilter : this.props.minFilter;
    const magFilter =
      this.magFilter != null ? this.magFilter : this.props.magFilter;
    const type = this.type != null ? this.type : this.props.type;

    // Read given dimensions
    const { width } = this.props;
    const { height } = this.props;
    const { depth } = this.props;
    const reserveX = this.props.bufferWidth;
    const reserveY = this.props.bufferHeight;
    const reserveZ = this.props.bufferDepth;
    const { channels } = this.props;
    const { items } = this.props;

    let dims = (this.spec = { channels, items, width, height, depth });

    this.items = dims.items;
    this.channels = dims.channels;

    // Init to right size if data supplied
    const { data } = this.props;
    dims = UData.getDimensions(data, dims);

    const { space } = this;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.depth = Math.max(reserveZ, dims.depth || 1);

    // Create voxel buffer
    return (this.buffer = this._renderables.make(this.storage, {
      width: space.width,
      height: space.height,
      depth: space.depth,
      channels,
      items,
      minFilter,
      magFilter,
      type,
    }));
  }

  unmake() {
    super.unmake();
    if (this.buffer) {
      this.buffer.dispose();
      return (this.buffer = this.spec = null);
    }
  }

  change(changed, touched, init) {
    if (
      touched["texture"] ||
      changed["buffer.channels"] ||
      changed["buffer.items"] ||
      changed["voxel.bufferWidth"] ||
      changed["voxel.bufferHeight"] ||
      changed["voxel.bufferDepth"]
    ) {
      return this.rebuild();
    }

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
      changed["data.expr"] ||
      init
    ) {
      return this.buffer.setCallback(this.emitter());
    }
  }

  callback(callback) {
    if (callback.length <= 4) {
      return callback;
    } else {
      return (emit, i, j, k) => {
        return callback(emit, i, j, k, this.bufferClock, this.bufferStep);
      };
    }
  }

  update() {
    if (!this.buffer) {
      return;
    }

    const { data } = this.props;
    const { space, used } = this;
    const w = used.width;
    const h = used.height;
    const d = used.depth;

    const filled = this.buffer.getFilled();

    this.syncBuffer((abort) => {
      if (data != null) {
        const dims = UData.getDimensions(data, this.spec);

        // Grow dimensions if needed
        if (
          dims.width > space.width ||
          dims.height > space.height ||
          dims.depth > space.depth
        ) {
          abort();
          return this.rebuild();
        }

        used.width = dims.width;
        used.height = dims.height;
        used.depth = dims.depth;

        this.buffer.setActive(used.width, used.height, used.depth);
        if (typeof this.buffer.callback.rebind === "function") {
          this.buffer.callback.rebind(data);
        }
        return this.buffer.update();
      } else {
        let _h, _w;
        const width = this.spec.width || 1;
        const height = this.spec.height || 1;
        const depth = this.spec.depth || 1;

        this.buffer.setActive(width, height, depth);

        const length = this.buffer.update();

        used.width = _w = width;
        used.height = _h = height;
        used.depth = Math.ceil(length / _w / _h);

        if (used.depth === 1) {
          used.height = Math.ceil(length / _w);
          if (used.height === 1) {
            return (used.width = length);
          }
        }
      }
    });

    if (
      used.width !== w ||
      used.height !== h ||
      used.depth !== d ||
      filled !== this.buffer.getFilled()
    ) {
      return this.trigger({
        type: "source.resize",
      });
    }
  }
}
Voxel.initClass();
