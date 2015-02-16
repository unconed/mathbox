varying float vPixelSize;

float getDiscAlpha(float mask) {
  // Approximation: 1 - x*x is approximately linear around x = 1 with slope 2
  return vPixelSize * (1.0 - mask);
  //  return vPixelSize * 2.0 * (1.0 - sqrt(mask));
}
