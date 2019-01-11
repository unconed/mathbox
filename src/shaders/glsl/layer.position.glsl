uniform vec4 layerScale;
uniform vec4 layerBias;

#define PROJECT_ORTHOGONAL

vec4 layerPosition(vec4 position, inout vec4 stpq) {
  return layerScale * position + layerBias;
}
