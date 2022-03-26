declare var _default: "uniform mat4 viewMatrix;\n\nvec4 getCartesianPosition(vec4 position, inout vec4 stpq) {\n  return viewMatrix * vec4(position.xyz, 1.0);\n}\n";
export default _default;
