varying vec4 vColor;

vec4 blendColor(vec4 rgba) {
  if (vColor.a <= 0.0) discard;
  return rgba * vColor;
}
