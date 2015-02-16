varying vec2 vSprite;

float getSpriteMask(vec2 xy);
float getSpriteAlpha(float mask);

void setFragmentColorFill(vec4 color) {
  float mask = getSpriteMask(vSprite);
  if (mask > 1.0) {
    discard;
  }
  float alpha = getSpriteAlpha(mask);
  if (alpha >= 1.0) {
    discard;
  }
  gl_FragColor = vec4(color.rgb, alpha * color.a);
}
