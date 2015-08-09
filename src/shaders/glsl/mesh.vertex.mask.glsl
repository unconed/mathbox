attribute vec4 position4;
uniform vec4 geometryResolution;
varying float vMask;

// External
float getSample(vec4 xyzw);

void maskLevel() {
  vMask = getSample(position4 * geometryResolution);
}
