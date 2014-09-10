uniform vec2 remap2DScale;

vec4 screenRemap2Dxyzw(vec2 uv) {
  return vec4(remap2DScale * uv - vec2(.5), 0.0, 0.0);
}
