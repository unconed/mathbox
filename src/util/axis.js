// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { Vector4 } from "three";

export const setOrigin = function (vec, dimensions, origin) {
  if (+dimensions === dimensions) {
    dimensions = [dimensions];
  } else {
    dimensions = Array.from(dimensions);
  }
  const x = dimensions.includes(1) ? 0 : origin.x;
  const y = dimensions.includes(2) ? 0 : origin.y;
  const z = dimensions.includes(3) ? 0 : origin.z;
  const w = dimensions.includes(4) ? 0 : origin.w;
  return vec.set(x, y, z, w);
};

export const addOrigin = (function () {
  const v = new Vector4();
  return function (vec, dimension, origin) {
    setOrigin(v, dimension, origin);
    return vec.add(v);
  };
})();

export const setDimension = function (vec, dimension) {
  const x = dimension === 1 ? 1 : 0;
  const y = dimension === 2 ? 1 : 0;
  const z = dimension === 3 ? 1 : 0;
  const w = dimension === 4 ? 1 : 0;
  return vec.set(x, y, z, w);
};

export const setDimensionNormal = function (vec, dimension) {
  const x = dimension === 1 ? 1 : 0;
  const y = dimension === 2 ? 1 : 0;
  const z = dimension === 3 ? 1 : 0;
  const w = dimension === 4 ? 1 : 0;
  return vec.set(y, z + x, w, 0);
};

export const recenterAxis = (function () {
  const axis = [0, 0];

  return function (x, dx, bend, f) {
    if (f == null) {
      f = 0;
    }
    if (bend > 0) {
      const x1 = x;
      const x2 = x + dx;

      const abs = Math.max(Math.abs(x1), Math.abs(x2));
      const fabs = abs * f;

      const min = Math.min(x1, x2);
      const max = Math.max(x1, x2);

      x = min + (-abs + fabs - min) * bend;
      dx = max + (abs + fabs - max) * bend - x;
    }

    axis[0] = x;
    axis[1] = dx;
    return axis;
  };
})();
