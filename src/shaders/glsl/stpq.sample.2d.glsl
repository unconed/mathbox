varying vec4 vSTPQ;

vec4 getSample(vec2 st);

vec4 getSTPQSample() {
  return getSample(vSTPQ.st);
}
