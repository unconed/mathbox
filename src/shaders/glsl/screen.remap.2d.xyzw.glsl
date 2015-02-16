uniform vec2 remap2DScale;

vec4 screenRemap2Dxyzw(vec2 uv) {
  return vec4(floor(remap2DScale * uv), 0.0, 0.0);
}
