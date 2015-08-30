uniform vec4 remapSTPQScale;

vec4 screenMapSTPQ(vec4 xyzw, out vec4 stpq) {
  stpq = xyzw * remapSTPQScale;
  return xyzw;
}
