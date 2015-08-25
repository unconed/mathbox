uniform vec4 sliceOffset;

vec4 getSliceOffset(vec4 xyzw) {
  return xyzw + sliceOffset;
}
