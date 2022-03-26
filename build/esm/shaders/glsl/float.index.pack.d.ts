declare var _default: "uniform vec4 indexModulus;\n\nvec4 getSample(vec4 xyzw);\nvec4 getIndex(vec4 xyzw);\n\nvec4 floatPackIndex(vec4 xyzw) {\n  vec4 value = getSample(xyzw);\n  vec4 index = getIndex(xyzw);\n\n  vec4 offset = floor(index + .5) * indexModulus;\n  vec2 sum2 = offset.xy + offset.zw;\n  float sum = sum2.x + sum2.y;\n  return vec4(value.xyz, sum);\n}";
export default _default;
