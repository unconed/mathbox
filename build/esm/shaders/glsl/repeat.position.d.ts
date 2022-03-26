declare var _default: "uniform vec4 repeatModulus;\n\nvec4 getRepeatXYZW(vec4 xyzw) {\n  return mod(xyzw + .5, repeatModulus) - .5;\n}\n";
export default _default;
