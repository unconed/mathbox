uniform float transitionEnter;
uniform float transitionExit;
uniform vec4  transitionScale;
uniform vec4  transitionBias;
uniform float transitionSkew;
uniform float transitionActive;

uniform vec4  moveFrom;
uniform vec4  moveTo;

float ease(float t) {
  t = clamp(t, 0.0, 1.0);
  return 1.0 - (2.0 - t) * t;
}

vec4 getTransitionPosition(vec4 xyzw, inout vec4 stpq) {
  if (transitionActive < 0.5) return xyzw;

  float enter   = transitionEnter;
  float exit    = transitionExit;
  float skew    = transitionSkew;
  vec4  scale   = transitionScale;
  vec4  bias    = transitionBias;

  float factor  = 1.0 + skew;
  float offset  = dot(vec4(1.0), stpq * scale + bias);

  float a1 = ease(enter * factor - offset);
  float a2 = ease(exit  * factor + offset - skew);

  return xyzw + a1 * moveFrom + a2 * moveTo;
}