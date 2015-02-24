varying vec2 vSprite;

vec4 getSample(vec2 xy);

vec4 getSpriteColor() {
  return getSample(vSprite);
}