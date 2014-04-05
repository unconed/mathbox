uniform float clipRange;
attribute vec2 strip;

varying float vClip;

// External
vec3 getPosition(vec2 xy);

vec3 clipPosition(vec3 pos) {

  // Sample end of line strip
  vec2 xyE = vec2(strip.y, position.y);
  vec3 end = getPosition(xyE);

  // Sample start of line strip
  vec2 xyS   = vec2(strip.x, position.y);
  vec3 start = getPosition(xyS);
  
  // Measure length and adjust clip range
  vec3 diff = end - start;
  float l = length(diff);
  float mini = clamp((3.0 - l / clipRange) * .333, 0.0, 1.0);
  float scale = 1.0 - mini * mini * mini;
  float range = clipRange * scale;
  
  // Clip end
  float d = length(pos - end);
  vClip = d / range - 1.0;

  // Passthrough position
  return pos;
}