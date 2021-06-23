// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";
import { ClipGeometry } from "./clipgeometry";

/*
(flat) Triangle fans arranged in items, columns and rows

+-+     +-+     +-+     +-+
|\\\    |\\\    |\\\    |\\\
+-+-+   +-+-+   +-+-+   +-+-+

+-+     +-+     +-+     +-+
|\\\    |\\\    |\\\    |\\\
+-+-+   +-+-+   +-+-+   +-+-+

+-+     +-+     +-+     +-+
|\\\    |\\\    |\\\    |\\\
+-+-+   +-+-+   +-+-+   +-+-+
*/

export class FaceGeometry extends ClipGeometry {
  constructor(options) {
    let depth, height, items, sides, width;
    super(options);

    this._clipUniforms();

    this.items = items = +options.items || 2;
    this.width = width = +options.width || 1;
    this.height = height = +options.height || 1;
    this.depth = depth = +options.depth || 1;
    this.sides = sides = Math.max(0, items - 2);

    const samples = width * height * depth;
    const points = items * samples;
    const triangles = sides * samples;

    this.addAttribute(
      "index",
      new THREE.BufferAttribute(new Uint16Array(triangles * 3), 1)
    );
    this.addAttribute(
      "position4",
      new THREE.BufferAttribute(new Float32Array(points * 4), 4)
    );

    this._autochunk();

    const index = this._emitter("index");
    const position = this._emitter("position4");

    let base = 0;
    for (
      let i = 0, end = samples, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      for (
        let j = 0, end1 = sides, asc1 = 0 <= end1;
        asc1 ? j < end1 : j > end1;
        asc1 ? j++ : j--
      ) {
        index(base);
        index(base + j + 1);
        index(base + j + 2);
      }

      base += items;
    }

    for (
      let z = 0, end2 = depth, asc2 = 0 <= end2;
      asc2 ? z < end2 : z > end2;
      asc2 ? z++ : z--
    ) {
      for (
        let y = 0, end3 = height, asc3 = 0 <= end3;
        asc3 ? y < end3 : y > end3;
        asc3 ? y++ : y--
      ) {
        for (
          let x = 0, end4 = width, asc4 = 0 <= end4;
          asc4 ? x < end4 : x > end4;
          asc4 ? x++ : x--
        ) {
          for (
            let l = 0, end5 = items, asc5 = 0 <= end5;
            asc5 ? l < end5 : l > end5;
            asc5 ? l++ : l--
          ) {
            position(x, y, z, l);
          }
        }
      }
    }

    this._finalize();
    this.clip();
  }

  clip(width, height, depth, items) {
    if (width == null) {
      ({ width } = this);
    }
    if (height == null) {
      ({ height } = this);
    }
    if (depth == null) {
      ({ depth } = this);
    }
    if (items == null) {
      ({ items } = this);
    }
    const sides = Math.max(0, items - 2);

    this._clipGeometry(width, height, depth, items);
    return this._clipOffsets(
      3,
      width,
      height,
      depth,
      sides,
      this.width,
      this.height,
      this.depth,
      this.sides
    );
  }
}
