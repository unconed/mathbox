uniform vec4 scaleAxis;

vec4 sampleData(float x);

vec4 getScalePosition(vec4 xyzw) {
  return scaleAxis * sampleData(xyzw.x).x;
}
