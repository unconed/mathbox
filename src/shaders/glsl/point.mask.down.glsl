varying float vPixelSize;

float getTriangleDownMask(vec2 uv) {
  uv.y += .25;
  return max(uv.y, abs(uv.x) * .866 - uv.y * .5 + .6);
}
