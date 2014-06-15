uniform vec4 splitModulus;

vec4 getJoinXYZW(vec4 xyzw) {
  vec4 base = mod(xyzw, repeatModulus);
  vec3 offset = floor(xyzw / repeatModulus).wxy;
}
