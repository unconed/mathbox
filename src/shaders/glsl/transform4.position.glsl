uniform mat4 transformMatrix;
uniform vec4 transformOffset;

vec4 transformPosition(vec4 position) {
  return transformMatrix * position + transformOffset;
}
