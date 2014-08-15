attribute vec4 position4;
varying vec4 vColor;

// External
vec4 getSample(vec4 xyzw);

void vertexColor() {
  vColor = getSample(position4);
}
