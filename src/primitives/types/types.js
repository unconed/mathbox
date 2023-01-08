// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import * as UData from "../../util/data.js";
import * as UJS from "../../util/js.js";

import {
  ByteType,
  Color,
  FloatType,
  IntType,
  LinearFilter,
  LinearMipMapLinearFilter,
  LinearMipMapNearestFilter,
  Matrix3,
  Matrix4,
  NearestFilter,
  NearestMipMapLinearFilter,
  NearestMipMapNearestFilter,
  Quaternion,
  ShortType,
  UnsignedByteType,
  UnsignedIntType,
  UnsignedShortType,
  Vector2,
  Vector3,
  Vector4,
} from "three";

// Property types
//
// The weird calling convention is for double-buffering the values
// while validating compound types like arrays and nullables.
//
// validate: (value, target, invalid) ->
//
//   # Option 1: Call invalid() to reject
//   return invalid() if value < 0
//
//   # Option 2: Change target in-place
//   target.set(value)
//   return target
//
//   # Option 3: Return new value
//   return +value
//
const _Types = {
  array(type, size, value = null) {
    const lerp = type.lerp
      ? function (a, b, target, f) {
          const l = Math.min(a.length, b.length);
          for (
            let i = 0, end = l, asc = 0 <= end;
            asc ? i < end : i > end;
            asc ? i++ : i--
          ) {
            target[i] = type.lerp(a[i], b[i], target[i], f);
          }
          return target;
        }
      : undefined;

    const op = type.op
      ? function (a, b, target, op) {
          const l = Math.min(a.length, b.length);
          for (
            let i = 0, end = l, asc = 0 <= end;
            asc ? i < end : i > end;
            asc ? i++ : i--
          ) {
            target[i] = type.op(a[i], b[i], target[i], op);
          }
          return target;
        }
      : undefined;

    if (value != null && !(value instanceof Array)) {
      value = [value];
    }

    return {
      uniform() {
        if (type.uniform) {
          return type.uniform() + "v";
        } else {
          return undefined;
        }
      },
      make() {
        if (value != null) {
          return value.slice();
        }
        if (!size) {
          return [];
        }
        return __range__(0, size, false).map((_i) => type.make());
      },
      validate(value, target, invalid) {
        if (!(value instanceof Array)) {
          value = [value];
        }

        const l = (target.length = size ? size : value.length);
        for (
          let i = 0, end = l, asc = 0 <= end;
          asc ? i < end : i > end;
          asc ? i++ : i--
        ) {
          const input = value[i] != null ? value[i] : type.make();
          target[i] = type.validate(input, target[i], invalid);
        }

        return target;
      },
      equals(a, b) {
        const al = a.length;
        const bl = b.length;
        if (al !== bl) {
          return false;
        }

        const l = Math.min(al, bl);
        for (
          let i = 0, end = l, asc = 0 <= end;
          asc ? i < end : i > end;
          asc ? i++ : i--
        ) {
          if (
            !(typeof type.equals === "function"
              ? type.equals(a[i], b[i])
              : undefined)
          ) {
            return false;
          }
        }
        return true;
      },
      lerp,
      op,
      clone(v) {
        return Array.from(v).map((x) => type.clone(x));
      },
    };
  },

  letters(type, size, value = null) {
    if (value != null) {
      if (value === "" + value) {
        value = value.split("");
      }
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        value[i] = type.validate(v, v);
      }
    }

    const array = Types.array(type, size, value);

    return {
      uniform() {
        return array.uniform();
      },
      make() {
        return array.make();
      },
      validate(value, target, invalid) {
        if (value === "" + value) {
          value = value.split("");
        }
        return array.validate(value, target, invalid);
      },
      equals(a, b) {
        return array.equals(a, b);
      },
      clone: array.clone,
    };
  },

  nullable(type, make) {
    if (make == null) {
      make = false;
    }
    let value = make ? type.make() : null;

    const emitter = type.emitter
      ? function (expr1, expr2) {
          if (expr2 == null) {
            return expr1;
          }
          if (expr1 == null) {
            return expr2;
          }
          return type.emitter(expr1, expr2);
        }
      : undefined;

    const lerp = type.lerp
      ? function (a, b, target, f) {
          if (a === null || b === null) {
            if (f < 0.5) {
              return a;
            } else {
              return b;
            }
          }
          if (target == null) {
            target = type.make();
          }
          value = type.lerp(a, b, target, f);
          return target;
        }
      : undefined;

    const op = type.op
      ? function (a, b, target, op) {
          if (a === null || b === null) {
            return null;
          }
          if (target == null) {
            target = type.make();
          }
          value = type.op(a, b, target, op);
          return value;
        }
      : undefined;

    return {
      make() {
        return value;
      },
      validate(value, target, invalid) {
        if (value === null) {
          return value;
        }
        if (target === null) {
          target = type.make();
        }
        return type.validate(value, target, invalid);
      },
      uniform() {
        return typeof type.uniform === "function" ? type.uniform() : undefined;
      },
      equals(a, b) {
        let left;
        const an = a === null;
        const bn = b === null;
        if (an && bn) {
          return true;
        }
        if (an ^ bn) {
          return false;
        }
        return (left =
          typeof type.equals === "function" ? type.equals(a, b) : undefined) !=
          null
          ? left
          : a === b;
      },
      lerp,
      op,
      emitter,
    };
  },

  enum(value, keys, map) {
    let key;
    if (keys == null) {
      keys = [];
    }
    if (map == null) {
      map = {};
    }
    let i = 0;
    const values = {};
    for (key of Array.from(keys)) {
      if (key !== +key) {
        if (map[key] == null) {
          map[key] = i++;
        }
      }
    }
    for (key of Array.from(keys)) {
      if (key === +key) {
        values[key] = key;
      }
    }
    for (key in map) {
      i = map[key];
      values[i] = true;
    }

    if (values[value] == null) {
      value = map[value];
    }

    return {
      enum() {
        return map;
      },
      make() {
        return value;
      },
      validate(value, target, invalid) {
        const v = values[value] ? value : map[value];
        if (v != null) {
          return v;
        }
        return invalid();
      },
    };
  },

  enumber(value, keys, map) {
    if (map == null) {
      map = {};
    }
    const _enum = Types.enum(value, keys, map);

    return {
      enum: _enum.enum,
      uniform() {
        return "f";
      },
      make() {
        let left;
        return (left = _enum.make()) != null ? left : +value;
      },
      validate(value, target, invalid) {
        if (value === +value) {
          return value;
        }
        return _enum.validate(value, target, invalid);
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  select(value) {
    if (value == null) {
      value = "<";
    }
    value;
    return {
      make() {
        return value;
      },
      validate(value, target, invalid) {
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "object") {
          return value;
        }
        return invalid();
      },
    };
  },

  bool(value) {
    value = !!value;
    return {
      uniform() {
        return "f";
      },
      make() {
        return value;
      },
      validate(value, _target, _invalid) {
        return !!value;
      },
    };
  },

  int(value) {
    if (value == null) {
      value = 0;
    }
    value = +Math.round(value);
    return {
      uniform() {
        return "i";
      },
      make() {
        return value;
      },
      validate(value, target, invalid) {
        let x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return Math.round(x) || 0;
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  round(value) {
    if (value == null) {
      value = 0;
    }
    value = +Math.round(value);
    return {
      uniform() {
        return "f";
      },
      make() {
        return value;
      },
      validate(value, target, invalid) {
        let x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return Math.round(x) || 0;
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  number(value) {
    if (value == null) {
      value = 0;
    }
    return {
      uniform() {
        return "f";
      },
      make() {
        return +value;
      },
      validate(value, target, invalid) {
        let x;
        if (value !== (x = +value)) {
          return invalid();
        }
        return x || 0;
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  positive(type, strict) {
    if (strict == null) {
      strict = false;
    }
    return {
      uniform: type.uniform,
      make: type.make,
      validate(value, target, invalid) {
        value = type.validate(value, target, invalid);
        if (value < 0 || (strict && value <= 0)) {
          return invalid();
        }
        return value;
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  string(value) {
    if (value == null) {
      value = "";
    }
    return {
      make() {
        return "" + value;
      },
      validate(value, target, invalid) {
        let x;
        if (value !== (x = "" + value)) {
          return invalid();
        }
        return x;
      },
    };
  },

  func() {
    return {
      make() {
        return function () {};
      },
      validate(value, target, invalid) {
        if (typeof value === "function") {
          return value;
        }
        return invalid();
      },
    };
  },

  emitter() {
    return {
      make() {
        return (emit) => emit(1, 1, 1, 1);
      },
      validate(value, target, invalid) {
        if (typeof value === "function") {
          return value;
        }
        return invalid();
      },
      emitter(a, b) {
        return UData.getLerpEmitter(a, b);
      },
    };
  },

  object(value) {
    return {
      make() {
        return value != null ? value : {};
      },
      validate(value, target, invalid) {
        if (typeof value === "object") {
          return value;
        }
        return invalid();
      },
      clone(v) {
        return JSON.parse(JSON.stringify(v));
      },
    };
  },

  timestamp(value = null) {
    if (typeof value === "string") {
      value = Date.parse(value);
    }

    return {
      uniform() {
        return "f";
      },
      make() {
        return value != null ? value : +new Date();
      },
      validate(value, target, invalid) {
        value = Date.parse(value);
        if (value !== +value) {
          return invalid();
        }
        return value;
      },
      op(a, b, target, op) {
        return op(a, b);
      },
    };
  },

  vec2(x, y) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    const defaults = [x, y];
    return {
      uniform() {
        return "v2";
      },
      make() {
        return new Vector2(x, y);
      },
      validate(value, target, invalid) {
        if (value === +value) {
          value = [value];
        }

        if (value instanceof Vector2) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          const xx = value.x != null ? value.x : x;
          const yy = value.y != null ? value.y : y;
          target.set(xx, yy);
        } else {
          return invalid();
        }
        return target;
      },

      equals(a, b) {
        return a.x === b.x && a.y === b.y;
      },
      op(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        return target;
      },
    };
  },

  ivec2(x, y) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    const vec2 = Types.vec2(x, y);
    const { validate } = vec2;
    vec2.validate = function (value, target, invalid) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      return target;
    };
    return vec2;
  },

  vec3(x, y, z) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    const defaults = [x, y, z];
    return {
      uniform() {
        return "v3";
      },
      make() {
        return new Vector3(x, y, z);
      },
      validate(value, target, invalid) {
        if (value === +value) {
          value = [value];
        }

        if (value instanceof Vector3) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          const xx = value.x != null ? value.x : x;
          const yy = value.y != null ? value.y : y;
          const zz = value.z != null ? value.z : z;
          target.set(xx, yy, zz);
        } else {
          return invalid();
        }
        return target;
      },

      equals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
      },
      op(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        return target;
      },
    };
  },

  ivec3(x, y, z) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    const vec3 = Types.vec3(x, y, z);
    const { validate } = vec3;
    vec3.validate = function (value, target, invalid) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
      return target;
    };
    return vec3;
  },

  vec4(x, y, z, w) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    const defaults = [x, y, z, w];
    return {
      uniform() {
        return "v4";
      },
      make() {
        return new Vector4(x, y, z, w);
      },
      validate(value, target, invalid) {
        if (value === +value) {
          value = [value];
        }

        if (value instanceof Vector4) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else if (value != null) {
          const xx = value.x != null ? value.x : x;
          const yy = value.y != null ? value.y : y;
          const zz = value.z != null ? value.z : z;
          const ww = value.w != null ? value.w : w;
          target.set(xx, yy, zz, ww);
        } else {
          return invalid();
        }
        return target;
      },
      equals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      },
      op(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        target.w = op(a.w, b.w);
        return target;
      },
    };
  },

  ivec4(x, y, z, w) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    const vec4 = Types.vec4(x, y, z, w);
    const { validate } = vec4;
    vec4.validate = function (value, target, invalid) {
      validate(value, target, invalid);
      target.x = Math.round(target.x);
      target.y = Math.round(target.y);
      target.z = Math.round(target.z);
      target.w = Math.round(target.w);
      return target;
    };
    return vec4;
  },

  mat3(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
    if (n11 == null) {
      n11 = 1;
    }
    if (n12 == null) {
      n12 = 0;
    }
    if (n13 == null) {
      n13 = 0;
    }
    if (n21 == null) {
      n21 = 0;
    }
    if (n22 == null) {
      n22 = 1;
    }
    if (n23 == null) {
      n23 = 0;
    }
    if (n31 == null) {
      n31 = 0;
    }
    if (n32 == null) {
      n32 = 0;
    }
    if (n33 == null) {
      n33 = 1;
    }
    const defaults = [n11, n12, n13, n21, n22, n23, n31, n32, n33];

    return {
      uniform() {
        return "m4";
      },
      make() {
        const m = new Matrix3();
        m.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
        return m;
      },
      validate(value, target, invalid) {
        if (value instanceof Matrix3) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          return invalid();
        }
        return target;
      },
    };
  },

  mat4(
    n11,
    n12,
    n13,
    n14,
    n21,
    n22,
    n23,
    n24,
    n31,
    n32,
    n33,
    n34,
    n41,
    n42,
    n43,
    n44
  ) {
    if (n11 == null) {
      n11 = 1;
    }
    if (n12 == null) {
      n12 = 0;
    }
    if (n13 == null) {
      n13 = 0;
    }
    if (n14 == null) {
      n14 = 0;
    }
    if (n21 == null) {
      n21 = 0;
    }
    if (n22 == null) {
      n22 = 1;
    }
    if (n23 == null) {
      n23 = 0;
    }
    if (n24 == null) {
      n24 = 0;
    }
    if (n31 == null) {
      n31 = 0;
    }
    if (n32 == null) {
      n32 = 0;
    }
    if (n33 == null) {
      n33 = 1;
    }
    if (n34 == null) {
      n34 = 0;
    }
    if (n41 == null) {
      n41 = 0;
    }
    if (n42 == null) {
      n42 = 0;
    }
    if (n43 == null) {
      n43 = 0;
    }
    if (n44 == null) {
      n44 = 1;
    }
    const defaults = [
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44,
    ];

    return {
      uniform() {
        return "m4";
      },
      make() {
        const m = new Matrix4();
        m.set(
          n11,
          n12,
          n13,
          n14,
          n21,
          n22,
          n23,
          n24,
          n31,
          n32,
          n33,
          n34,
          n41,
          n42,
          n43,
          n44
        );
        return m;
      },
      validate(value, target, invalid) {
        if (value instanceof Matrix4) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.set.apply(target, value);
        } else {
          return invalid();
        }
        return target;
      },
    };
  },

  quat(x, y, z, w) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 1;
    }
    const vec4 = Types.vec4(x, y, z, w);

    return {
      uniform() {
        return "v4";
      },
      make() {
        return new Quaternion();
      },
      validate(value, target, invalid) {
        if (value instanceof Quaternion) {
          target.copy(value);
        } else {
          target = vec4.validate(value, target, invalid);
        }
        target.normalize();
        return target;
      },
      equals(a, b) {
        return a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w;
      },
      op(a, b, target, op) {
        target.x = op(a.x, b.x);
        target.y = op(a.y, b.y);
        target.z = op(a.z, b.z);
        target.w = op(a.w, b.w);
        target.normalize();
        return target;
      },
      lerp(a, b, target, f) {
        if (target.slerpQuaternions) {
          // NOTE: slerpQuaternions replaced the static slerp method in three.js
          // r127. This switch removes the deprecation warning and keeps the
          // project three.js compatible across this version.
          target.slerpQuaternions(a, b, f);
        } else {
          Quaternion.slerp(a, b, target, f);
        }
        return target;
      },
    };
  },

  color(r, g, b) {
    if (r == null) {
      r = 0.5;
    }
    if (g == null) {
      g = 0.5;
    }
    if (b == null) {
      b = 0.5;
    }
    const defaults = [r, g, b];

    return {
      uniform() {
        return "c";
      },
      make() {
        return new Color(r, g, b);
      },
      validate(value, target, invalid) {
        if (value === "" + value) {
          value = new Color().setStyle(value);
        } else if (value === +value) {
          value = new Color(value);
        }

        if (value instanceof Color) {
          target.copy(value);
        } else if (value instanceof Array) {
          value = value.concat(defaults.slice(value.length));
          target.setRGB.apply(target, value);
        } else if (value != null) {
          const rr = value.r != null ? value.r : r;
          const gg = value.g != null ? value.g : g;
          const bb = value.b != null ? value.b : b;
          target.set(rr, gg, bb);
        } else {
          return invalid();
        }
        return target;
      },

      equals(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b;
      },
      op(a, b, target, op) {
        target.r = op(a.r, b.r);
        target.g = op(a.g, b.g);
        target.b = op(a.b, b.b);
        return target;
      },
    };
  },

  axis(value, allowZero) {
    let v;
    if (value == null) {
      value = 1;
    }
    if (allowZero == null) {
      allowZero = false;
    }
    const map = {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
      W: 1,
      H: 2,
      D: 3,
      I: 4,
      zero: 0,
      null: 0,
      width: 1,
      height: 2,
      depth: 3,
      items: 4,
    };

    const range = allowZero ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];
    if ((v = map[value]) != null) {
      value = v;
    }

    return {
      make() {
        return value;
      },
      validate(value, target, invalid) {
        let left;
        if ((v = map[value]) != null) {
          value = v;
        }
        value = (left = Math.round(value)) != null ? left : 0;
        if (Array.from(range).includes(value)) {
          return value;
        }
        return invalid();
      },
    };
  },

  transpose(order) {
    if (order == null) {
      order = [1, 2, 3, 4];
    }
    const looseArray = Types.letters(Types.axis(null, false), 0, order);
    const axesArray = Types.letters(Types.axis(null, false), 4, order);

    return {
      make() {
        return axesArray.make();
      },
      validate(value, target, invalid) {
        let temp = [1, 2, 3, 4];
        looseArray.validate(value, temp, invalid);

        if (temp.length < 4) {
          const missing = [1, 2, 3, 4].filter((x) => temp.indexOf(x) === -1);
          temp = temp.concat(missing);
        }

        const unique = Array.from(temp).map(
          (letter, i) => temp.indexOf(letter) === i
        );
        if (unique.indexOf(false) < 0) {
          return axesArray.validate(temp, target, invalid);
        }
        return invalid();
      },
      equals: axesArray.equals,
      clone: axesArray.clone,
    };
  },

  swizzle(order, size = null) {
    if (order == null) {
      order = [1, 2, 3, 4];
    }
    if (size == null) {
      size = order.length;
    }
    order = order.slice(0, size);
    const looseArray = Types.letters(Types.axis(null, false), 0, order);
    const axesArray = Types.letters(Types.axis(null, true), size, order);

    return {
      make() {
        return axesArray.make();
      },
      validate(value, target, invalid) {
        let temp = order.slice();
        looseArray.validate(value, temp, invalid);

        if (temp.length < size) {
          temp = temp.concat([0, 0, 0, 0]).slice(0, size);
        }

        return axesArray.validate(temp, target, invalid);
      },
      equals: axesArray.equals,
      clone: axesArray.clone,
    };
  },

  classes() {
    const stringArray = Types.array(Types.string());

    return {
      make() {
        return stringArray.make();
      },
      validate(value, target, invalid) {
        if (value === "" + value) {
          value = value.split(" ");
        }
        value = value.filter((x) => !!x.length);
        return stringArray.validate(value, target, invalid);
      },
      equals: stringArray.equals,
      clone: stringArray.clone,
    };
  },

  blending(value) {
    if (value == null) {
      value = "normal";
    }
    const keys = ["no", "normal", "add", "subtract", "multiply", "custom"];
    return Types.enum(value, keys);
  },

  filter(value) {
    if (value == null) {
      value = "nearest";
    }
    const map = {
      nearest: NearestFilter,
      nearestMipMapNearest: NearestMipMapNearestFilter,
      nearestMipMapLinear: NearestMipMapLinearFilter,
      linear: LinearFilter,
      linearMipMapNearest: LinearMipMapNearestFilter,
      linearMipmapLinear: LinearMipMapLinearFilter,
    };

    return Types.enum(value, [], map);
  },

  type(value) {
    if (value == null) {
      value = "unsignedByte";
    }
    const map = {
      unsignedByte: UnsignedByteType,
      byte: ByteType,
      short: ShortType,
      unsignedShort: UnsignedShortType,
      int: IntType,
      unsignedInt: UnsignedIntType,
      float: FloatType,
    };

    return Types.enum(value, [], map);
  },

  scale(value) {
    if (value == null) {
      value = "linear";
    }
    const keys = ["linear", "log"];
    return Types.enum(value, keys);
  },

  mapping(value) {
    if (value == null) {
      value = "relative";
    }
    const keys = ["relative", "absolute"];
    return Types.enum(value, keys);
  },

  indexing(value) {
    if (value == null) {
      value = "original";
    }
    const keys = ["original", "final"];
    return Types.enum(value, keys);
  },

  shape(value) {
    if (value == null) {
      value = "circle";
    }
    const keys = ["circle", "square", "diamond", "up", "down", "left", "right"];
    return Types.enum(value, keys);
  },

  join(value) {
    if (value == null) {
      value = "miter";
    }
    const keys = ["miter", "round", "bevel"];
    return Types.enum(value, keys);
  },

  stroke(value) {
    if (value == null) {
      value = "solid";
    }
    const keys = ["solid", "dotted", "dashed"];
    return Types.enum(value, keys);
  },

  vertexPass(value) {
    if (value == null) {
      value = "view";
    }
    const keys = ["data", "view", "world", "eye"];
    return Types.enum(value, keys);
  },

  fragmentPass(value) {
    if (value == null) {
      value = "light";
    }
    const keys = ["color", "light", "rgba"];
    return Types.enum(value, keys);
  },

  ease(value) {
    if (value == null) {
      value = "linear";
    }
    const keys = ["linear", "cosine", "binary", "hold"];
    return Types.enum(value, keys);
  },

  fit(value) {
    if (value == null) {
      value = "contain";
    }
    const keys = ["x", "y", "contain", "cover"];
    return Types.enum(value, keys);
  },

  anchor(value) {
    if (value == null) {
      value = "middle";
    }
    const map = {
      first: 1,
      middle: 0,
      last: -1,
    };

    return Types.enumber(value, [], map);
  },

  transitionState(value) {
    if (value == null) {
      value = "enter";
    }
    const map = {
      enter: -1,
      visible: 0,
      exit: 1,
    };

    return Types.enumber(value, [], map);
  },

  font(value) {
    if (value == null) {
      value = "sans-serif";
    }
    const parse = UJS.parseQuoted;
    if (!(value instanceof Array)) {
      value = parse(value);
    }
    const stringArray = Types.array(Types.string(), 0, value);

    return {
      make() {
        return stringArray.make();
      },
      validate(value, target, invalid) {
        try {
          if (!(value instanceof Array)) {
            value = parse(value);
          }
        } catch (error) {
          return invalid();
        }

        value = value.filter((x) => !!x.length);
        return stringArray.validate(value, target, invalid);
      },
      equals: stringArray.equals,
      clone: stringArray.clone,
    };
  },

  data(value) {
    if (value == null) {
      value = [];
    }
    return {
      make() {
        return [];
      },
      validate(value, target, invalid) {
        if (value instanceof Array) {
          return value;
        } else if ((value != null ? value.length : undefined) != null) {
          return value;
        } else {
          return invalid();
        }
      },

      emitter(a, b) {
        return UData.getLerpThunk(a, b);
      },
    };
  },
};

const decorate = function (types) {
  for (const k in types) {
    const type = types[k];
    types[k] = ((type) =>
      function () {
        const t = type.apply(type, arguments);
        if (t.validate == null) {
          t.validate = (v) => v != null;
        }
        if (t.equals == null) {
          t.equals = (a, b) => a === b;
        }
        if (t.clone == null) {
          t.clone = function (v) {
            let left;
            return (left = __guardMethod__(v, "clone", (o) => o.clone())) !=
              null
              ? left
              : v;
          };
        }
        return t;
      })(type);
  }
  return types;
};

export const Types = decorate(_Types);

function __range__(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
function __guardMethod__(obj, methodName, transform) {
  if (
    typeof obj !== "undefined" &&
    obj !== null &&
    typeof obj[methodName] === "function"
  ) {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
