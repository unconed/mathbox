// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { DoubleSide, Mesh } from "three";
import { Base } from "./base.js";
import { LineGeometry } from "../geometry/linegeometry.js";

export class Line extends Base {
  constructor(renderer, shaders, options) {
    let left;
    super(renderer, shaders, options);

    let { uniforms, stroke, join } = options;

    const {
      material,
      position,
      color,
      mask,
      map,
      combine,
      stpq,
      linear,
      clip,
      proximity,
      closed,
    } = options;

    if (uniforms == null) {
      uniforms = {};
    }
    stroke = [null, "dotted", "dashed"][stroke];

    const hasStyle = uniforms.styleColor != null;

    // Line join
    join = (left = ["miter", "round", "bevel"][join]) != null ? left : "miter";
    const detail = { miter: 1, round: 4, bevel: 2 }[join];

    this.geometry = new LineGeometry({
      samples: options.samples,
      strips: options.strips,
      ribbons: options.ribbons,
      layers: options.layers,
      anchor: options.anchor,
      closed: options.closed,
      detail,
    });

    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);

    const factory = shaders.material();

    const defs = {};
    if (stroke) {
      defs.LINE_STROKE = "";
    }
    if (clip) {
      defs.LINE_CLIP = "";
    }
    if (proximity != null) {
      defs.LINE_PROXIMITY = "";
    }

    defs["LINE_JOIN_" + join.toUpperCase()] = "";
    if (detail > 1) {
      defs["LINE_JOIN_DETAIL"] = detail;
    }
    if (closed) {
      defs["LINE_CLOSED"] = "";
    }

    const v = factory.vertex;

    v.pipe(this._vertexColor(color, mask));

    v.require(this._vertexPosition(position, material, map, 2, stpq));
    v.pipe("line.position", this.uniforms, defs);
    v.pipe("project.position", this.uniforms);

    const f = factory.fragment;
    if (stroke) {
      f.pipe(`fragment.clip.${stroke}`, this.uniforms);
    }
    if (clip) {
      f.pipe("fragment.clip.ends", this.uniforms);
    }
    if (proximity != null) {
      f.pipe("fragment.clip.proximity", this.uniforms);
    }

    f.pipe(
      this._fragmentColor(
        hasStyle,
        material,
        color,
        mask,
        map,
        2,
        stpq,
        combine,
        linear
      )
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
