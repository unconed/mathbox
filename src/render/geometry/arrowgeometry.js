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
Cones to attach as arrowheads on line strips

.....> .....> .....> .....>

.....> .....> .....> .....>

.....> .....> .....> .....>
*/

export class ArrowGeometry extends ClipGeometry {
  constructor(options) {
    let anchor, flip, closed, k, layers, ribbons, samples, sides, strips;
    let asc, end;
    super(options);

    this._clipUniforms();

    this.sides = sides = +options.sides || 12;
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.flip = flip = options.flip != null ? options.flip : false;
    this.closed = closed = options.closed != null ? options.closed : false;
    this.anchor = anchor =
      options.anchor != null
        ? options.anchor
        : flip || closed
        ? 0
        : samples - 1;

    const arrows = strips * ribbons * layers;
    const points = (sides + 2) * arrows;
    const triangles = sides * 2 * arrows;

    this.setIndex(new BufferAttribute(new Uint32Array(triangles * 3), 1));

    this.setAttribute(
      "position4",
      new BufferAttribute(new Float32Array(points * 4), 4)
    );
    this.setAttribute(
      "arrow",
      new BufferAttribute(new Float32Array(points * 3), 3)
    );
    this.setAttribute(
      "attach",
      new BufferAttribute(new Float32Array(points * 2), 2)
    );

    const index = this._emitter("index");
    const position = this._emitter("position4");
    const arrow = this._emitter("arrow");
    const attach = this._emitter("attach");

    const circle = [];
    for (
      k = 0, end = sides, asc = 0 <= end;
      asc ? k < end : k > end;
      asc ? k++ : k--
    ) {
      const angle = (k / sides) * 2 * Math.PI;
      circle.push([Math.cos(angle), Math.sin(angle), 1]);
    }

    let base = 0;
    for (
      let i = 0, end1 = arrows, asc1 = 0 <= end1;
      asc1 ? i < end1 : i > end1;
      asc1 ? i++ : i--
    ) {
      let asc2, end2;
      const tip = base++;
      const back = tip + sides + 1;

      for (
        k = 0, end2 = sides, asc2 = 0 <= end2;
        asc2 ? k < end2 : k > end2;
        asc2 ? k++ : k--
      ) {
        const a = base + (k % sides);
        const b = base + ((k + 1) % sides);

        index(tip);
        index(a);
        index(b);

        index(b);
        index(a);
        index(back);
      }

      base += sides + 1;
    }

    const near = flip ? 1 : closed ? samples - 1 : -1;
    const far = flip && !closed ? samples - 1 : 0;
    const x = anchor;

    for (
      let l = 0, end3 = layers, asc3 = 0 <= end3;
      asc3 ? l < end3 : l > end3;
      asc3 ? l++ : l--
    ) {
      for (
        let z = 0, end4 = ribbons, asc4 = 0 <= end4;
        asc4 ? z < end4 : z > end4;
        asc4 ? z++ : z--
      ) {
        for (
          let y = 0, end5 = strips, asc5 = 0 <= end5;
          asc5 ? y < end5 : y > end5;
          asc5 ? y++ : y--
        ) {
          let asc6, end6;
          position(x, y, z, l);
          arrow(0, 0, 0);
          attach(near, far);

          for (
            k = 0, end6 = sides, asc6 = 0 <= end6;
            asc6 ? k < end6 : k > end6;
            asc6 ? k++ : k--
          ) {
            position(x, y, z, l);

            const c = circle[k];
            arrow(c[0], c[1], c[2]);
            attach(near, far);
          }

          position(x, y, z, l);
          arrow(0, 0, 1);
          attach(near, far);
        }
      }
    }

    this._finalize();
    this.clip();
  }

  clip(samples, strips, ribbons, layers) {
    let quads;
    if (samples == null) {
      ({ samples } = this);
    }
    if (strips == null) {
      ({ strips } = this);
    }
    if (ribbons == null) {
      ({ ribbons } = this);
    }
    if (layers == null) {
      ({ layers } = this);
    }

    this._clipGeometry(samples, strips, ribbons, layers);

    if (samples > 0) {
      const dims = [layers, ribbons, strips];
      const maxs = [this.layers, this.ribbons, this.strips];
      quads = this.sides * this._reduce(dims, maxs);
    } else {
      quads = 0;
    }

    return this._offsets([
      {
        start: 0,
        count: quads * 6,
        materialIndex: 0,
      },
    ]);
  }
}
