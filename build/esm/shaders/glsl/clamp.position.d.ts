declare var _default: "uniform vec4 clampLimit;\n\nvec4 getClampXYZW(vec4 xyzw) {\n  return clamp(xyzw, vec4(0.0), clampLimit);\n}\n";
export default _default;
