uniform float transitionEnter;
uniform float transitionExit;
uniform vec4  transitionScale;
uniform vec4  transitionBias;
uniform float transitionSkew;
uniform float transitionActive;

float getTransitionSDFMask(vec4 stpq) {
  if (transitionActive < 0.5) return 1.0;

  float enter   = transitionEnter;
  float exit    = transitionExit;
  float skew    = transitionSkew;
  vec4  scale   = transitionScale;
  vec4  bias    = transitionBias;

  float factor  = 1.0 + skew;
  float offset  = dot(vec4(1.0), stpq * scale + bias);

  float d1 = enter * factor - offset;
  float d2 = exit  * factor + offset - skew;

  return min(d1, d2);
}