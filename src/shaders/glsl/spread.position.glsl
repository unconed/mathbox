uniform vec4 spreadOffset;
uniform mat4 spreadMatrix;

// External
vec4 getSample(vec4 xyzw);

vec4 getSpreadSample(vec4 xyzw) {
  vec4 sample = getSample(xyzw);
  return sample + spreadMatrix * (spreadOffset + xyzw);
}
