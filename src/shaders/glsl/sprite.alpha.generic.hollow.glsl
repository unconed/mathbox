varying float vPixelSize;

float getGenericHollowAlpha(float mask) {
  return vPixelSize * (0.5 - 2.0 * abs(mask - .75));
}
