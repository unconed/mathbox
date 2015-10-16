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

vec4 getSample(vec4 rgba, vec4 stpq);

vec4 getMaterialColor(vec4 rgba) {
  vec4 stpq = vec4(0.0);

  #ifdef POSITION_U
  stpq.x = vU;
  #endif
  #ifdef POSITION_UV
  stpq.xy = vUV;
  #endif
  #ifdef POSITION_UVW
  stpq.xyz = vUVW;
  #endif
  #ifdef POSITION_UVWO
  stpq = vUVWO;
  #endif

  #ifdef POSITION_STPQ
  stpq = vSTPQ;
  #endif

  return getSample(rgba, stpq);
}
