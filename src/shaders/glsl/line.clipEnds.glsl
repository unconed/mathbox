uniform float clipRange;
uniform vec2  clipStyle;
uniform float clipSpace;
uniform float lineWidth;

attribute vec2 strip;
//attribute vec2 position4;

varying vec2 vClipEnds;

// External
vec3 getPosition(vec4 xyzw);

void clipEndsPosition(vec3 pos) {

  // Sample end of line strip
  vec4 xyzwE = vec4(strip.y, position4.yzw);
  vec3 end   = getPosition(xyzwE);

  // Sample start of line strip
  vec4 xyzwS = vec4(strip.x, position4.yzw);
  vec3 start = getPosition(xyzwS);

  // Measure length and adjust clip range
  // Approach linear scaling with cubic ease the smaller we get
  vec3 diff = end - start;
  float l = length(vec2(length(diff), lineWidth)) * clipSpace;
  float mini = clamp((3.0 - l / clipRange) * .333, 0.0, 1.0);
  float scale = 1.0 - mini * mini * mini; 
  float range = clipRange * scale;
  
  vClipEnds = vec2(1.0);
  
  if (clipStyle.y > 0.0) {
    // Clip end
    float d = length(pos - end);
    vClipEnds.x = d / range - 1.0;
  }

  if (clipStyle.x > 0.0) {
    // Clip start 
    float d = length(pos - start);
    vClipEnds.y = d / range - 1.0;
  }
}