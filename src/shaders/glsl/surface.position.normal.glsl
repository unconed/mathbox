uniform vec4 mapSize;
uniform vec4 geometryResolution;
uniform vec4 geometryClip;
attribute vec4 position4;

// External
vec3 getPosition(vec4 xyzw, float canonical);
vec3 getNormal(vec4 xyzw);

varying vec3 vNormal;
varying vec3 vLight;
varying vec3 vPosition;

vec3 getSurfacePositionNormal() {

  vec4 p = min(geometryClip, position4);
#ifdef SURFACE_CLOSED_X
  if (p.x == geometryClip.x) p.x = 0.0;
#endif
#ifdef SURFACE_CLOSED_Y
  if (p.y == geometryClip.y) p.y = 0.0;
#endif

  vec3 center = getPosition(p, 1.0);
  vNormal   = normalMatrix * normalize(getNormal(p));
  vLight    = normalize((viewMatrix * vec4(1.0, 2.0, 2.0, 0.0)).xyz); // hardcoded directional light
  vPosition = -center;

#ifdef POSITION_UV
#ifdef POSITION_UV_INT
  vUV = -.5 + (position4.xy * geometryResolution.xy) * mapSize.xy;
#else
  vUV = position4.xy * geometryResolution.xy;
#endif
#endif
  
  return center;
}
