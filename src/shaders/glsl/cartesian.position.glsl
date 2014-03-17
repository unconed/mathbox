uniform mat4 cartesianMatrix;

vec4 getCartesianPosition(vec4 position) {
  return cartesianMatrix * vec4(position.xyz, 1.0);
}
