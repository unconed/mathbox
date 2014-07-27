uniform vec2 remap4DScale;

vec4 screenRemap4D(vec2 uv) {
  return vec4(remap4DScale * uv - vec2(.5), 0.0, 0.0);
}
