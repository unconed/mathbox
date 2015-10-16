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
vec3 getPosition(vec4 xyzw, in vec4 stpqIn, out vec4 stpqOut);

vec3 getMeshPosition(vec4 xyzw, float canonical) {
  vec4 stpqOut, stpqIn = xyzw * geometryResolution;
  vec3 xyz = getPosition(xyzw, stpqIn, stpqOut);

  #ifdef POSITION_MAP
  if (canonical > 0.5) {
    #ifdef POSITION_STPQ
    vSTPQ = stpqOut;
    #endif
    #ifdef POSITION_U
    vU = stpqOut.x;
    #endif
    #ifdef POSITION_UV
    vUV = stpqOut.xy;
    #endif
    #ifdef POSITION_UVW
    vUVW = stpqOut.xyz;
    #endif
    #ifdef POSITION_UVWO
    vUVWO = stpqOut;
    #endif
  }
  #endif
  return xyz;
}
