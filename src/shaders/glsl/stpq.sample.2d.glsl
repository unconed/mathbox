varying vec2 vST;

vec4 getSample(vec2 st);

vec4 getSTSample() {
  return getSample(vST);
}
