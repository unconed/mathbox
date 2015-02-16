varying float vPixelSize;

float getSquareMask(vec2 uv) {
  vec2 a = abs(uv);
  return max(a.x, a.y);
}
