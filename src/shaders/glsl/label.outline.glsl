uniform vec3 outlineColor;

vec4 getLabelOutlineColor(vec4 sample, vec4 color) {
  float opacity = sample.g * color.a;
  vec3  blend   = mix(outlineColor, color.xyz, sample.r);
  return vec4(blend, opacity);
}
