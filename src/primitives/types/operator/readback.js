// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Primitive } from "../../primitive";

export class Readback extends Primitive {
  static initClass() {
    this.traits = ["node", "bind", "operator", "readback", "entity", "active"];
    this.finals = { channels: 4 };
  }

  init() {
    this.emitter = this.root = null;
    return (this.active = {});
  }

  make() {
    super.make();

    this._compute("readback.data", () =>
      this.readback != null ? this.readback.data : undefined
    );
    this._compute("readback.items", () =>
      this.readback != null ? this.readback.items : undefined
    );
    this._compute("readback.width", () =>
      this.readback != null ? this.readback.width : undefined
    );
    this._compute("readback.height", () =>
      this.readback != null ? this.readback.height : undefined
    );
    this._compute("readback.depth", () =>
      this.readback != null ? this.readback.depth : undefined
    );

    // Bind to attached objects
    this._helpers.bind.make([{ to: "operator.source", trait: "source" }]);

    if (this.bind.source == null) {
      return;
    }

    // Sampler props
    const { type, channels, expr } = this.props;

    // Listen for updates
    this.root = this._inherit("root");
    this._listen("root", "root.update", this.update);

    // Fetch source dimensions
    const { items, width, height, depth } = this.bind.source.getDimensions();

    // Build shader to sample source data
    const sampler = this.bind.source.sourceShader(this._shaders.shader());

    // Prepare readback/memo RTT
    this.readback = this._renderables.make("readback", {
      map: sampler,
      items,
      width,
      height,
      depth,
      channels,
      type,
    });

    // Prepare readback consumer
    if (expr != null) {
      this.readback.setCallback(expr);
    }

    return this._helpers.active.make();
  }

  unmake() {
    if (this.readback != null) {
      this.readback.dispose();
      this.readback = null;

      this.root = null;
      this.emitter = null;
      this.active = {};
    }

    this._helpers.active.unmake();
    return this._helpers.bind.unmake();
  }

  update() {
    if (this.readback == null) {
      return;
    }
    if (this.isActive) {
      this.readback.update(
        this.root != null ? this.root.getCamera() : undefined
      );
      this.readback.post();
      if (this.props.expr != null) {
        return this.readback.iterate();
      }
    }
  }

  resize() {
    let sI, sJ;
    if (this.readback == null) {
      return;
    }

    // Fetch geometry/html dimensions
    const { items, width, height, depth } =
      this.bind.source.getActiveDimensions();

    // Limit readback to active area
    this.readback.setActive(items, width, height, depth);

    // Recalculate iteration strides
    this.strideI = sI = items;
    this.strideJ = sJ = sI * width;
    return (this.strideK = sJ * height);
  }

  change(changed, _touched, _init) {
    if (changed["readback.type"]) {
      return this.rebuild();
    }

    if (changed["readback.expr"] && this.readback) {
      return this.readback.setCallback(this.props.expr);
    }
  }
}
Readback.initClass();
