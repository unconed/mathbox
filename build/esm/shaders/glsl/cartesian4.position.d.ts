declare var _default: "uniform vec4 basisScale;\nuniform vec4 basisOffset;\nuniform vec4 viewScale;\nuniform vec4 viewOffset;\n\nvec4 getCartesian4Position(vec4 position, inout vec4 stpq) {\n  return position * basisScale + basisOffset;\n}\n";
export default _default;
