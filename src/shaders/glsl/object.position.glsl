uniform mat4 objectMatrix;

vec4 getObjectPosition(vec4 position) {
  return objectMatrix * vec4(position.xyz, 1.0);
}
