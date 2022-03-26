declare var _default: "uniform vec4 layerScale;\nuniform vec4 layerBias;\n\nvec4 layerPosition(vec4 position, inout vec4 stpq) {\n  return layerScale * position + layerBias;\n}\n";
export default _default;
