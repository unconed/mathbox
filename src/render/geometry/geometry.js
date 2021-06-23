// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as THREE from "three";

let debug = false;

const tick = function () {
  const now = +new Date();
  return function (label) {
    const delta = +new Date() - now;
    console.log(label, delta + " ms");
    return delta;
  };
};

export class Geometry extends THREE.BufferGeometry {
  constructor() {
    super();
    new THREE.BufferGeometry(this);
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    if (this.offsets == null) {
      this.offsets = [];
    }

    if (debug) {
      this.tock = tick();
    }
    this.chunked = false;
    this.limit = 0xffff;
  }

  _reduce(dims, maxs) {
    let multiple = false;
    for (let i = 0; i < dims.length; i++) {
      const dim = dims[i];
      const max = maxs[i];
      if (multiple) {
        dims[i] = max;
      }
      if (dim > 1) {
        multiple = true;
      }
    }

    return dims.reduce((a, b) => a * b);
  }

  _emitter(name) {
    const attribute = this.attributes[name];
    const dimensions = attribute.itemSize;
    const { array } = attribute;

    let offset = 0;

    const one = (a) => (array[offset++] = a);
    const two = function (a, b) {
      array[offset++] = a;
      return (array[offset++] = b);
    };
    const three = function (a, b, c) {
      array[offset++] = a;
      array[offset++] = b;
      return (array[offset++] = c);
    };
    const four = function (a, b, c, d) {
      array[offset++] = a;
      array[offset++] = b;
      array[offset++] = c;
      return (array[offset++] = d);
    };

    return [null, one, two, three, four][dimensions];
  }

  _autochunk() {
    const indexed = this.attributes.index;
    for (let name in this.attributes) {
      const attribute = this.attributes[name];
      if (name !== "index" && indexed) {
        const numItems = attribute.array.length / attribute.itemSize;
        if (numItems > this.limit) {
          this.chunked = true;
        }
        break;
      }
    }

    if (this.chunked && !indexed.u16) {
      let array;
      indexed.u16 = array = indexed.array;
      return (indexed.array = new Uint32Array(array.length));
    }
  }

  _finalize() {
    if (!this.chunked) {
      return;
    }

    const attrib = this.attributes.index;
    this.chunks = this._chunks(attrib.array, this.limit);
    this._chunkify(attrib, this.chunks);

    if (debug) {
      return this.tock(this.constructor.name);
    }
  }

  _chunks(array, limit) {
    const chunks = [];

    let last = 0;
    let start = array[0];
    let end = array[0];

    const push = function (i) {
      const _start = last * 3;
      const _end = i * 3;
      const _count = _end - _start;

      return chunks.push({
        index: start,
        start: _start,
        count: _count,
        end: _end,
      });
    };

    const n = Math.floor(array.length / 3);
    let o = 0;
    for (
      let i = 0, end1 = n, asc = 0 <= end1;
      asc ? i < end1 : i > end1;
      asc ? i++ : i--
    ) {
      const j1 = array[o++];
      const j2 = array[o++];
      const j3 = array[o++];

      const jmin = Math.min(j1, j2, j3);
      const jmax = Math.max(j1, j2, j3);

      let a = Math.min(start, jmin);
      let b = Math.max(end, jmax);

      if (b - a > limit) {
        push(i);

        a = jmin;
        b = jmax;
        last = i;
      }

      start = a;
      end = b;
    }

    push(n);

    return chunks;
  }

  _chunkify(attrib, chunks) {
    if (!attrib.u16) {
      return;
    }

    const from = attrib.array;
    const to = attrib.u16;
    for (let chunk of Array.from(chunks)) {
      const offset = chunk.index;
      for (
        let i = chunk.start, { end } = chunk, asc = chunk.start <= end;
        asc ? i < end : i > end;
        asc ? i++ : i--
      ) {
        to[i] = from[i] - offset;
      }
    }

    attrib.array = attrib.u16;
    return delete attrib.u16;
  }

  _offsets(offsets) {
    if (!this.chunked) {
      this.offsets = offsets;
    } else {
      const { chunks } = this;
      const out = this.offsets;
      out.length = null;

      for (let offset of Array.from(offsets)) {
        const { start } = offset;
        const end = offset.count - start;

        for (let chunk of Array.from(chunks)) {
          let _start = chunk.start;
          let _end = chunk.end;

          if (
            (start <= _start && end > _start) ||
            (start < _end && end >= _end) ||
            (start > _start && end < _end)
          ) {
            _start = Math.max(start, _start);
            _end = Math.min(end, _end);

            out.push({
              index: chunk.index,
              start: _start,
              count: _end - _start,
            });
          }
        }
      }
    }

    return null;
  }
}
