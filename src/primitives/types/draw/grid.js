// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UAxis from "../../../util/axis.js";
import * as UJS from "../../../util/js.js";
import { Primitive } from "../../primitive.js";

export class Grid extends Primitive {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "style",
      "line",
      "grid",
      "area",
      "position",
      "origin",
      "shade",
      "axis:x",
      "axis:y",
      "scale:x",
      "scale:y",
      "span:x",
      "span:y",
    ];
    this.defaults = {
      width: 1,
      zBias: -2,
    };
  }

  constructor(node, context, helpers) {
    super(node, context, helpers);

    this.axes = null;
  }

  make() {
    // Build transition mask lookup
    let mask = this._helpers.object.mask();

    // Build fragment material lookup
    const material = this._helpers.shade.pipeline() || false;

    const axis = (first, second, transpose) => {
      // Prepare data buffer of tick positions
      let position;
      const detail = this._get(first + "axis.detail");
      const samples = detail + 1;
      const resolution = 1 / detail;

      const strips = this._helpers.scale.divide(second);
      const buffer = this._renderables.make("dataBuffer", {
        width: strips,
        channels: 1,
      });

      // Prepare position shader
      const positionUniforms = {
        gridPosition: this._attributes.make(this._types.vec4()),
        gridStep: this._attributes.make(this._types.vec4()),
        gridAxis: this._attributes.make(this._types.vec4()),
      };

      const values = {
        gridPosition: positionUniforms.gridPosition.value,
        gridStep: positionUniforms.gridStep.value,
        gridAxis: positionUniforms.gridAxis.value,
      };

      // Build transform chain
      const p = (position = this._shaders.shader());

      // Align second grid with first in mask space if requested
      if (transpose != null && mask != null) {
        mask = this._helpers.position.swizzle(mask, transpose);
      }

      // Require buffer sampler as callback
      p.require(buffer.shader(this._shaders.shader(), 2));

      // Calculate grid position
      p.pipe("grid.position", positionUniforms);

      // Apply view transform
      position = this._helpers.position.pipeline(p);

      // Prepare bound uniforms
      const styleUniforms = this._helpers.style.uniforms();
      const lineUniforms = this._helpers.line.uniforms();
      const unitUniforms = this._inherit("unit").getUnitUniforms();
      const uniforms = UJS.merge(lineUniforms, styleUniforms, unitUniforms);

      // Make line renderable
      const line = this._renderables.make("line", {
        uniforms,
        samples,
        strips,
        position,
        stroke,
        join,
        mask,
        material,
      });

      // Store axis object for manipulation later
      return { first, second, resolution, samples, line, buffer, values };
    };

    // Generate both line sets
    const { lineX, lineY, crossed, axes } = this.props;
    const transpose = ["0000", "x000", "y000", "z000", "w000"][axes[1]];

    // Stroke style
    const { stroke, join } = this.props;

    this.axes = [];
    lineX && this.axes.push(axis("x.", "y.", null));
    lineY && this.axes.push(axis("y.", "x.", crossed ? null : transpose));

    // Register lines
    const lines = (() => {
      const result = [];
      for (const axis of this.axes) {
        result.push(axis.line);
      }
      return result;
    })();
    this._helpers.visible.make();
    this._helpers.object.make(lines);
    this._helpers.span.make();

    // Monitor view range
    return this._listen(this, "span.range", this.updateRanges);
  }

  unmake() {
    this._helpers.visible.unmake();
    this._helpers.object.unmake();
    this._helpers.span.unmake();

    for (const axis of this.axes) {
      axis.buffer.dispose();
    }

    this.axes = null;
  }

  change(changed, touched, init) {
    if (
      changed["x.axis.detail"] ||
      changed["y.axis.detail"] ||
      changed["x.axis.factor"] ||
      changed["y.axis.factor"] ||
      changed["grid.lineX"] ||
      changed["grid.lineY"] ||
      changed["line.stroke"] ||
      changed["line.join"] ||
      changed["grid.crossed"] ||
      (changed["grid.axes"] && this.props.crossed)
    ) {
      this.rebuild();
    }

    if (
      touched["x"] ||
      touched["y"] ||
      touched["area"] ||
      touched["grid"] ||
      touched["view"] ||
      touched["origin"] ||
      init
    ) {
      this.updateRanges();
    }
  }

  updateRanges() {
    const { axes, origin } = this.props;

    const axisFn = (x, y, range1, range2, axis) => {
      const { second, resolution, samples, line, buffer, values } = axis;

      // Set line steps along first axis
      let min = range1.x;
      let max = range1.y;
      UAxis.setDimension(values.gridPosition, x).multiplyScalar(min);
      UAxis.setDimension(values.gridStep, x).multiplyScalar(
        (max - min) * resolution
      );

      // Add origin on remaining two axes
      UAxis.addOrigin(values.gridPosition, axes, origin);

      // Calculate scale along second axis
      min = range2.x;
      max = range2.y;
      const ticks = this._helpers.scale.generate(second, buffer, min, max);
      UAxis.setDimension(values.gridAxis, y);

      // Clip to number of ticks
      const n = ticks.length;
      return line.geometry.clip(samples, n, 1, 1);
    };

    // Fetch grid range in both dimensions
    const range1 = this._helpers.span.get("x.", axes[0]);
    const range2 = this._helpers.span.get("y.", axes[1]);

    // Update both line sets
    const { lineX, lineY } = this.props;

    if (lineX) {
      axisFn(axes[0], axes[1], range1, range2, this.axes[0]);
    }
    if (lineY) {
      axisFn(axes[1], axes[0], range2, range1, this.axes[+lineX]);
    }
  }
}
Grid.initClass();
