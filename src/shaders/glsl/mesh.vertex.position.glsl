uniform vec4 geometryResolution;

#ifdef POSITION_STPQ
varying vec4 vSTPQ;
#endif
#ifdef POSITION_U
varying float vU;
#endif
#ifdef POSITION_UV
varying vec2 vUV;
#endif
#ifdef POSITION_UVW
varying vec3 vUVW;
#endif
#ifdef POSITION_UVWO
varying vec4 vUVWO;
#endif

// External
vec3 getPosition(vec4 xyzw, vec4 stpq);

vec3 getMeshPosition(vec4 xyzw, float canonical) {
  vec4 stpq = xyzw * geometryResolution;
  vec3 xyz = getPosition(xyzw, stpq);

  #ifdef POSITION_MAP
  if (canonical > 0.5) {
    #ifdef POSITION_STPQ
    vSTPQ = stpq;
    #endif
    #ifdef POSITION_U
    vU = stpq.x;
    #endif
    #ifdef POSITION_UV
    vUV = stpq.xy;
    #endif
    #ifdef POSITION_UVW
    vUVW = stpq.xyz;
    #endif
    #ifdef POSITION_UVWO
    vUVWO = stpq;
    #endif
  }
  #endif
  return xyz;
}
