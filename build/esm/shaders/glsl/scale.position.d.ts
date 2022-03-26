declare var _default: "uniform vec4 scaleAxis;\nuniform vec4 scaleOffset;\n\nvec4 sampleData(float x);\n\nvec4 getScalePosition(vec4 xyzw) {\n  return scaleAxis * sampleData(xyzw.x).x + scaleOffset;\n}\n";
export default _default;
