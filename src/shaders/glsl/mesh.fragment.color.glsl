varying vec4 vColor;

vec4 getColor(vec4 rgba) {
  return rgba * vColor;
}
