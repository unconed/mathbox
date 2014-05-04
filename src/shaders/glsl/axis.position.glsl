uniform vec4 axisStep;
uniform vec4 axisPosition;

vec4 getAxisPosition(vec4 xyzw) {
  return axisStep * xyzw.w + axisPosition;
}
