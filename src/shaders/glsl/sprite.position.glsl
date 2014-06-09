uniform float pointSize;
uniform float renderScale;

attribute vec4 position4;
attribute vec2 sprite;

varying vec2 vSprite;
varying float vPixelSize;

// External
vec3 getPosition(vec4 xyzw);

vec3 getPointPosition() {
  vec3 center = getPosition(position4);

  float pixelSize = renderScale * pointSize / -center.z;
  float paddedSize = pixelSize + 0.5;
  float padFactor = paddedSize / pixelSize;

  vPixelSize = paddedSize;
  vSprite    = sprite;

  return center + vec3(sprite * pointSize * padFactor, 0.0);
}
