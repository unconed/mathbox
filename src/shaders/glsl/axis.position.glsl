uniform vec4 axisStep;
uniform vec4 axisPosition;

vec4 getAxisPosition(vec4 xyzw, inout vec4 stpq) {
  return axisStep * xyzw.x + axisPosition;
}
