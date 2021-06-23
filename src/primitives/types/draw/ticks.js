// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UJS from "../../../util/js";
import { Primitive } from "../../primitive";

export class Ticks extends Primitive {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "style",
      "line",
      "ticks",
      "geometry",
      "position",
      "bind",
      "shade",
    ];
  }

  init() {
    return (this.tickStrip = this.line = null);
  }

  resize() {
    if (this.bind.points == null) {
      return;
    }
    const dims = this.bind.points.getActiveDimensions();

    const active = +(dims.items > 0);
    const strips = dims.width * active;
    const ribbons = dims.height * active;
    const layers = dims.depth * active;

    this.line.geometry.clip(2, strips, ribbons, layers);
    return this.tickStrip.set(0, strips - 1);
  }

  make() {
    // Bind to attached data sources
    let color, position;
    this._helpers.bind.make([
      { to: "geometry.points", trait: "source" },
      { to: "geometry.colors", trait: "source" },
    ]);

    if (this.bind.points == null) {
      return;
    }

    // Prepare bound uniforms
    const styleUniforms = this._helpers.style.uniforms();
    const lineUniforms = this._helpers.line.uniforms();
    const unitUniforms = this._inherit("unit").getUnitUniforms();
    const uniforms = UJS.merge(lineUniforms, styleUniforms, unitUniforms);

    // Prepare position shader
    const positionUniforms = {
      tickEpsilon: this.node.attributes["ticks.epsilon"],
      tickSize: this.node.attributes["ticks.size"],
      tickNormal: this.node.attributes["ticks.normal"],
      tickStrip: this._attributes.make(this._types.vec2(0, 0)),
      worldUnit: uniforms.worldUnit,
      focusDepth: uniforms.focusDepth,
    };

    this.tickStrip = positionUniforms.tickStrip.value;

    // Build transform chain
    const p = (position = this._shaders.shader());

    // Require buffer sampler as callback
    p.require(this.bind.points.sourceShader(this._shaders.shader()));

    // Require view transform as callback
    p.require(this._helpers.position.pipeline(this._shaders.shader()));

    // Link to tick shader
    p.pipe("ticks.position", positionUniforms);

    // Stroke style
    const { stroke, join } = this.props;

    // Fetch geometry dimensions
    const dims = this.bind.points.getDimensions();
    const strips = dims.width;
    const ribbons = dims.height;
    const layers = dims.depth;

    // Build color lookup
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }

    // Build transition mask lookup
    const mask = this._helpers.object.mask();

    // Build fragment material lookup
    const material = this._helpers.shade.pipeline() || false;

    // Make line renderable
    const { swizzle } = this._helpers.position;
    this.line = this._renderables.make("line", {
      uniforms,
      samples: 2,
      strips,
      ribbons,
      layers,
      position,
      color,
      stroke,
      join,
      mask: swizzle(mask, "yzwx"),
      material,
    });

    this._helpers.visible.make();
    return this._helpers.object.make([this.line]);
  }

  made() {
    return this.resize();
  }

  unmake() {
    this.line = null;

    this._helpers.visible.unmake();
    return this._helpers.object.unmake();
  }

  change(changed, _touched, _init) {
    if (
      changed["geometry.points"] ||
      changed["line.stroke"] ||
      changed["line.join"]
    ) {
      return this.rebuild();
    }
  }
}
Ticks.initClass();
