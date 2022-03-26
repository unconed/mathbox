declare var _default: "uniform vec4 remapSTPQScale;\n\nvec4 screenMapSTPQ(vec4 xyzw, out vec4 stpq) {\n  stpq = xyzw * remapSTPQScale;\n  return xyzw;\n}\n";
export default _default;
