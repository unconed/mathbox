varying float vMask;

float smoothStepper(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

vec4 maskColor() {
  if (vMask <= 0.0) discard;
  return vec4(1.0, 1.0, 1.0, smoothStepper(vMask));
}
