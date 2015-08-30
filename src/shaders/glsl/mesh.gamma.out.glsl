vec4 getGammaOutColor(vec4 rgba) {
  return vec4(sqrt(rgba.rgb), rgba.a);
}
