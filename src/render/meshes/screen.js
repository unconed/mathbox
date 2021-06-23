// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import { Base } from "./base";
import { ScreenGeometry } from "../geometry";

export class Screen extends Base {
  constructor(renderer, shaders, options) {
    let f;
    super(renderer, shaders, options);

    let { uniforms, map, combine, stpq, linear } = options;
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

    this.material = this._material(
      factory.link({
        side: THREE.DoubleSide,
      })
    );

    const object = new THREE.Mesh(this.geometry, this.material);
    object.frustumCulled = false;

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
