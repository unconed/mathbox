declare var _default: "uniform vec4 resampleBias;\n\nvec4 resamplePadding(vec4 xyzw) {\n  return xyzw + resampleBias;\n}";
export default _default;
