// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { BufferAttribute } from "three/src/core/BufferAttribute.js";
import { ClipGeometry } from "./clipgeometry.js";

/*
Grid Surface

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+

+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
*/

export class SurfaceGeometry extends ClipGeometry {
  constructor(options, build) {
    if (build == null) {
      build = true;
    }
    super();
    // TODO not great... but use this pattern, maybe, to defer construction if
    // options are missing, NOT the boolean.
    if (build) {
      this.construct(options);
    }
  }

  construct(options) {
    let closedX, closedY, height, layers, segmentsX, segmentsY, surfaces, width;
    this._clipUniforms();

    this.closedX = closedX = options.closedX || false;
    this.closedY = closedY = options.closedY || false;
    this.width = width = (+options.width || 2) + (closedX ? 1 : 0);
    this.height = height = (+options.height || 2) + (closedY ? 1 : 0);
    this.surfaces = surfaces = +options.surfaces || 1;
    this.layers = layers = +options.layers || 1;

    this.segmentsX = segmentsX = Math.max(0, width - 1);
    this.segmentsY = segmentsY = Math.max(0, height - 1);

    const points = width * height * surfaces * layers;
    const quads = segmentsX * segmentsY * surfaces * layers;
    const triangles = quads * 2;

    this.setIndex(new BufferAttribute(new Uint32Array(triangles * 3), 1));

    this.setAttribute(
      "position4",
      new BufferAttribute(new Float32Array(points * 4), 4)
    );
    this.setAttribute(
      "surface",
      new BufferAttribute(new Float32Array(points * 2), 2)
    );

    const index = this._emitter("index");
    const position = this._emitter("position4");

    let base = 0;
    for (
      let i = 0, end = surfaces * layers, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      for (
        let j = 0, end1 = segmentsY, asc1 = 0 <= end1;
        asc1 ? j < end1 : j > end1;
        asc1 ? j++ : j--
      ) {
        for (
          let k = 0, end2 = segmentsX, asc2 = 0 <= end2;
          asc2 ? k < end2 : k > end2;
          asc2 ? k++ : k--
        ) {
          index(base);
          index(base + 1);
          index(base + width);

          index(base + width);
          index(base + 1);
          index(base + width + 1);

          base++;
        }
        base++;
      }
      base += width;
    }

    for (
      let l = 0, end3 = layers, asc3 = 0 <= end3;
      asc3 ? l < end3 : l > end3;
      asc3 ? l++ : l--
    ) {
      for (
        let z = 0, end4 = surfaces, asc4 = 0 <= end4;
        asc4 ? z < end4 : z > end4;
        asc4 ? z++ : z--
      ) {
        for (
          let i1 = 0, y = i1, end5 = height, asc5 = 0 <= end5;
          asc5 ? i1 < end5 : i1 > end5;
          asc5 ? i1++ : i1--, y = i1
        ) {
          for (
            let j1 = 0, x = j1, end6 = width, asc6 = 0 <= end6;
            asc6 ? j1 < end6 : j1 > end6;
            asc6 ? j1++ : j1--, x = j1
          ) {
            position(x, y, z, l);
          }
        }
      }
    }

    this._finalize();
    this.clip();
  }

  clip(width, height, surfaces, layers) {
    if (width == null) {
      width = this.width - this.closedX;
    }
    if (height == null) {
      height = this.height - this.closedY;
    }
    if (surfaces == null) {
      ({ surfaces } = this);
    }
    if (layers == null) {
      ({ layers } = this);
    }
    width += this.closedX;
    height += this.closedY;

    const segmentsX = Math.max(0, width - 1);
    const segmentsY = Math.max(0, height - 1);

    this._clipGeometry(width, height, surfaces, layers);
    return this._clipOffsets(
      6,
      segmentsX,
      segmentsY,
      surfaces,
      layers,
      this.segmentsX,
      this.segmentsY,
      this.surfaces,
      this.layers
    );
  }

  map(width, height, surfaces, layers) {
    if (width == null) {
      ({ width } = this);
    }
    if (height == null) {
      ({ height } = this);
    }
    if (surfaces == null) {
      ({ surfaces } = this);
    }
    if (layers == null) {
      ({ layers } = this);
    }
    return this._clipMap(width, height, surfaces, layers);
  }
}
