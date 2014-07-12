uniform mat4 projectionMatrix;

vec4 getProject4Position(vec4 position) {
  vec3 pos3 = (projectionMatrix * position).xyz;
  return vec4(pos3, 1.0);
}
