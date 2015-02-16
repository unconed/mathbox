uniform mat4 transformMatrix;

vec4 transformPosition(vec4 position) {
  return transformMatrix * vec4(position.xyz, 1.0);
}
