uniform mat4 transformMatrix;
uniform vec4 transformOffset;

vec4 transformPosition(vec4 position, inout vec4 stpq) {
  return transformMatrix * position + transformOffset;
}
