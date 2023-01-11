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
import { StripGeometry } from "../geometry/stripgeometry.js";

export class Strip extends Base {
  constructor(renderer, shaders, options) {
    let f;
    super(renderer, shaders, options);

    let { uniforms, material } = options;
    const { position, color, mask, map, combine, linear, stpq } = options;

    if (uniforms == null) {
      uniforms = {};
    }
    if (material == null) {
      material = true;
    }

    const hasStyle = uniforms.styleColor != null;

    this.geometry = new StripGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth,
    });

    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);

    const factory = shaders.material();

    const v = factory.vertex;

    v.pipe(this._vertexColor(color, mask));

    v.require(this._vertexPosition(position, material, map, 2, stpq));
    if (!material) {
      v.pipe("mesh.position", this.uniforms);
    }
    if (material) {
      v.pipe("strip.position.normal", this.uniforms);
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
