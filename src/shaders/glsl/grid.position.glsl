uniform vec4 gridPosition;
uniform vec4 gridStep;
uniform vec4 gridAxis;

vec4 sampleData(vec2 xy);

vec4 getGridPosition(vec4 xyzi) {
  vec4 onAxis  = gridAxis * sampleData(vec2(xyzi.w, 0.0)).x;
  vec4 offAxis = gridStep * xyzi.y + gridPosition;
  return onAxis + offAxis;
}
