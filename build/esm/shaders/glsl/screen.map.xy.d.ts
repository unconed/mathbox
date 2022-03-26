declare var _default: "uniform vec2 remapUVScale;\n\nvec4 screenMapXY(vec4 uvwo, vec4 stpq) {\n  return vec4(floor(remapUVScale * uvwo.xy), 0.0, 0.0);\n}\n";
export default _default;
