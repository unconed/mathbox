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
Line strips arranged in columns and rows

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+

+----+ +----+ +----+ +----+
*/

export class LineGeometry extends ClipGeometry {
  constructor(options) {
    let closed,
      detail,
      edge,
      joint,
      joints,
      l,
      layers,
      ribbons,
      samples,
      segments,
      strips,
      vertices,
      x,
      y,
      z;
    super(options);

    this._clipUniforms();

    this.closed = closed = options.closed || false;
    this.samples = samples = (+options.samples || 2) + (closed ? 1 : 0);
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.layers = layers = +options.layers || 1;
    this.detail = detail = +options.detail || 1;

    const lines = samples - 1;
    this.joints = joints = detail - 1;

    this.vertices = vertices = (lines - (closed ? 0 : 1)) * joints + samples;
    this.segments = segments = (lines - (closed ? 0 : 1)) * joints + lines;

    const points = vertices * strips * ribbons * layers * 2;
    const quads = segments * strips * ribbons * layers;
    const triangles = quads * 2;

    this.setIndex(new BufferAttribute(new Uint32Array(triangles * 3), 1));

    this.setAttribute(
      "position4",
      new BufferAttribute(new Float32Array(points * 4), 4)
    );
    this.setAttribute(
      "line",
      new BufferAttribute(new Float32Array(points * 1), 1)
    );
    if (detail > 1) {
      this.setAttribute(
        "joint",
        new BufferAttribute(new Float32Array(points), 1)
      );
    }

    const index = this._emitter("index");
    const position = this._emitter("position4");
    const line = this._emitter("line");
    if (detail > 1) {
      joint = this._emitter("joint");
    }

    let base = 0;
    for (
      let i = 0, end = ribbons * layers, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      for (
        let j = 0, end1 = strips, asc1 = 0 <= end1;
        asc1 ? j < end1 : j > end1;
        asc1 ? j++ : j--
      ) {
        for (
          let k = 0, end2 = segments, asc2 = 0 <= end2;
          asc2 ? k < end2 : k > end2;
          asc2 ? k++ : k--
        ) {
          // note implied - 1
          index(base);
          index(base + 1);
          index(base + 2);

          index(base + 2);
          index(base + 1);
          index(base + 3);

          base += 2;
        }
        base += 2;
      }
    }

    const edger = closed
      ? () => 0
      : function (x) {
          if (x === 0) {
            return -1;
          } else if (x === samples - 1) {
            return 1;
          } else {
            return 0;
          }
        };

    if (detail > 1) {
      let asc3, end3;
      for (
        l = 0, end3 = layers, asc3 = 0 <= end3;
        asc3 ? l < end3 : l > end3;
        asc3 ? l++ : l--
      ) {
        let asc4, end4;
        for (
          z = 0, end4 = ribbons, asc4 = 0 <= end4;
          asc4 ? z < end4 : z > end4;
          asc4 ? z++ : z--
        ) {
          let asc5, end5;
          for (
            y = 0, end5 = strips, asc5 = 0 <= end5;
            asc5 ? y < end5 : y > end5;
            asc5 ? y++ : y--
          ) {
            let asc6, end6, i1;
            for (
              i1 = 0, x = i1, end6 = samples, asc6 = 0 <= end6;
              asc6 ? i1 < end6 : i1 > end6;
              asc6 ? i1++ : i1--, x = i1
            ) {
              edge = edger(x);

              if (edge !== 0) {
                position(x, y, z, l);
                position(x, y, z, l);

                line(1);
                line(-1);

                joint(0.5);
                joint(0.5);
              } else {
                for (
                  let m = 0, end7 = detail, asc7 = 0 <= end7;
                  asc7 ? m < end7 : m > end7;
                  asc7 ? m++ : m--
                ) {
                  position(x, y, z, l);
                  position(x, y, z, l);

                  line(1);
                  line(-1);

                  joint(m / joints);
                  joint(m / joints);
                }
              }
            }
          }
        }
      }
    } else {
      let asc8, end8;
      for (
        l = 0, end8 = layers, asc8 = 0 <= end8;
        asc8 ? l < end8 : l > end8;
        asc8 ? l++ : l--
      ) {
        let asc9, end9;
        for (
          z = 0, end9 = ribbons, asc9 = 0 <= end9;
          asc9 ? z < end9 : z > end9;
          asc9 ? z++ : z--
        ) {
          let asc10, end10;
          for (
            y = 0, end10 = strips, asc10 = 0 <= end10;
            asc10 ? y < end10 : y > end10;
            asc10 ? y++ : y--
          ) {
            let asc11, end11, j1;
            for (
              j1 = 0, x = j1, end11 = samples, asc11 = 0 <= end11;
              asc11 ? j1 < end11 : j1 > end11;
              asc11 ? j1++ : j1--, x = j1
            ) {
              position(x, y, z, l);
              position(x, y, z, l);

              line(1);
              line(-1);
            }
          }
        }
      }
    }

    this._finalize();
    this.clip();
  }

  clip(samples, strips, ribbons, layers) {
    if (samples == null) {
      samples = this.samples - this.closed;
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

    const vertices = samples + (samples - (this.closed ? 0 : 2)) * this.joints;
    const segments = vertices - (this.closed ? 0 : 1);
    samples += this.closed;

    this._clipGeometry(samples, strips, ribbons, layers);
    return this._clipOffsets(
      6,
      segments,
      strips,
      ribbons,
      layers,
      this.segments,
      this.strips,
      this.ribbons,
      this.layers
    );
  }
}
