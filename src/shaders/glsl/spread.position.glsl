uniform vec4 spreadOffset;
uniform mat4 spreadMatrix;

// External
vec4 getValue(vec4 xyzw);

vec4 getSpreadValue(vec4 xyzw) {
  vec4 sample = getValue(xyzw);
  return sample + spreadMatrix * (spreadOffset + xyzw);
}
