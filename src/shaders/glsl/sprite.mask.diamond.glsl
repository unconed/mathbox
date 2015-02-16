varying float vPixelSize;

float getDiamondMask(vec2 uv) {
  vec2 a = abs(uv);
  return a.x + a.y;
}
