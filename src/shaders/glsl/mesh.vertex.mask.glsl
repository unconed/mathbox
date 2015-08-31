attribute vec4 position4;
uniform vec4 geometryResolution;
uniform vec4 geometryClip;
varying float vMask;

// External
float getSample(vec4 xyzw);

void maskLevel() {
  vec4 p = min(geometryClip, position4);
  vMask = getSample(p * geometryResolution);
}
