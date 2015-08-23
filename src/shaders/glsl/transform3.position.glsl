uniform mat4 transformMatrix;

vec4 transformPosition(vec4 position, inout vec4 stpq) {
  return transformMatrix * vec4(position.xyz, 1.0);
}
