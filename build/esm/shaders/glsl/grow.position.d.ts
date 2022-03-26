declare var _default: "uniform float growScale;\nuniform vec4  growMask;\nuniform vec4  growAnchor;\n\nvec4 getSample(vec4 xyzw);\n\nvec4 getGrowSample(vec4 xyzw) {\n  vec4 anchor = xyzw * growMask + growAnchor;\n\n  vec4 position = getSample(xyzw);\n  vec4 center = getSample(anchor);\n\n  return mix(center, position, growScale);\n}";
export default _default;
