uniform float lineWidth;
attribute vec2 line;

// External
vec3 getPosition(vec2 xy);

void getLineGeometry(vec2 xy, float edge, inout vec3 left, inout vec3 center, inout vec3 right) {
  vec2 delta = vec2(1.0, 0.0);

  center =                 getPosition(xy);
  left   = (edge > -0.5) ? getPosition(xy - delta) : center;
  right  = (edge < 0.5)  ? getPosition(xy + delta) : center;
}

vec3 getLineJoin(float edge, vec3 left, vec3 center, vec3 right) {
  vec3 bitangent;
  vec3 normal = center;

  vec3 legLeft = center - left;
  vec3 legRight = right - center;

  if (edge > 0.5) {
    bitangent = normalize(cross(normal, legLeft));
  }
  else if (edge < -0.5) {
    bitangent = normalize(cross(normal, legRight));
  }
  else {
    vec3 joinLeft = normalize(cross(normal, legLeft));
    vec3 joinRight = normalize(cross(normal, legRight));
    float dotLR = dot(joinLeft, joinRight);
    float scale = min(8.0, tan(acos(dotLR * .999) * .5) * .5);
    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);
  }
  
  return bitangent;
}

vec3 getLinePosition() {
  vec3 left, center, right, join;

  float edge = line.x;
  float offset = line.y;

  getLineGeometry(position.xy, edge, left, center, right);
  join = getLineJoin(edge, left, center, right);
  return center + join * offset * lineWidth;
}
