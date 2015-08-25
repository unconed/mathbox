uniform vec4 remap4DScale;

vec4 screenRemap4Dstpq(vec4 xyzw, out vec4 stpq) {
  stpq = xyzw * remap4DScale;
  return xyzw;
}
