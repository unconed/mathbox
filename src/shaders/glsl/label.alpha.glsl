varying float vPixelSize;

vec4 getLabelAlphaColor(vec4 sample, vec4 color) {
  float mask = clamp(sample.r * 1000.0, 0.0, 1.0);
  float alpha = (sample.r - .5) * vPixelSize + .5;
  float a = mask * alpha * color.a;
  if (a <= 0.0) discard;
  return vec4(color.xyz, a);
}
