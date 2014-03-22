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
  vec2 join = vec2(1.0, 0.0);

  if (center.z < 0.0) {
    vec4 a = vec4(left.xy, right.xy);
    vec4 b = a / vec4(left.zz, right.zz);

    vec2 l = b.xy;
    vec2 r = b.zw;
    vec2 c = center.xy / center.z;

    vec4 d = vec4(c, l) - vec4(r, c);
    float l1 = dot(d.xy, d.xy);
    float l2 = dot(d.zw, d.zw);

    if (l1 + l2 > 0.0) {
      
      if (edge > 0.5 || l1 == 0.0) {
        vec2 nl = normalize(l - c);
        vec2 tl = vec2(nl.y, -nl.x);

        join = tl;
      }
      else if (edge < -0.5 || l2 == 0.0) {
        vec2 nr = normalize(c - r);
        vec2 tr = vec2(nr.y, -nr.x);

        join = tr;
      }
      else {
        vec2 nl = normalize(d.xy);
        vec2 nr = normalize(d.zw);

        vec2 tl = vec2(nl.y, -nl.x);
        vec2 tr = vec2(nr.y, -nr.x);

        vec2 tc = normalize(tl + tr);
      
        float cosA = dot(nl, tc);
        float sinA = max(0.1, abs(dot(tl, tc)));
        float factor = cosA / sinA;
        float scale = sqrt(1.0 + factor * factor);

        join = tc * scale;
      }
    }
    else {
      return vec3(0.0);
    }
  }
    
  return vec3(join, 0.0);
}

vec3 getLinePosition() {
  vec3 left, center, right, join;

  float edge = line.x;
  float offset = line.y;

  getLineGeometry(position.xy, edge, left, center, right);
  join = getLineJoin(edge, left, center, right);
  return center + join * offset * lineWidth;
}
