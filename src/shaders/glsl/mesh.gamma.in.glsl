vec4 getGammaInColor(vec4 rgba) {
  return vec4(rgba.rgb * rgba.rgb, rgba.a);
}
