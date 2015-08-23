uniform vec4 basisScale;
uniform vec4 basisOffset;
uniform vec4 viewScale;
uniform vec4 viewOffset;

vec4 getCartesian4Position(vec4 position, inout vec4 stpq) {
  return position * basisScale + basisOffset;
}
