uniform mat4 objectMatrix;
uniform vec2 object4D;

vec4 getObject4Position(vec4 position) {
  vec3 xyz = (objectMatrix * vec4(position.xyz, 1.0)).xyz;
  return vec4(xyz, position.w * object4D.y + object4D.x);
}
