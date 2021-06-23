// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import * as THREE from "three";

export const paramToGL = function (gl, p) {
  if (p === THREE.RepeatWrapping) {
    return gl.REPEAT;
  }
  if (p === THREE.ClampToEdgeWrapping) {
    return gl.CLAMP_TO_EDGE;
  }
  if (p === THREE.MirroredRepeatWrapping) {
    return gl.MIRRORED_REPEAT;
  }

  if (p === THREE.NearestFilter) {
    return gl.NEAREST;
  }
  if (p === THREE.NearestMipMapNearestFilter) {
    return gl.NEAREST_MIPMAP_NEAREST;
  }
  if (p === THREE.NearestMipMapLinearFilter) {
    return gl.NEAREST_MIPMAP_LINEAR;
  }

  if (p === THREE.LinearFilter) {
    return gl.LINEAR;
  }
  if (p === THREE.LinearMipMapNearestFilter) {
    return gl.LINEAR_MIPMAP_NEAREST;
  }
  if (p === THREE.LinearMipMapLinearFilter) {
    return gl.LINEAR_MIPMAP_LINEAR;
  }

  if (p === THREE.UnsignedByteType) {
    return gl.UNSIGNED_BYTE;
  }
  if (p === THREE.UnsignedShort4444Type) {
    return gl.UNSIGNED_SHORT_4_4_4_4;
  }
  if (p === THREE.UnsignedShort5551Type) {
    return gl.UNSIGNED_SHORT_5_5_5_1;
  }
  if (p === THREE.UnsignedShort565Type) {
    return gl.UNSIGNED_SHORT_5_6_5;
  }

  if (p === THREE.ByteType) {
    return gl.BYTE;
  }
  if (p === THREE.ShortType) {
    return gl.SHORT;
  }
  if (p === THREE.UnsignedShortType) {
    return gl.UNSIGNED_SHORT;
  }
  if (p === THREE.IntType) {
    return gl.INT;
  }
  if (p === THREE.UnsignedIntType) {
    return gl.UNSIGNED_INT;
  }
  if (p === THREE.FloatType) {
    return gl.FLOAT;
  }

  if (p === THREE.AlphaFormat) {
    return gl.ALPHA;
  }
  if (p === THREE.RGBFormat) {
    return gl.RGB;
  }
  if (p === THREE.RGBAFormat) {
    return gl.RGBA;
  }
  if (p === THREE.LuminanceFormat) {
    return gl.LUMINANCE;
  }
  if (p === THREE.LuminanceAlphaFormat) {
    return gl.LUMINANCE_ALPHA;
  }

  if (p === THREE.AddEquation) {
    return gl.FUNC_ADD;
  }
  if (p === THREE.SubtractEquation) {
    return gl.FUNC_SUBTRACT;
  }
  if (p === THREE.ReverseSubtractEquation) {
    return gl.FUNC_REVERSE_SUBTRACT;
  }

  if (p === THREE.ZeroFactor) {
    return gl.ZERO;
  }
  if (p === THREE.OneFactor) {
    return gl.ONE;
  }
  if (p === THREE.SrcColorFactor) {
    return gl.SRC_COLOR;
  }
  if (p === THREE.OneMinusSrcColorFactor) {
    return gl.ONE_MINUS_SRC_COLOR;
  }
  if (p === THREE.SrcAlphaFactor) {
    return gl.SRC_ALPHA;
  }
  if (p === THREE.OneMinusSrcAlphaFactor) {
    return gl.ONE_MINUS_SRC_ALPHA;
  }
  if (p === THREE.DstAlphaFactor) {
    return gl.DST_ALPHA;
  }
  if (p === THREE.OneMinusDstAlphaFactor) {
    return gl.ONE_MINUS_DST_ALPHA;
  }

  if (p === THREE.DstColorFactor) {
    return gl.DST_COLOR;
  }
  if (p === THREE.OneMinusDstColorFactor) {
    return gl.ONE_MINUS_DST_COLOR;
  }
  if (p === THREE.SrcAlphaSaturateFactor) {
    return gl.SRC_ALPHA_SATURATE;
  }

  return 0;
};

export const paramToArrayStorage = function (type) {
  switch (type) {
    case THREE.UnsignedByteType:
      return Uint8Array;
    case THREE.ByteType:
      return Int8Array;
    case THREE.ShortType:
      return Int16Array;
    case THREE.UnsignedShortType:
      return Uint16Array;
    case THREE.IntType:
      return Int32Array;
    case THREE.UnsignedIntType:
      return Uint32Array;
    case THREE.FloatType:
      return Float32Array;
  }
};

export const swizzleToEulerOrder = (swizzle) =>
  swizzle.map((i) => ["", "X", "Y", "Z"][i]).join("");

export const transformComposer = function () {
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const transform = new THREE.Matrix4();

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
