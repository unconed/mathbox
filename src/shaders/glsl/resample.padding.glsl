uniform vec4 resampleBias;

vec4 resamplePadding(vec4 xyzw) {
  return xyzw + resampleBias;
}