varying vec4 vColor;

vec4 blendColor(vec4 rgba) {
  return rgba * vColor;
}
