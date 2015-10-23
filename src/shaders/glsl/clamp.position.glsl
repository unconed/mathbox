uniform vec4 clampLimit;

vec4 getClampXYZW(vec4 xyzw) {
  return clamp(xyzw, vec4(0.0), clampLimit);
}
