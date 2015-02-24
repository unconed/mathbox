varying float vPixelSize;

float getGenericAlpha(float mask) {
  return vPixelSize * 2.0 * (1.0 - mask);
}
