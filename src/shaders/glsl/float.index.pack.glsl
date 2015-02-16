uniform vec4 indexModulus;

vec4 getSample(vec4 xyzw);
vec4 getIndex(vec4 xyzw);

vec4 floatPackIndex(vec4 xyzw) {
  vec4 value = getSample(xyzw);
  vec4 index = getIndex(xyzw);

  vec4 offset = floor(index + .5) * indexModulus;
  vec2 sum2 = offset.xy + offset.zw;
  float sum = sum2.x + sum2.y;
  return vec4(value.xyz, sum);
}