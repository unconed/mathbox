uniform float pointSize;
uniform float pointDepth;

uniform float pixelUnit;
uniform float renderScale;
uniform float renderScaleInv;

attribute vec4 position4;
attribute vec2 sprite;

varying vec2 vSprite;
varying float vPixelSize;

// External
vec3 getPosition(vec4 xyzw);

vec3 getPointPosition() {
  vec3 center = getPosition(position4);

  // Depth blending
  // TODO: orthographic camera
  // Workaround: set depth = 0
  float z = -center.z;
  float depth = mix(z, 1.0, pointDepth);
  
  // Match device/unit mapping 
  // Sprite goes from -1..1, width = 2.
  float size = pointSize * pixelUnit * .5;
  float depthSize = depth * size;
  
  // Pad sprite by half a pixel to make the anti-aliasing straddle the pixel edge
  // Note: pixelsize measures radius
  float pixelSize = .5 * (pointDepth > 0.0 ? depthSize / z : size);
  float paddedSize = pixelSize + 0.5;
  float padFactor = paddedSize / pixelSize;

  vPixelSize = paddedSize;
  vSprite    = sprite;

  return center + vec3(sprite * depthSize * renderScaleInv * padFactor, 0.0);
}
