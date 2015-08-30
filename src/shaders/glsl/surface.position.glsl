uniform vec4 geometryClip;
uniform vec4 geometryResolution;
uniform vec4 mapSize;

attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw, float canonical);

vec3 getSurfacePosition() {
  vec4 p = min(geometryClip, position4);
  vec3 xyz = getPosition(p, 1.0);

  // Overwrite UVs
#ifdef POSITION_UV
#ifdef POSITION_UV_INT
  vUV = -.5 + (position4.xy * geometryResolution.xy) * mapSize.xy;
#else
  vUV = position4.xy * geometryResolution.xy;
#endif
#endif

  return xyz;
}
