uniform vec4 gridPosition;
uniform vec4 gridStep;
uniform vec4 gridAxis;

vec4 sampleData(vec2 xy);

vec4 getGridPosition(vec2 uv) {
  vec4 onAxis  = gridAxis * sampleData(vec2(uv.y, 0.0));
  vec4 offAxis = gridStep * uv.x + gridPosition;
  return onAxis + offAxis;
}
