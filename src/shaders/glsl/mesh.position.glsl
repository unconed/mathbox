uniform vec4 geometryClip;
attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw, float canonical);

vec3 getMeshPosition() {
  vec4 p = min(geometryClip, position4);
  return getPosition(p, 1.0);
}
