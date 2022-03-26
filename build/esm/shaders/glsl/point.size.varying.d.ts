declare var _default: "uniform float pointSize;\n\nvec4 getSample(vec4 xyzw);\n\nfloat getPointSize(vec4 xyzw) {\n  return pointSize * getSample(xyzw).x;\n}";
export default _default;
