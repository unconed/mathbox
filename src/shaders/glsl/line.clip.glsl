uniform float clipRange;
attribute vec2 strip;

varying float vClip;

// External
vec3 getPosition(vec2 xy);

vec3 clipPosition(vec3 pos) {

  // Sample end of line strip
  vec2 xy = vec2(strip.y, position.y);
  vec3 end = getPosition(xy);
  
  // Clip end
  float d = length(pos - end);
  vClip = d / clipRange - 1.0;

  // Passthrough position
  return pos;
}