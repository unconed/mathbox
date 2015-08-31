attribute vec4 position4;
uniform vec4 geometryClip;
varying vec4 vColor;

// External
vec4 getSample(vec4 xyzw);

void vertexColor() {
  vec4 p = min(geometryClip, position4);
  vColor = getSample(p);
}
