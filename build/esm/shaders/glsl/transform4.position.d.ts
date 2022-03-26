declare var _default: "uniform mat4 transformMatrix;\nuniform vec4 transformOffset;\n\nvec4 transformPosition(vec4 position, inout vec4 stpq) {\n  return transformMatrix * position + transformOffset;\n}\n";
export default _default;
