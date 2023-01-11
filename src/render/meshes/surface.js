// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { DoubleSide, Mesh } from "three";
import { Base } from "./base.js";
import { SurfaceGeometry } from "../geometry/surfacegeometry.js";

export class Surface extends Base {
  constructor(renderer, shaders, options) {
    let f;
    super(renderer, shaders, options);

    let { uniforms, material } = options;

    const { position, color, normal, mask, map, combine, linear, stpq, intUV } =
      options;

    if (uniforms == null) {
      uniforms = {};
    }
    if (material == null) {
      material = true;
    }

    const hasStyle = uniforms.styleColor != null;

    this.geometry = new SurfaceGeometry({
      width: options.width,
      height: options.height,
      surfaces: options.surfaces,
      layers: options.layers,
      closedX: options.closedX,
      closedY: options.closedY,
    });

    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);

    const defs = {};
    if (options.closedX) {
      defs.SURFACE_CLOSED_X = "";
    }
    if (options.closedY) {
      defs.SURFACE_CLOSED_Y = "";
    }
    if (intUV) {
      defs.POSITION_UV_INT = "";
    }

    const factory = shaders.material();

    const v = factory.vertex;

    v.pipe(this._vertexColor(color, mask));

    v.require(this._vertexPosition(position, material, map, 2, stpq));

    if (normal) {
      v.require(normal);
      v.pipe("surface.position.normal", this.uniforms, defs);
    } else {
      if (!material) {
        v.pipe("surface.position", this.uniforms, defs);
      }
      if (material) {
        v.pipe("surface.position.shaded", this.uniforms, defs);
      }
    }
    v.pipe("project.position", this.uniforms);

    factory.fragment = f = this._fragmentColor(
      hasStyle,
      material,
      color,
      mask,
      map,
      2,
      stpq,
      combine,
      linear
    );

    f.pipe("fragment.color", this.uniforms);

    const opts = factory.link({
      side: DoubleSide,
    });
    this.material = this._material(opts);

    const object = new Mesh(this.geometry, this.material);
    object.userData = opts;

    this._raw(object);
    this.renders = [object];
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renders = this.geometry = this.material = null;
    return super.dispose();
  }
}
