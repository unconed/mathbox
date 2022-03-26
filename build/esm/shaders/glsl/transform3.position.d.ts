declare var _default: "uniform mat4 transformMatrix;\n\nvec4 transformPosition(vec4 position, inout vec4 stpq) {\n  return transformMatrix * vec4(position.xyz, 1.0);\n}\n";
export default _default;
