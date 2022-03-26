declare var _default: "uniform vec4 axisStep;\nuniform vec4 axisPosition;\n\nvec4 getAxisPosition(vec4 xyzw, inout vec4 stpq) {\n  return axisStep * xyzw.x + axisPosition;\n}\n";
export default _default;
