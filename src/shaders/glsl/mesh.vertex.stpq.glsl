uniform vec4 geometryResolution;

// External
vec3 getPosition(vec4 xyzw, vec4 stpq);

vec3 getMeshPosition(vec4 xyzw) {
  return getPosition(xyzw, xyzw * geometryResolution);
}
