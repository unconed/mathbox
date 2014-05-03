uniform vec4 axisStep;
uniform vec4 axisPosition;

vec4 getAxisPosition(vec4 xyzi) {
  return axisStep * xyzi.w + axisPosition;
}
