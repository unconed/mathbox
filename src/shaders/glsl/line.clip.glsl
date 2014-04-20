uniform float clipRange;
uniform vec2  clipStyle;
uniform float clipSpace;
attribute vec2 strip;

varying vec2 vClip;

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
  float l = length(diff) * clipSpace;
  float mini = clamp((3.0 - l / clipRange) * .333, 0.0, 1.0);
  float scale = 1.0 - mini * mini * mini;
  float range = clipRange * scale;
  
  vClip = vec2(1.0);
  
  if (clipStyle.y > 0.0) {
    // Clip end
    float d = length(pos - end);
    vClip.x = d / range - 1.0;
  }

  if (clipStyle.x > 0.0) {
    // Clip start 
    float d = length(pos - start);
    vClip.y = d / range - 1.0;
  }

  // Passthrough position
  return pos;
}