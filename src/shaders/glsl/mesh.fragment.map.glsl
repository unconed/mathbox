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

vec4 getSample(vec4 uvwo, vec4 stpq);

vec4 getMapColor() {
  #ifdef POSITION_STPQ
  vec4 stpq = vSTPQ;
  #else
  vec4 stpq = vec4(0.0);
  #endif

  #ifdef POSITION_U
  vec4 uvwo = vec4(vU, 0.0, 0.0, 0.0);
  #endif
  #ifdef POSITION_UV
  vec4 uvwo = vec4(vUV, 0.0, 0.0);
  #endif
  #ifdef POSITION_UVW
  vec4 uvwo = vec4(vUVW, 0.0);
  #endif
  #ifdef POSITION_UVWO
  vec4 uvwo = vec4(vUVWO);
  #endif

  return getSample(uvwo, stpq);
}
