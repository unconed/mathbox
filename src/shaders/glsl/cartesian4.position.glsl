uniform vec4 basisScale;
uniform vec4 basisOffset;
uniform mat4 viewMatrix;
uniform vec2 view4D;

vec4 getCartesian4Position(vec4 position) {
  vec4 pos4 = position * basisScale - basisOffset;
  vec3 xyz = (viewMatrix * vec4(pos4.xyz, 1.0)).xyz;
  return vec4(xyz, pos4.w * view4D.y + view4D.x);
}
