// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UGLSL from "../../../util/glsl";
import * as UJS from "../../../util/js";
import { Primitive } from "../../primitive";

export class Face extends Primitive {
  static initClass() {
    this.traits = [
      "node",
      "object",
      "visible",
      "style",
      "line",
      "mesh",
      "face",
      "geometry",
      "position",
      "bind",
      "shade",
    ];
  }

  constructor(node, context, helpers) {
    super(node, context, helpers);

    this.face = null;
  }

  resize() {
    if (this.bind.points == null) {
      return;
    }

    const dims = this.bind.points.getActiveDimensions();
    const { items, width, height, depth } = dims;

    if (this.face) {
      this.face.geometry.clip(width, height, depth, items);
    }
    if (this.line) {
      this.line.geometry.clip(items, width, height, depth);
    }

    if (this.bind.map != null) {
      const map = this.bind.map.getActiveDimensions();
      if (this.face) {
        return this.face.geometry.map(
          map.width,
          map.height,
          map.depth,
          map.items
        );
      }
    }
  }

  make() {
    // Bind to attached data sources
    let color, uniforms;
    this._helpers.bind.make([
      { to: "geometry.points", trait: "source" },
      { to: "geometry.colors", trait: "source" },
      { to: "mesh.map", trait: "source" },
    ]);

    if (this.bind.points == null) {
      return;
    }

    // Fetch position and transform to view
    let position = this.bind.points.sourceShader(this._shaders.shader());
    position = this._helpers.position.pipeline(position);

    // Prepare bound uniforms
    const styleUniforms = this._helpers.style.uniforms();
    const lineUniforms = this._helpers.line.uniforms();
    const unitUniforms = this._inherit("unit").getUnitUniforms();

    // Auto z-bias wireframe over surface
    const wireUniforms = {};
    wireUniforms.styleZBias = this._attributes.make(this._types.number());
    this.wireZBias = wireUniforms.styleZBias;

    // Fetch geometry dimensions
    const dims = this.bind.points.getDimensions();
    const { items, width, height, depth } = dims;

    // Get display properties
    const { line, shaded, fill, stroke, join } = this.props;

    // Build color lookup
    if (this.bind.colors) {
      color = this._shaders.shader();
      this.bind.colors.sourceShader(color);
    }

    // Build transition mask lookup
    const mask = this._helpers.object.mask();

    // Build texture map lookup
    const map = this._helpers.shade.map(
      this.bind.map != null
        ? this.bind.map.sourceShader(this._shaders.shader())
        : undefined
    );

    // Build fragment material lookup
    const material = this._helpers.shade.pipeline();
    const faceMaterial = material || shaded;
    const lineMaterial = material || false;

    const objects = [];

    // Make line renderable
    if (line) {
      // Swizzle face edges into segments
      const swizzle = this._shaders.shader();
      swizzle.pipe(UGLSL.swizzleVec4("yzwx"));
      swizzle.pipe(position);

      uniforms = UJS.merge(
        unitUniforms,
        lineUniforms,
        styleUniforms,
        wireUniforms
      );
      this.line = this._renderables.make("line", {
        uniforms,
        samples: items,
        strips: width,
        ribbons: height,
        layers: depth,
        position: swizzle,
        color,
        stroke,
        join,
        material: lineMaterial,
        mask,
        closed: true,
      });
      objects.push(this.line);
    }

    // Make face renderable
    if (fill) {
      uniforms = UJS.merge(unitUniforms, styleUniforms, {});
      this.face = this._renderables.make("face", {
        uniforms,
        width,
        height,
        depth,
        items,
        position,
        color,
        material: faceMaterial,
        mask,
        map,
      });
      objects.push(this.face);
    }

    this._helpers.visible.make();
    return this._helpers.object.make(objects);
  }

  made() {
    return this.resize();
  }

  unmake() {
    this._helpers.bind.unmake();
    this._helpers.visible.unmake();
    this._helpers.object.unmake();

    return (this.face = this.line = null);
  }

  change(changed, touched, init) {
    if (changed["geometry.points"] || touched["mesh"]) {
      return this.rebuild();
    }

    if (changed["style.zBias"] || changed["mesh.lineBias"] || init) {
      const { fill, zBias, lineBias } = this.props;
      return (this.wireZBias.value = zBias + (fill ? lineBias : 0));
    }
  }
}
Face.initClass();
