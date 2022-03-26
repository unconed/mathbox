declare var _default: "uniform float subdivideBevel;\n\n// External\nvec4 sampleData(vec4 xyzw);\n\nvec4 subdivideDepth(vec4 xyzw) {\n  float x = xyzw.z;\n  float i = floor(x);\n  float f = x - i;\n\n  float minf = subdivideBevel * min(f, 1.0 - f);\n  float g = (f > 0.5) ? 1.0 - minf : (f < 0.5) ? minf : 0.5;\n\n  return sampleData(vec4(xyzw.xy, i + g, xyzw.w));\n}\n";
export default _default;
