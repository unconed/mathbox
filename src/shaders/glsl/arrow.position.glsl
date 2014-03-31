uniform float arrowSize;
attribute vec3 arrow;

// External
vec3 getPosition(vec2 xy);

void getArrowGeometry(vec2 xy, out vec3 left, out vec3 right) {
  vec2 delta = vec2(1.0, 0.0);

  right = getPosition(xy);
  left  = getPosition(xy - delta);
}

mat4 getArrowMatrix(float size, vec3 left, vec3 right) {
  
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
  
  // Shrink arrows when vector gets too small, cubic ease asymptotically to y=x
  float mini = max(0.0, (3.0 - l / size) * .333);
  float scale = 1.0 - mini * mini * mini;
  
  // Size to 2.5:1 ratio
//  size *= scale;
  float sbt = size / 2.5;

  // Anchor at end position
  return mat4(vec4(n * sbt,  0),
              vec4(b * sbt,  0),
              vec4(t * size, 0),
              vec4(right,  1.0));
}

vec3 getArrowPosition() {
  vec3 left, right;

  getArrowGeometry(position.xy, left, right);
  mat4 matrix = getArrowMatrix(arrowSize, left, right);
  return (matrix * vec4(arrow, 1.0)).xyz;

}
