uniform float splitStride;

vec2 getIndices(vec4 xyzw);
vec4 getRest(vec4 xyzw);
vec4 injectIndex(float v);

vec4 getSplitXYZW(vec4 xyzw) {
  vec2 uv = getIndices(xyzw);
  float offset = uv.x + uv.y * splitStride;
  return injectIndex(offset) + getRest(xyzw);
}
