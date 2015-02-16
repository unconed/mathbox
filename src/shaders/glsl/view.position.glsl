// Implicit three.js uniform
// uniform mat4 viewMatrix;

vec4 getViewPosition(vec4 position) {
  return (viewMatrix * vec4(position.xyz, 1.0));
}