uniform vec4 axisStep;
uniform vec4 axisPosition;

vec4 getAxisPosition(vec2 uv) {
  return axisStep * uv.x + axisPosition;
}
