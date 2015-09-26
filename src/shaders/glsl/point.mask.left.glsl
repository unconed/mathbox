varying float vPixelSize;

float getTriangleLeftMask(vec2 uv) {
  uv.x += .25;
  return max(uv.x, abs(uv.y) * .866 - uv.x * .5 + .6);
}
