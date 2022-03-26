declare var _default: "varying float vMask;\n\nfloat ease(float t) {\n  t = clamp(t, 0.0, 1.0);\n  return t * t * (3.0 - 2.0 * t);\n}\n\nvec4 maskColor() {\n  if (vMask <= 0.0) discard;\n  return vec4(vec3(1.0), ease(vMask));\n}\n";
export default _default;
