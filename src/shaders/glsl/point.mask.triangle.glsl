varying float vPixelSize;

float getTriangleMask(vec2 uv) {
  uv.y -= .25;
  return max(-uv.y, abs(uv.x) * .866 + uv.y * .5 + .6);
}
