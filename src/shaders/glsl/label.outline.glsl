uniform float outlineExpand;
uniform float outlineStep;
uniform vec3  outlineColor;

varying float vPixelSize;

const float PIXEL_STEP = 255.0 / 16.0;

vec4 getLabelOutlineColor(vec4 color, vec4 sample) {
  float ps = vPixelSize * PIXEL_STEP;
  float os = outlineStep;

  float sdf = sample.r - .5 + outlineExpand;
  vec2  sdfs = vec2(sdf, sdf + os);
  vec2  alpha = clamp(sdfs * ps + .5, 0.0, 1.0);

  if (alpha.y <= 0.0) {
    discard;
  }

  vec3 blend = color.xyz;
  if (alpha.y > alpha.x) {
    blend = sqrt(mix(outlineColor * outlineColor, blend * blend, alpha.x));
  }
  
  return vec4(blend, alpha.y * color.a);
}
