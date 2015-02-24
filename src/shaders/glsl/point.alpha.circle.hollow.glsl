varying float vPixelSize;

float getDiscHollowAlpha(float mask) {
  return vPixelSize * (0.5 - 2.0 * abs(sqrt(mask) - .75));
}
