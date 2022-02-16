// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../../util/data.js";
import { Buffer } from "./buffer.js";

export class Matrix extends Buffer {
  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "source",
      "index",
      "texture",
      "matrix",
      "raw",
    ];
  }

  init() {
    this.buffer = this.spec = null;

    this.space = {
      width: 0,
      height: 0,
      history: 0,
    };

    this.used = {
      width: 0,
      height: 0,
    };

    this.storage = "matrixBuffer";
    this.passthrough = (emit, x, y) => emit(x, y, 0, 0);

    return super.init();
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
      depth: this.space.history,
    };
  }

  getActiveDimensions() {
    return {
      items: this.items,
      width: this.used.width,
      height: this.used.height,
      depth: this.buffer.getFilled(),
    };
  }

  getFutureDimensions() {
    return {
      items: this.items,
      width: this.used.width,
      height: this.used.height,
      depth: this.space.history,
    };
  }

  getRawDimensions() {
    return {
      items: this.items,
      width: this.space.width,
      height: this.space.height,
      depth: 1,
    };
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
    const { history } = this.props;
    const reserveX = this.props.bufferWidth;
    const reserveY = this.props.bufferHeight;
    const { channels } = this.props;
    const { items } = this.props;

    let dims = (this.spec = { channels, items, width, height });

    this.items = dims.items;
    this.channels = dims.channels;

    // Init to right size if data supplied
    const { data } = this.props;
    dims = UData.getDimensions(data, dims);

    const { space } = this;
    space.width = Math.max(reserveX, dims.width || 1);
    space.height = Math.max(reserveY, dims.height || 1);
    space.history = history;

    // Create matrix buffer
    return (this.buffer = this._renderables.make(this.storage, {
      width: space.width,
      height: space.height,
      history: space.history,
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
      changed["matrix.history"] ||
      changed["buffer.channels"] ||
      changed["buffer.items"] ||
      changed["matrix.bufferWidth"] ||
      changed["matrix.bufferHeight"]
    ) {
      return this.rebuild();
    }

    if (!this.buffer) {
      return;
    }

    if (changed["matrix.width"]) {
      const { width } = this.props;
      if (width > this.space.width) {
        return this.rebuild();
      }
    }

    if (changed["matrix.height"]) {
      const { height } = this.props;
      if (height > this.space.height) {
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
    if (callback.length <= 3) {
      return callback;
    } else {
      return (emit, i, j) => {
        return callback(emit, i, j, this.bufferClock, this.bufferStep);
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

    const filled = this.buffer.getFilled();

    this.syncBuffer((abort) => {
      if (data != null) {
        const dims = UData.getDimensions(data, this.spec);

        // Grow if needed
        if (dims.width > space.width || dims.height > space.height) {
          abort();
          return this.rebuild();
        }

        used.width = dims.width;
        used.height = dims.height;

        this.buffer.setActive(used.width, used.height);
        if (typeof this.buffer.callback.rebind === "function") {
          this.buffer.callback.rebind(data);
        }
        return this.buffer.update();
      } else {
        let _w;
        const width = this.spec.width || 1;
        const height = this.spec.height || 1;

        this.buffer.setActive(width, height);

        const length = this.buffer.update();

        used.width = _w = width;
        used.height = Math.ceil(length / _w);
        if (used.height === 1) {
          return (used.width = length);
        }
      }
    });

    if (
      used.width !== w ||
      used.height !== h ||
      filled !== this.buffer.getFilled()
    ) {
      return this.trigger({
        type: "source.resize",
      });
    }
  }
}
Matrix.initClass();
