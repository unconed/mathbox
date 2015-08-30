uniform vec2 remapUVScale;
uniform vec2 remapModulus;
uniform vec2 remapModulusInv;

vec4 screenMapXYZW(vec4 uvwo, vec4 stpq) {
  vec2 st = floor(remapUVScale * uvwo.xy);
  vec2 xy = st * remapModulusInv;
  vec2 ixy = floor(xy);
  vec2 fxy = xy - ixy;
  vec2 zw = fxy * remapModulus;
  return vec4(ixy.x, zw.y, ixy.y, zw.x);
}
