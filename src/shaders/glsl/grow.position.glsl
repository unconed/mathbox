uniform float growScale;
uniform vec4  growMask;
uniform vec4  growAnchor;

vec4 getSample(vec4 xyzw);

vec4 getGrowSample(vec4 xyzw) {
  vec4 anchor = xyzw * growMask + growAnchor;

  vec4 position = getSample(xyzw);
  vec4 center = getSample(anchor);

  return mix(center, position, growScale);
}