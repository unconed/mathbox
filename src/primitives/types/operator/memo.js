// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Operator } from "./operator";

export class Memo extends Operator {
  static initClass() {
    this.traits = [
      "node",
      "bind",
      "active",
      "operator",
      "source",
      "index",
      "texture",
      "memo",
    ];
  }

  sourceShader(shader) {
    return this.memo.shaderAbsolute(shader, 1);
  }

  make() {
    super.make();
    if (this.bind.source == null) {
      return;
    }

    // Listen for updates
    this._helpers.active.make();
    this._listen("root", "root.update", () => {
      if (this.isActive) {
        return this.update();
      }
    });

    // Read sampling parameters
    const { minFilter, magFilter, type } = this.props;

    // Fetch geometry dimensions
    const dims = this.bind.source.getDimensions();
    const { items, width, height, depth } = dims;

    // Prepare memoization RTT
    this.memo = this._renderables.make("memo", {
      items,
      width,
      height,
      depth,
      minFilter,
      magFilter,
      type,
    });

    // Build shader to remap data (do it after RTT creation to allow feedback)
    const operator = this._shaders.shader();
    this.bind.source.sourceShader(operator);

    // Make screen renderable inside RTT scene
    this.compose = this._renderables.make("memoScreen", {
      map: operator,
      items,
      width,
      height,
      depth,
    });
    this.memo.adopt(this.compose);

    this.objects = [this.compose];
    return (this.renders = this.compose.renders);
  }

  unmake() {
    this._helpers.active.unmake();

    if (this.bind.source != null) {
      this.memo.unadopt(this.compose);
      this.memo.dispose();
      this.memo = this.compose = null;

      super.unmake();
    }
  }

  update() {
    return this.memo != null ? this.memo.render() : undefined;
  }

  resize() {
    if (this.bind.source == null) {
      return;
    }

    // Fetch geometry dimensions
    const dims = this.bind.source.getActiveDimensions();
    const { width, height, depth } = dims;

    // Cover only part of the RTT viewport
    this.compose.cover(width, height, depth);

    return super.resize();
  }

  change(changed, touched, _init) {
    if (touched["texture"] || touched["operator"]) {
      return this.rebuild();
    }
  }
}
Memo.initClass();
