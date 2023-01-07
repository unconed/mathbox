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
import { SpriteGeometry } from "../geometry/spritegeometry.js";

export class Point extends Base {
  constructor(renderer, shaders, options) {
    let f, left;
    super(renderer, shaders, options);

    let { uniforms, shape, fill } = options;

    const {
      material,
      position,
      color,
      size,
      mask,
      map,
      combine,
      linear,
      optical,
      stpq,
    } = options;

    if (uniforms == null) {
      uniforms = {};
    }
    shape = +shape != null ? +shape : 0;
    if (fill == null) {
      fill = true;
    }

    const hasStyle = uniforms.styleColor != null;

    const shapes = [
      "circle",
      "square",
      "diamond",
      "up",
      "down",
      "left",
      "right",
    ];
    const passes = [
      "circle",
      "generic",
      "generic",
      "generic",
      "generic",
      "generic",
      "generic",
    ];
    const scales = [1.2, 1, 1.414, 1.16, 1.16, 1.16, 1.16];
    const pass = passes[shape] != null ? passes[shape] : passes[0];
    const _shape = shapes[shape] != null ? shapes[shape] : shapes[0];
    const _scale = (left = optical && scales[shape]) != null ? left : 1;
    const alpha = fill ? pass : `${pass}.hollow`;

    this.geometry = new SpriteGeometry({
      items: options.items,
      width: options.width,
      height: options.height,
      depth: options.depth,
    });

    this._adopt(uniforms);
    this._adopt(this.geometry.uniforms);

    const defines = { POINT_SHAPE_SCALE: +(_scale + 0.00001) };

    // Shared vertex shader
    const factory = shaders.material();
    const v = factory.vertex;

    v.pipe(this._vertexColor(color, mask));

    // Point sizing
    if (size) {
      v.isolate();
      v.require(size);
      v.require("point.size.varying", this.uniforms);
      v.end();
    } else {
      v.require("point.size.uniform", this.uniforms);
    }

    v.require(this._vertexPosition(position, material, map, 2, stpq));

    v.pipe("point.position", this.uniforms, defines);
    v.pipe("project.position", this.uniforms);

    // Shared fragment shader
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

    // Split fragment into edge and fill pass for better z layering
    const edgeFactory = shaders.material();
    edgeFactory.vertex.pipe(v);
    f = edgeFactory.fragment.pipe(factory.fragment);
    f.require(`point.mask.${_shape}`, this.uniforms);
    f.require(`point.alpha.${alpha}`, this.uniforms);
    f.pipe("point.edge", this.uniforms);

    const fillFactory = shaders.material();
    fillFactory.vertex.pipe(v);
    f = fillFactory.fragment.pipe(factory.fragment);
    f.require(`point.mask.${_shape}`, this.uniforms);
    f.require(`point.alpha.${alpha}`, this.uniforms);
    f.pipe("point.fill", this.uniforms);

    const fillOpts = fillFactory.link({
      side: DoubleSide,
    });
    this.fillMaterial = this._material(fillOpts);

    const edgeOpts = edgeFactory.link({
      side: DoubleSide,
    });
    this.edgeMaterial = this._material(edgeOpts);

    this.fillObject = new Mesh(this.geometry, this.fillMaterial);
    this.edgeObject = new Mesh(this.geometry, this.edgeMaterial);

    this._raw(this.fillObject);
    this.fillObject.userData = fillOpts;

    this._raw(this.edgeObject);
    this.edgeObject.userData = edgeOpts;

    this.renders = [this.fillObject, this.edgeObject];
  }

  show(transparent, blending, order, depth) {
    this._show(this.edgeObject, true, blending, order, depth);
    return this._show(this.fillObject, transparent, blending, order, depth);
  }

  dispose() {
    this.geometry.dispose();
    this.edgeMaterial.dispose();
    this.fillMaterial.dispose();
    this.renders =
      this.edgeObject =
      this.fillObject =
      this.geometry =
      this.edgeMaterial =
      this.fillMaterial =
        null;
    return super.dispose();
  }
}
