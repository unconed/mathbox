attribute vec4 position4;
uniform vec4 geometryResolution;
varying vec4 vMapSTPQ;

void mapVarying() {
  vMapSTPQ = position4 * geometryResolution;
}
