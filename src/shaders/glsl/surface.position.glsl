uniform vec4 geometryClip;
uniform vec4 geometryResolution;
attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw);

vec3 getSurfacePosition() {
  vec4 p = min(geometryClip, position4);
  return getPosition(p);
}
