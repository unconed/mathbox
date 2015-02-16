attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw);

vec3 getFacePosition() {
  return getPosition(position4);
}
