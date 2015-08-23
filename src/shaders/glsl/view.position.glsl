// Implicit three.js uniform
// uniform mat4 viewMatrix;

vec4 getViewPosition(vec4 position, inout vec4 stpq) {
  return (viewMatrix * vec4(position.xyz, 1.0));
}
