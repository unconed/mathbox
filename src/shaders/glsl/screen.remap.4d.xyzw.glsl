uniform vec2 remap2DScale;
uniform vec2 remapModulus;
uniform vec2 remapModulusInv;

vec4 screenRemap4Dxyzw(vec2 uv) {
  vec2 st = floor(remap2DScale * uv);
  vec2 xy = st * remapModulusInv;
  vec2 ixy = floor(xy);
  vec2 fxy = xy - ixy;
  vec2 zw = fxy * remapModulus;
  return vec4(ixy.x, zw.y, ixy.y, zw.x);
}
