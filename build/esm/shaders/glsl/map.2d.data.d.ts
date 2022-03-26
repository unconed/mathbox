declare var _default: "uniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 map2DData(vec2 xy) {\n  return (xy + dataPointer) * dataResolution;\n}\n";
export default _default;
