uniform vec4 repeatModulus;

vec4 getRepeatXYZW(vec4 xyzw) {
  return mod(xyzw, repeatModulus);
}
