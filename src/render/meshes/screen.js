// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { Base } from "./base.js";
import { DoubleSide } from "three/src/constants.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { ScreenGeometry } from "../geometry/screengeometry.js";

export class Screen extends Base {
  constructor(renderer, shaders, options) {
    let f;
    super(renderer, shaders, options);

    let { uniforms } = options;
    const { map, combine, stpq, linear } = options;

    if (uniforms == null) {
      uniforms = {};
    }

    const hasStyle = uniforms.styleColor != null;

    this.geometry = new ScreenGeometry({
      width: options.width,
      height: options.height,
    });

    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);

    const factory = shaders.material();

    const v = factory.vertex;
    v.pipe("raw.position.scale", this.uniforms);
    v.fan();
    v.pipe("stpq.xyzw.2d", this.uniforms);
    v.next();
    v.pipe("screen.position", this.uniforms);
    v.join();

    factory.fragment = f = this._fragmentColor(
      hasStyle,
      false,
      null,
      null,
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
    object.frustumCulled = false;
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
