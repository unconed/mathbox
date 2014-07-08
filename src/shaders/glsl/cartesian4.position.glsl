uniform vec4 basisScale;
uniform vec4 basisOffset;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

vec4 getCartesian4Position(vec4 position) {
  vec4 pos4 = position * basisScale - basisOffset;
  vec3 pos3 = (projectionMatrix * pos4).xyz;
  return viewMatrix * vec4(pos3, 1.0);
}
