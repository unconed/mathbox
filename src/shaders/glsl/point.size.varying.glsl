uniform float pointSize;

vec4 getSample(vec4 xyzw);

float getPointSize(vec4 xyzw) {
  return pointSize * getSample(xyzw).x;
}