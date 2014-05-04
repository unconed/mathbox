attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw);

vec3 getSurfacePosition() {
  return getPosition(position4);
}
