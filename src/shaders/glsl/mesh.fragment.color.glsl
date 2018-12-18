varying vec4 vColor;

vec4 getColor() {
  if (vColor.a <= 0.0) discard;
  return vColor;
}
