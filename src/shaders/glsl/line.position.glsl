uniform float worldUnit;
uniform float lineWidth;
uniform float lineDepth;
uniform float focusDepth;

uniform vec4 geometryClip;
attribute vec2 line;
attribute vec4 position4;

#ifdef LINE_STROKE
varying float vClipStrokeWidth;
varying float vClipStrokeIndex;
varying vec3  vClipStrokeEven;
varying vec3  vClipStrokeOdd;
varying vec3  vClipStrokePosition;
#endif

// External
vec3 getPosition(vec4 xyzw);

#ifdef LINE_CLIP
uniform float clipRange;
uniform vec2  clipStyle;
uniform float clipSpace;

attribute vec2 strip;

varying vec2 vClipEnds;

void clipEnds(vec4 xyzw, vec3 center, vec3 pos) {

  // Sample end of line strip
  vec4 xyzwE = vec4(strip.y, xyzw.yzw);
  vec3 end   = getPosition(xyzwE);

  // Sample start of line strip
  vec4 xyzwS = vec4(strip.x, xyzw.yzw);
  vec3 start = getPosition(xyzwS);

  // Measure length
  vec3 diff = end - start;
  float l = length(diff) * clipSpace;

  // Arrow length (=2.5x radius)
  float arrowSize = 1.25 * clipRange * lineWidth * worldUnit;

  vClipEnds = vec2(1.0);

  if (clipStyle.y > 0.0) {
    // Depth blend end
    float depth = focusDepth;
    if (lineDepth < 1.0) {
      float z = max(0.00001, -end.z);
      depth = mix(z, focusDepth, lineDepth);
    }
    
    // Absolute arrow length
    float size = arrowSize * depth;

    // Adjust clip range
    // Approach linear scaling with cubic ease the smaller we get
    float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);
    float scale = 1.0 - mini * mini * mini; 
    float invrange = 1.0 / (size * scale);
  
    // Clip end
    diff = normalize(end - center);
    float d = dot(end - pos, diff);
    vClipEnds.x = d * invrange - 1.0;
  }

  if (clipStyle.x > 0.0) {
    // Depth blend start
    float depth = focusDepth;
    if (lineDepth < 1.0) {
      float z = max(0.00001, -start.z);
      depth = mix(z, focusDepth, lineDepth);
    }
    
    // Absolute arrow length
    float size = arrowSize * depth;

    // Adjust clip range
    // Approach linear scaling with cubic ease the smaller we get
    float mini = clamp(1.0 - l / size * .333, 0.0, 1.0);
    float scale = 1.0 - mini * mini * mini; 
    float invrange = 1.0 / (size * scale);
  
    // Clip start 
    diff = normalize(center - start);
    float d = dot(pos - start, diff);
    vClipEnds.y = d * invrange - 1.0;
  }


}
#endif

const float epsilon = 1e-5;
void fixCenter(vec3 left, inout vec3 center, vec3 right) {
  if (center.z >= 0.0) {
    if (left.z < 0.0) {
      float d = (center.z - epsilon) / (center.z - left.z);
      center = mix(center, left, d);
    }
    else if (right.z < 0.0) {
      float d = (center.z - epsilon) / (center.z - right.z);
      center = mix(center, right, d);
    }
  }
}


void getLineGeometry(vec4 xyzw, float edge, out vec3 left, out vec3 center, out vec3 right) {
  vec4 delta = vec4(1.0, 0.0, 0.0, 0.0);

  center =                 getPosition(xyzw);
  left   = (edge > -0.5) ? getPosition(xyzw - delta) : center;
  right  = (edge < 0.5)  ? getPosition(xyzw + delta) : center;
}

vec3 getLineJoin(float edge, bool odd, vec3 left, vec3 center, vec3 right, float width) {
  vec2 join = vec2(1.0, 0.0);

  fixCenter(left, center, right);

  vec4 a = vec4(left.xy, right.xy);
  vec4 b = a / vec4(left.zz, right.zz);

  vec2 l = b.xy;
  vec2 r = b.zw;
  vec2 c = center.xy / center.z;

  vec4 d = vec4(l, c) - vec4(c, r);
  float l1 = dot(d.xy, d.xy);
  float l2 = dot(d.zw, d.zw);

  if (l1 + l2 > 0.0) {
    
    if (edge > 0.5 || l2 == 0.0) {
      vec2 nl = normalize(l - c);
      vec2 tl = vec2(nl.y, -nl.x);

#ifdef LINE_STROKE
      vClipStrokeEven = vClipStrokeOdd = normalize(left - center);
#endif
      join = tl;
    }
    else if (edge < -0.5 || l1 == 0.0) {
      vec2 nr = normalize(c - r);
      vec2 tr = vec2(nr.y, -nr.x);

#ifdef LINE_STROKE
      vClipStrokeEven = vClipStrokeOdd = normalize(center - right);
#endif
      join = tr;
    }
    else {
      // Limit join stretch for tiny segments
      float lmin2 = min(l1, l2) / (width * width);
      
      vec2 nl = normalize(d.xy);
      vec2 nr = normalize(d.zw);

      vec2 tl = vec2(nl.y, -nl.x);
      vec2 tr = vec2(nr.y, -nr.x);

      vec2 tc = normalize(tl + tr);
    
      float cosA = dot(nl, tc);
      float sinA = max(0.1, abs(dot(tl, tc)));
      float factor = cosA / sinA;
      float scale = sqrt(1.0 + min(lmin2, factor * factor));

#ifdef LINE_STROKE
      vec3 stroke1 = normalize(left - center);
      vec3 stroke2 = normalize(center - right);

      if (odd) {
        vClipStrokeEven = stroke1;
        vClipStrokeOdd  = stroke2;
      }
      else {
        vClipStrokeEven = stroke2;
        vClipStrokeOdd  = stroke1;
      }
#endif
      join = tc * scale;
    }
    return vec3(join, 0.0);
  }
  else {
    return vec3(0.0);
  }

}

vec3 getLinePosition() {
  vec3 left, center, right, join;

  float edge = line.x;
  float offset = line.y;

  vec4 p = min(geometryClip, position4);
  edge += max(0.0, position4.x - geometryClip.x);

  // Get position + adjacent neighbours
  getLineGeometry(p, edge, left, center, right);

#ifdef LINE_STROKE
  // Set parameters for line stroke fragment shader
  vClipStrokePosition = center;
  vClipStrokeIndex = p.x;
  bool odd = mod(p.x, 2.0) >= 1.0;
#else
  bool odd = true;
#endif

  // Divide line width up/down
  float width = lineWidth * 0.5;

  float depth = focusDepth;
  if (lineDepth < 1.0) {
    // Depth blending
    float z = max(0.00001, -center.z);
    depth = mix(z, focusDepth, lineDepth);
  }
  width *= depth;

  // Convert to world units
  width *= worldUnit;

  join = getLineJoin(edge, odd, left, center, right, width);

#ifdef LINE_STROKE
  vClipStrokeWidth = width;
#endif
  
  vec3 pos = center + join * offset * width;

#ifdef LINE_CLIP
  clipEnds(p, center, pos);
#endif

  return pos;
}
