uniform float worldUnit;
uniform float lineDepth;
uniform float lineWidth;
uniform float focusDepth;

uniform vec4 geometryClip;
uniform float arrowSize;
uniform float arrowSpace;

attribute vec4 position4;
attribute vec3 arrow;
attribute vec2 attach;

// External
vec3 getPosition(vec4 xyzw, float canonical);

void getArrowGeometry(vec4 xyzw, float near, float far, out vec3 left, out vec3 right, out vec3 start) {
  right = getPosition(xyzw, 1.0);
  left  = getPosition(vec4(near, xyzw.yzw), 0.0);
  start = getPosition(vec4(far, xyzw.yzw), 0.0);
}

mat4 getArrowMatrix(vec3 left, vec3 right, vec3 start) {

  float depth = focusDepth;
  if (lineDepth < 1.0) {
    // Depth blending
    float z = max(0.00001, -right.z);
    depth = mix(z, focusDepth, lineDepth);
  }
    
  vec3 diff = left - right;
  float l = length(diff);
  if (l == 0.0) {
    return mat4(1.0, 0.0, 0.0, 0.0,
                0.0, 1.0, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0);
  }

  // Construct TBN matrix around shaft
  vec3 t = normalize(diff);
  vec3 n = normalize(cross(t, t.yzx + vec3(.1, .2, .3)));
  vec3 b = cross(n, t);
  
  // Shrink arrows when vector gets too small
  // Approach linear scaling with cubic ease the smaller we get
  float size = arrowSize * lineWidth * worldUnit * depth * 1.25;
  diff = right - start;
  l = length(diff) * arrowSpace;
  float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);
  float scale = 1.0 - mini * mini * mini;
  float range = size * scale;
  
  // Size to 2.5:1 ratio
  float rangeNB = range / 2.5;

  // Anchor at end position
  return mat4(vec4(n * rangeNB,  0),
              vec4(b * rangeNB,  0),
              vec4(t * range, 0),
              vec4(right,  1.0));
}

vec3 getArrowPosition() {
  vec3 left, right, start;
  
  vec4 p = min(geometryClip, position4);
  
  getArrowGeometry(p, attach.x, attach.y, left, right, start);
  mat4 matrix = getArrowMatrix(left, right, start);
  return (matrix * vec4(arrow.xyz, 1.0)).xyz;

}
