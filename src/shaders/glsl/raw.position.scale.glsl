uniform vec4 geometryScale;
attribute vec4 position4;

vec4 getRawPositionScale() {
  return geometryScale * position4;
}
