uniform vec2 spriteOffset;
uniform float spriteScale;
uniform float spriteDepth;
uniform float spriteSnap;

uniform vec2 renderOdd;
uniform float renderScale;
uniform float renderScaleInv;
uniform float pixelUnit;
uniform float focusDepth;

uniform vec4 geometryClip;
attribute vec4 position4;
attribute vec2 sprite;

varying float vPixelSize;

// External
vec3 getPosition(vec4 xyzw, float canonical);
vec4 getSprite(vec4 xyzw);

vec3 getSpritePosition() {
  // Clip points
  vec4 p = min(geometryClip, position4);
  float diff = length(position4 - p);
  if (diff > 0.0) {
    return vec3(0.0, 0.0, 1000.0);
  }

  // Make sprites
  vec3 center = getPosition(p, 1.0);
  vec4 atlas = getSprite(p);

  // Sprite goes from -1..1, width = 2.
  // -1..1 -> -0.5..0.5
  vec2 halfSprite = sprite * .5;
  vec2 halfFlipSprite = vec2(halfSprite.x, -halfSprite.y);

#ifdef POSITION_UV
  // Assign UVs
  vUV = atlas.xy + atlas.zw * (halfFlipSprite + .5);
#endif

  // Depth blending
  // TODO: orthographic camera
  // Workaround: set depth = 0
  float depth = focusDepth, z;
  z = -center.z;
  if (spriteDepth < 1.0) {
    depth = mix(z, focusDepth, spriteDepth);
  }
  
  // Match device/unit mapping 
  float size = pixelUnit * spriteScale;
  float depthSize = depth * size;

  // Calculate pixelSize for anti-aliasing
  float pixelSize = (spriteDepth > 0.0 ? depthSize / z : size);
  vPixelSize = pixelSize;

  // Position sprite
  vec2 atlasOdd = fract(atlas.zw / 2.0);
  vec2 offset = (spriteOffset + halfSprite * atlas.zw) * depthSize;
  if (spriteSnap > 0.5) {
    // Snap to pixel (w/ epsilon shift to avoid jitter)
    return vec3(((floor(center.xy / center.z * renderScale + 0.001) + renderOdd + atlasOdd) * center.z + offset) * renderScaleInv, center.z);
  }
  else {
    // Place directly
    return center + vec3(offset * renderScaleInv, 0.0);
  }

}
