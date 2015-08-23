uniform float polarBend;
uniform float polarFocus;
uniform float polarAspect;
uniform float polarHelix;

uniform mat4 viewMatrix;

vec4 getPolarPosition(vec4 position, inout vec4 stpq) {
  if (polarBend > 0.0) {

    if (polarBend < 0.001) {
      // Factor out large addition/subtraction of polarFocus
      // to avoid numerical error
      // sin(x) ~ x
      // cos(x) ~ 1 - x * x / 2
      vec2 pb = position.xy * polarBend;
      float ppbbx = pb.x * pb.x;
      return viewMatrix * vec4(
        position.x * (1.0 - polarBend + (pb.y * polarAspect)),
        position.y * (1.0 - .5 * ppbbx) - (.5 * ppbbx) * polarFocus / polarAspect,
        position.z + position.x * polarHelix * polarBend,
        1.0
      );
    }
    else {
      vec2 xy = position.xy * vec2(polarBend, polarAspect);
      float radius = polarFocus + xy.y;
      return viewMatrix * vec4(
        sin(xy.x) * radius,
        (cos(xy.x) * radius - polarFocus) / polarAspect,
        position.z + position.x * polarHelix * polarBend,
        1.0
      );
    }
  }
  else {
    return viewMatrix * vec4(position.xyz, 1.0);
  }
}