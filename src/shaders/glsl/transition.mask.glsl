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

  vec2 d = vec2(enter, exit) * factor + vec2(-offset, offset - skew);
  if (exit  == 1.0) return d.x;
  if (enter == 1.0) return d.y;
  return min(d.x, d.y);
}