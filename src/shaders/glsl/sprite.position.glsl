uniform float renderInvScale;

attribute vec4 position4;
attribute vec2 sprite;

varying vec2 vSprite;

// External
vec3 getPosition(vec4 xyzw);
vec4 getSprite(vec4 xyzw);

vec3 getSpritePosition() {
  vec3 center = getPosition(position4);
  vec4 offset = getSprite(position4);

  vec2 halfSprite = sprite * .5;

  offset.zw -= 1.0;
  vSprite = offset.xy + offset.zw * (halfSprite + .5);
  halfSprite.y = -halfSprite.y;

  return center + vec3(halfSprite * offset.zw * renderInvScale, 0.0);
}
