attribute vec2 surface;

// External
vec3 getPosition(vec2 xy);

void getSurfaceGeometry(vec2 xy, float edgeX, float edgeY, out vec3 left, out vec3 center, out vec3 right, out vec3 up, out vec3 down) {
  vec2 deltaX = vec2(1.0, 0.0);
  vec2 deltaY = vec2(0.0, 1.0);

  center =                  getPosition(xy);
  left   = (edgeX > -0.5) ? getPosition(xy - deltaX) : center;
  right  = (edgeX < 0.5)  ? getPosition(xy + deltaX) : center;
  up     = (edgeY > -0.5) ? getPosition(xy - deltaY) : center;
  down   = (edgeY < 0.5)  ? getPosition(xy + deltaY) : center;
}

vec3 getSurfaceNormal(vec3 left, vec3 center, vec3 right, vec3 up, vec3 down) {
  vec3 dx = right - left;
  vec3 dy = down - up;
  vec3 n = cross(dx, dy);
  if (length(n) > 0.0) {
    return normalize(cross(dx, dy));
  }
  return vec3(0.0, 1.0, 0.0);
}

varying vec3 vNormal;

vec3 getSurfacePositionNormal() {
  vec3 left, center, right, up, down;

  getSurfaceGeometry(position.xy, surface.x, surface.y, left, center, right, up, down);
  vNormal = getSurfaceNormal(left, center, right, up, down);
  
  return center;
}
