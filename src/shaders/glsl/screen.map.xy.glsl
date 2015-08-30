uniform vec2 remapUVScale;

vec4 screenMapXY(vec4 uvwo, vec4 stpq) {
  return vec4(floor(remapUVScale * uvwo.xy), 0.0, 0.0);
}
