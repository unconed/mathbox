varying float vPixelSize;

float getCircleMask(vec2 uv) {
  return dot(uv, uv);
}
