// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as CONST from "three/src/constants.js";

import { Euler } from "three/src/math/Euler.js";
import { Matrix4 } from "three/src/math/Matrix4.js";
import { Quaternion } from "three/src/math/Quaternion.js";
import { Vector3 } from "three/src/math/Vector3.js";

export const paramToGL = function (gl, p) {
  if (p === CONST.RepeatWrapping) {
    return gl.REPEAT;
  }
  if (p === CONST.ClampToEdgeWrapping) {
    return gl.CLAMP_TO_EDGE;
  }
  if (p === CONST.MirroredRepeatWrapping) {
    return gl.MIRRORED_REPEAT;
  }

  if (p === CONST.NearestFilter) {
    return gl.NEAREST;
  }
  if (p === CONST.NearestMipMapNearestFilter) {
    return gl.NEAREST_MIPMAP_NEAREST;
  }
  if (p === CONST.NearestMipMapLinearFilter) {
    return gl.NEAREST_MIPMAP_LINEAR;
  }

  if (p === CONST.LinearFilter) {
    return gl.LINEAR;
  }
  if (p === CONST.LinearMipMapNearestFilter) {
    return gl.LINEAR_MIPMAP_NEAREST;
  }
  if (p === CONST.LinearMipMapLinearFilter) {
    return gl.LINEAR_MIPMAP_LINEAR;
  }

  if (p === CONST.UnsignedByteType) {
    return gl.UNSIGNED_BYTE;
  }
  if (p === CONST.UnsignedShort4444Type) {
    return gl.UNSIGNED_SHORT_4_4_4_4;
  }
  if (p === CONST.UnsignedShort5551Type) {
    return gl.UNSIGNED_SHORT_5_5_5_1;
  }
  if (p === CONST.UnsignedShort565Type) {
    return gl.UNSIGNED_SHORT_5_6_5;
  }

  if (p === CONST.ByteType) {
    return gl.BYTE;
  }
  if (p === CONST.ShortType) {
    return gl.SHORT;
  }
  if (p === CONST.UnsignedShortType) {
    return gl.UNSIGNED_SHORT;
  }
  if (p === CONST.IntType) {
    return gl.INT;
  }
  if (p === CONST.UnsignedIntType) {
    return gl.UNSIGNED_INT;
  }
  if (p === CONST.FloatType) {
    return gl.FLOAT;
  }

  if (p === CONST.AlphaFormat) {
    return gl.ALPHA;
  }
  if (p === CONST.RGBFormat) {
    return gl.RGB;
  }
  if (p === CONST.RGBAFormat) {
    return gl.RGBA;
  }
  if (p === CONST.LuminanceFormat) {
    return gl.LUMINANCE;
  }
  if (p === CONST.LuminanceAlphaFormat) {
    return gl.LUMINANCE_ALPHA;
  }

  if (p === CONST.AddEquation) {
    return gl.FUNC_ADD;
  }
  if (p === CONST.SubtractEquation) {
    return gl.FUNC_SUBTRACT;
  }
  if (p === CONST.ReverseSubtractEquation) {
    return gl.FUNC_REVERSE_SUBTRACT;
  }

  if (p === CONST.ZeroFactor) {
    return gl.ZERO;
  }
  if (p === CONST.OneFactor) {
    return gl.ONE;
  }
  if (p === CONST.SrcColorFactor) {
    return gl.SRC_COLOR;
  }
  if (p === CONST.OneMinusSrcColorFactor) {
    return gl.ONE_MINUS_SRC_COLOR;
  }
  if (p === CONST.SrcAlphaFactor) {
    return gl.SRC_ALPHA;
  }
  if (p === CONST.OneMinusSrcAlphaFactor) {
    return gl.ONE_MINUS_SRC_ALPHA;
  }
  if (p === CONST.DstAlphaFactor) {
    return gl.DST_ALPHA;
  }
  if (p === CONST.OneMinusDstAlphaFactor) {
    return gl.ONE_MINUS_DST_ALPHA;
  }

  if (p === CONST.DstColorFactor) {
    return gl.DST_COLOR;
  }
  if (p === CONST.OneMinusDstColorFactor) {
    return gl.ONE_MINUS_DST_COLOR;
  }
  if (p === CONST.SrcAlphaSaturateFactor) {
    return gl.SRC_ALPHA_SATURATE;
  }

  return 0;
};

export const paramToArrayStorage = function (type) {
  switch (type) {
    case CONST.UnsignedByteType:
      return Uint8Array;
    case CONST.ByteType:
      return Int8Array;
    case CONST.ShortType:
      return Int16Array;
    case CONST.UnsignedShortType:
      return Uint16Array;
    case CONST.IntType:
      return Int32Array;
    case CONST.UnsignedIntType:
      return Uint32Array;
    case CONST.FloatType:
      return Float32Array;
  }
};

export const swizzleToEulerOrder = (swizzle) =>
  swizzle.map((i) => ["", "X", "Y", "Z"][i]).join("");

export const transformComposer = function () {
  const euler = new Euler();
  const quat = new Quaternion();
  const pos = new Vector3();
  const scl = new Vector3();
  const transform = new Matrix4();

  return function (position, rotation, quaternion, scale, matrix, eulerOrder) {
    if (eulerOrder == null) {
      eulerOrder = "XYZ";
    }
    if (rotation != null) {
      if (eulerOrder instanceof Array) {
        eulerOrder = swizzleToEulerOrder(eulerOrder);
      }
      euler.setFromVector3(rotation, eulerOrder);
      quat.setFromEuler(euler);
    } else {
      quat.set(0, 0, 0, 1);
    }

    if (quaternion != null) {
      quat.multiply(quaternion);
    }

    if (position != null) {
      pos.copy(position);
    } else {
      pos.set(0, 0, 0);
    }

    if (scale != null) {
      scl.copy(scale);
    } else {
      scl.set(1, 1, 1);
    }

    transform.compose(pos, quat, scl);
    if (matrix != null) {
      transform.multiplyMatrices(transform, matrix);
    }

    return transform;
  };
};
