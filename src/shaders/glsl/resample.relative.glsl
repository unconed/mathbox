uniform vec4 resampleFactor;

vec4 resampleRelative(vec4 xyzw) {
  return xyzw * resampleFactor;
}