declare var _default: "uniform float splitStride;\n\nvec2 getIndices(vec4 xyzw);\nvec4 getRest(vec4 xyzw);\nvec4 injectIndex(float v);\n\nvec4 getSplitXYZW(vec4 xyzw) {\n  vec2 uv = getIndices(xyzw);\n  float offset = uv.x + uv.y * splitStride;\n  return injectIndex(offset) + getRest(xyzw);\n}\n";
export default _default;
