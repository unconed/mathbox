vec4 getLabelColor(vec4 sample, vec4 color) {
  float opacity = sample.g * color.a;
  return vec4(color.xyz, opacity);
//return vec4(sample.rg, 0.0, 1.0);
}
