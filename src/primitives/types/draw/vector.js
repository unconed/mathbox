// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UJS from "../../../util/js";
import { Primitive } from "../../primitive";

export class Vector extends Primitive {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "style",
      "line",
      "arrow",
      "geometry",
      "position",
      "bind",
      "shade",
    ];
  }

  constructor(node, context, helpers) {
    super(node, context, helpers);

    this.line = this.arrows = null;
  }

  resize() {
    if (this.bind.points == null) {
      return;
    }
    const dims = this.bind.points.getActiveDimensions();

    const samples = dims.items;
    const strips = dims.width;
    const ribbons = dims.height;
    const layers = dims.depth;

    this.line.geometry.clip(samples, strips, ribbons, layers);
    return Array.from(this.arrows).map((arrow) =>
      arrow.geometry.clip(samples, strips, ribbons, layers)
    );
  }

  make() {
    // Bind to attached data sources
    let color;
    this._helpers.bind.make([
      { to: "geometry.points", trait: "source" },
      { to: "geometry.colors", trait: "source" },
    ]);

    if (this.bind.points == null) {
      return;
    }

    // Build transform chain
    let position = this._shaders.shader();

    // Fetch position
    this.bind.points.sourceShader(position);

    // Transform position to view
    this._helpers.position.pipeline(position);

    // Prepare bound uniforms
    const styleUniforms = this._helpers.style.uniforms();
    const lineUniforms = this._helpers.line.uniforms();
    const arrowUniforms = this._helpers.arrow.uniforms();
    const unitUniforms = this._inherit("unit").getUnitUniforms();

    // Clip start/end for terminating arrow
    const { start, end } = this.props;

    // Stroke style
    const { stroke, join, proximity } = this.props;
    this.proximity = proximity;

    // Fetch geometry dimensions
    const dims = this.bind.points.getDimensions();
    const samples = dims.items;
    const strips = dims.width;
    const ribbons = dims.height;
    const layers = dims.depth;

    // Build color lookup
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }

    // Build transition mask lookup
    let mask = this._helpers.object.mask();

    // Build fragment material lookup
    let material = this._helpers.shade.pipeline() || false;

    // Swizzle vector to line
    const { swizzle, swizzle2 } = this._helpers.position;
    position = swizzle2(position, "yzwx", "yzwx");
    color = swizzle(color, "yzwx");
    mask = swizzle(mask, "yzwx");
    material = swizzle(material, "yzwx");

    // Make line renderable
    const uniforms = UJS.merge(
      arrowUniforms,
      lineUniforms,
      styleUniforms,
      unitUniforms
    );
    this.line = this._renderables.make("line", {
      uniforms,
      samples,
      ribbons,
      strips,
      layers,
      position,
      color,
      clip: start || end,
      stroke,
      join,
      proximity,
      mask,
      material,
    });

    // Make arrow renderables
    this.arrows = [];
    if (start) {
      this.arrows.push(
        this._renderables.make("arrow", {
          uniforms,
          flip: true,
          samples,
          ribbons,
          strips,
          layers,
          position,
          color,
          mask,
          material,
        })
      );
    }

    if (end) {
      this.arrows.push(
        this._renderables.make("arrow", {
          uniforms,
          samples,
          ribbons,
          strips,
          layers,
          position,
          color,
          mask,
          material,
        })
      );
    }

    this._helpers.visible.make();
    return this._helpers.object.make(this.arrows.concat([this.line]));
  }

  made() {
    return this.resize();
  }

  unmake() {
    this._helpers.bind.unmake();
    this._helpers.visible.unmake();
    this._helpers.object.unmake();

    return (this.line = this.arrows = null);
  }

  change(changed, _touched, _init) {
    if (
      changed["geometry.points"] ||
      changed["line.stroke"] ||
      changed["line.join"] ||
      changed["arrow.start"] ||
      changed["arrow.end"]
    ) {
      return this.rebuild();
    }

    if (changed["line.proximity"]) {
      if ((this.proximity != null) !== (this.props.proximity != null)) {
        return this.rebuild();
      }
    }
  }
}
Vector.initClass();
