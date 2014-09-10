varying float vPixelSize;

float getCircleAlpha(float mask) {
  // Approximation: 1 - x*x is approximately linear around x = 1 with slope 2
  return vPixelSize * (1.0 - mask);
  //  return vPixelSize * 0.5 * (1.0 - sqrt(mask));
}
