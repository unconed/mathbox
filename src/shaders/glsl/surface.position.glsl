// External
vec3 getPosition(vec2 xy);

vec3 getSurfacePosition() {
  return getPosition(position.xy);
}
