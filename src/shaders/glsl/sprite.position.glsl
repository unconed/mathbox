uniform float pointSize;

attribute vec4 position4;
attribute vec2 sprite;

varying vec2 vSprite;

// External
vec3 getPosition(vec4 xyzw);

vec3 getPointPosition() {
  vSprite = sprite;
  return getPosition(position4) + vec3(sprite * pointSize, 0.0);
}
