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

import { FloatType, NearestFilter } from "three/src/constants.js";
import { Buffer } from "../data/buffer.js";
import { Voxel } from "../data/voxel.js";

export class Text extends Voxel {
  static initClass() {
    this.traits = [
      "node",
      "buffer",
      "active",
      "data",
      "texture",
      "voxel",
      "text",
      "font",
    ];
    this.defaults = {
      minFilter: "linear",
      magFilter: "linear",
    };
    this.finals = { channels: 1 };
  }

  init() {
    super.init();
    return (this.atlas = null);
  }

  textShader(shader) {
    return this.atlas.shader(shader);
  }

  textIsSDF() {
    return this.props.sdf > 0;
  }
  textHeight() {
    return this.props.detail;
  }

  make() {
    // Read sampling parameters
    let { minFilter, magFilter, type } = this.props;

    // Read font parameters
    const { font, style, variant, weight, detail, sdf } = this.props;

    // Prepare text atlas
    this.atlas = this._renderables.make("textAtlas", {
      font,
      size: detail,
      style,
      variant,
      weight,
      outline: sdf,
      minFilter,
      magFilter,
      type,
    });

    // Underlying data buffer needs no filtering
    this.minFilter = NearestFilter;
    this.magFilter = NearestFilter;
    this.type = FloatType;

    // Skip voxel::make(), as we need 4 channels internally in our buffer to store sprite x/y/w/h per string
    Buffer.prototype.make.call(this);

    // Read sampling parameters
    minFilter = this.minFilter != null ? this.minFilter : this.props.minFilter;
    magFilter = this.magFilter != null ? this.magFilter : this.props.magFilter;
    type = this.type != null ? this.type : this.props.type;

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

    // Create text voxel buffer
    this.buffer = this._renderables.make(this.storage, {
      width: space.width,
      height: space.height,
      depth: space.depth,
      channels: 4,
      items,
      minFilter,
      magFilter,
      type,
    });

    // Hook buffer emitter to map atlas text
    const { atlas } = this;
    const { emit } = this.buffer.streamer;
    return (this.buffer.streamer.emit = (text) => atlas.map(text, emit));
  }

  unmake() {
    super.unmake();
    if (this.atlas) {
      this.atlas.dispose();
      return (this.atlas = null);
    }
  }

  update() {
    this.atlas.begin();
    super.update();
    return this.atlas.end();
  }

  change(changed, touched, init) {
    if (touched["font"]) {
      return this.rebuild();
    }
    return super.change(changed, touched, init);
  }
}
Text.initClass();
