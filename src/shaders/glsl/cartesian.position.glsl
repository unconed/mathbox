uniform mat4 viewMatrix;

vec4 getCartesianPosition(vec4 position) {
  return viewMatrix * vec4(position.xyz, 1.0);
}
