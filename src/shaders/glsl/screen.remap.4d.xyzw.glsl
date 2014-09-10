uniform vec2 remap2DScale;
uniform vec2 remapModulus;

vec4 screenRemap4Dxyzw(vec2 uv) {
  return vec4(remap2DScale * uv - vec2(.5), 0.0, 0.0);
}
