uniform float pointDepth;

uniform float pixelUnit;
uniform float renderScale;
uniform float renderScaleInv;
uniform float focusDepth;

uniform vec4 geometryClip;
attribute vec4 position4;
attribute vec2 sprite;

varying vec2 vSprite;
varying float vPixelSize;

const float pointScale = POINT_SHAPE_SCALE;

// External
float getPointSize(vec4 xyzw);
vec3 getPosition(vec4 xyzw, float canonical);

vec3 getPointPosition() {
  vec4 p = min(geometryClip, position4);
  vec3 center = getPosition(p, 1.0);

  // Depth blending
  // TODO: orthographic camera
  // Workaround: set depth = 0
  float z = -center.z;
  float depth = mix(z, focusDepth, pointDepth);
  
  // Match device/unit mapping 
  // Sprite goes from -1..1, width = 2.
  float pointSize = getPointSize(p);
  float size = pointScale * pointSize * pixelUnit * .5;
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
